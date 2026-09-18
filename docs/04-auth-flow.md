# Authentication Flow

No third-party identity provider — JWT access tokens plus server-persisted, rotating refresh tokens, implemented in `Services/Auth/AuthService.cs` and `JwtTokenService.cs`.

## 1. Register

`POST /api/auth/register` `{ name, email, password }`

- Validates name/email/password (min 8 chars), rejects a duplicate email with `409`.
- Hashes the password with `IPasswordHasherService` (never stored or returned in plaintext).
- Seeds the 5 default income categories and 12 default expense categories for the new user (`Common/DefaultCategories.cs`).
- Issues a token pair (see step 3) and returns `AuthPayload`.

## 2. Login

`POST /api/auth/login` `{ email, password }` → `401` on any mismatch (no distinction between "no such user" and "wrong password", to avoid leaking which emails are registered). On success, issues a new token pair.

## 3. Token issuance

Every register/login/refresh calls `AuthService.IssueTokensAsync`, which creates **two independent tokens**:

| Token | Format | Lifetime | Where it lives |
|---|---|---|---|
| Access token | JWT (HS256), claims `sub`, `email`, `name`, `jti` | `Jwt:ExpiryMinutes` (default 60 min) | `Authorization: Bearer` header on every API call |
| Refresh token | Opaque random 64-byte value, base64-encoded | `Jwt:RefreshTokenExpiryDays` (default 30 days) | `localStorage` on the client; **SHA-256 hash only** in the `RefreshTokens` table |

The raw refresh token is returned to the client exactly once, at issuance — the server can never reconstruct it from the stored hash, only verify a presented value against it.

## 4. Authenticated request

```
Authorization: Bearer <accessToken>
```

Validated by the standard ASP.NET Core JWT bearer middleware (`ValidateIssuer`, `ValidateAudience`, `ValidateLifetime`, `ClockSkew = Zero`). A missing/expired/invalid token produces a `401` with a JSON body (a custom `OnChallenge` handler, since the default challenge response has no body).

## 5. Silent refresh

`POST /api/auth/refresh` `{ refreshToken }`

1. The presented token is hashed and looked up by hash.
2. If not found, already `RevokedAt`, or past `ExpiresAt` → `401`.
3. Otherwise the old row is marked `RevokedAt = now` (**rotation** — a refresh token can only ever be used once) and a brand-new access + refresh pair is issued for the same user.

On the frontend (`src/lib/api/client.ts`), any API response with status `401` (other than to `/login`, `/register`, or `/refresh` itself) triggers exactly one call to `/api/auth/refresh`, shared across concurrent in-flight requests via a single cached promise, and the original request is retried once with the new access token. If the refresh call itself fails, the session is cleared and the user is redirected to `/login`.

Because rotation revokes the old token immediately, a stolen refresh token that gets replayed after the legitimate client has already refreshed will fail — the attacker and the legitimate user can't both keep using the same refresh token indefinitely.

## 6. Logout

`POST /api/auth/logout` `{ refreshToken }` — revokes that one token server-side (`RevokedAt = now`) and always returns `204`, whether or not the token was valid (no information leakage about token validity). The frontend also clears `localStorage` and redirects to `/login` regardless of whether the server call succeeds.

## Frontend storage

- `token`, `refreshToken`, and the current `user` are stored in `localStorage` (`src/lib/auth/session.ts`) — simple and sufficient for this app's threat model, at the cost of being readable by any script running on the page (no XSS-hardened `httpOnly` cookie storage). A production-hardened deployment would move the refresh token to an `httpOnly`, `Secure`, `SameSite=Strict` cookie instead.
- Route protection is client-side (`src/components/layout/app-shell.tsx`): it reads the token via `useSyncExternalStore`, redirects unauthenticated users away from any non-public route to `/login`, and redirects an authenticated user away from `/login`/`/register` to `/dashboard`.

## Not implemented

Email verification, password reset, and multi-device/"log out everywhere" token-family revocation are not built — every refresh token is independent, so logout only revokes the one token supplied.
