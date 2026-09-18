"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login, register } from "@/lib/auth/api";
import { setSession } from "@/lib/auth/session";

type AuthMode = "login" | "register";

type AuthFormValues = {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

function getAuthSchema(mode: AuthMode) {
  return z
    .object({
      name: z.string().trim().max(80, "Name must be 80 characters or less.").optional(),
      email: z.string().trim().email("Enter a valid email address."),
      password: z.string().min(8, "Password must be at least 8 characters."),
      confirmPassword: z.string().optional(),
    })
    .superRefine((values, context) => {
      if (mode === "register" && values.name === "") {
        context.addIssue({ code: "custom", path: ["name"], message: "Enter your name." });
      }
      if (values.confirmPassword && values.confirmPassword !== values.password) {
        context.addIssue({ code: "custom", path: ["confirmPassword"], message: "Passwords do not match." });
      }
    });
}

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isRegister = mode === "register";
  const { register: registerField, handleSubmit, formState: { errors } } = useForm<AuthFormValues>({
    resolver: zodResolver(getAuthSchema(mode)),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: AuthFormValues) {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const response = isRegister
        ? await register({ name: values.name?.trim() ?? "", email: values.email, password: values.password })
        : await login({ email: values.email, password: values.password });
      const payload = response.data;

      if (!payload?.token || !payload.user) {
        if (isRegister) {
          router.push("/login?registered=1");
          return;
        }
        throw new Error("The server returned an incomplete authentication response.");
      }

      setSession(payload.token, payload.refreshToken, payload.user);
      router.replace("/dashboard");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {isRegister && (
        <div className="field-group">
          <label htmlFor="name">Your name</label>
          <input id="name" type="text" autoComplete="name" placeholder="e.g. Suvit Kumar" {...registerField("name", { required: "Enter your name." })} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
      )}
      <div className="field-group">
        <label htmlFor="email">Email address</label>
        <input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...registerField("email")} />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>
      <div className="field-group">
        <div className="field-label-row"><label htmlFor="password">Password</label>{!isRegister && <Link href="/register">Need an account?</Link>}</div>
        <div className="password-input-wrap"><input id="password" type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} placeholder="At least 8 characters" {...registerField("password")} /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}><span className={`eye-icon ${showPassword ? "eye-icon-open" : ""}`} aria-hidden="true" /></button></div>
        {errors.password && <p className="field-error">{errors.password.message}</p>}
      </div>
      {isRegister && (
        <div className="field-group">
          <label htmlFor="confirmPassword">Confirm password</label>
          <div className="password-input-wrap"><input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" {...registerField("confirmPassword")} /><button className="password-toggle" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={showConfirmPassword}><span className={`eye-icon ${showConfirmPassword ? "eye-icon-open" : ""}`} aria-hidden="true" /></button></div>
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>
      )}
      {serverError && <p className="form-error" role="alert">{serverError}</p>}
      <button className="auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Working..." : isRegister ? "Create your account" : "Continue to Folia"}
        {!isSubmitting && <span aria-hidden="true">↗</span>}
      </button>
      <p className="auth-switch">
        {isRegister ? "Already have an account?" : "New to Folia?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link>
      </p>
    </form>
  );
}
