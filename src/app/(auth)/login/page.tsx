import { AuthForm, AuthPage } from "@/components/auth/auth-page";

export default function LoginPage() {
  return (
    <AuthPage mode="login">
      <AuthForm mode="login" />
    </AuthPage>
  );
}
