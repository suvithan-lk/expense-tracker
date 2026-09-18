import type { ReactNode } from "react";
import { AuthForm } from "@/components/auth/auth-form";

type AuthPageProps = {
  mode: "login" | "register";
  children?: ReactNode;
};

export function AuthPage({ mode, children }: AuthPageProps) {
  const isRegister = mode === "register";

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="auth-brand"><span className="brand-mark">fa</span><span>folia</span></div>
        <div className="auth-story-copy">
          <p className="section-kicker">A clearer relationship with money</p>
          <h1>Make space for what matters.</h1>
          <p>Track the everyday, understand the patterns, and make your next financial decision with a little more calm.</p>
        </div>
        <div className="auth-story-footer"><span>PERSONAL FINANCE / 2026</span><span>BUILT FOR SMALL, STEADY WINS</span></div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          <p className="auth-kicker">{isRegister ? "Start your workspace" : "Welcome back"}</p>
          <h2>{isRegister ? "A better view starts here." : "Your money, in focus."}</h2>
          <p className="auth-description">{isRegister ? "Create a private space for your income, expenses, and plans." : "Sign in to pick up where you left off."}</p>
          {children}
          <p className="auth-disclaimer">Folia provides transparent calculations and educational insights, not regulated financial advice.</p>
        </div>
      </section>
    </main>
  );
}

export { AuthForm };
