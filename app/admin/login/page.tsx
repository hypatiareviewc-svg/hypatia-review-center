"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        let message = "Login failed. Please try again.";
        try {
          const data = (await response.json()) as { message?: string };
          if (data.message) message = data.message;
        } catch {
          // response body was empty or not JSON — use default message
        }
        throw new Error(message);
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)]">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,41,75,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(20,41,75,0.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Decorative gradient orbs */}
      <div
        className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--secondary), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -right-40 h-[24rem] w-[24rem] rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--primary), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Login card */}
      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_64px_rgba(16,24,40,0.10)]">
          {/* Top: Logo + branding */}
          <div className="relative flex flex-col items-center px-8 pb-6 pt-10">
            {/* Accent line */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)]" />

            {/* Logo */}
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-[var(--border)] shadow-md">
              <Image
                src="/logo1.png"
                alt="Hypatia Review Center"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Branding */}
            <h1 className="mt-5 font-serif text-2xl font-bold text-[var(--primary)]">
              Hypatia Review Center
            </h1>
            <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.28em] text-[var(--secondary)]">
              Admin Dashboard
            </p>

            {/* Divider */}
            <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
          </div>

          {/* Bottom: Login form */}
          <form
            onSubmit={onSubmit}
            className="grid gap-4 px-8 pb-8 pt-2"
          >
            {/* Username */}
            <label className="grid gap-1.5 text-sm">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Username
              </span>
              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="focus-ring w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-4 text-sm placeholder:text-[var(--muted)]/50"
                  {...register("username")}
                />
              </div>
              {errors.username ? (
                <span className="text-xs text-red-400">{errors.username.message}</span>
              ) : null}
            </label>

            {/* Password */}
            <label className="grid gap-1.5 text-sm">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Password
              </span>
              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="focus-ring w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-11 text-sm placeholder:text-[var(--muted)]/50"
                  {...register("password")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--foreground)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <span className="text-xs text-red-400">{errors.password.message}</span>
              ) : null}
            </label>

            {/* Server error */}
            {serverError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                {serverError}
              </div>
            ) : null}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="focus-ring mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-contrast)] shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Footer note */}
            <p className="mt-2 text-center text-[0.65rem] leading-5 text-[var(--muted)]">
              Access is restricted to authorized administrators only.
            </p>
          </form>
        </div>

        {/* Bottom branding */}
        <p className="mt-6 text-center text-[0.6rem] uppercase tracking-[0.24em] text-[var(--muted)]/50">
          &copy; {new Date().getFullYear()} Hypatia Review Center
        </p>
      </div>
    </div>
  );
}
