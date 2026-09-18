import { AuthForm, AuthPage } from "@/components/auth/auth-page";

export default function RegisterPage() {
  return (
    <AuthPage mode="register">
      <AuthForm mode="register" />
    </AuthPage>
  );
}
