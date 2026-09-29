"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(
        "Missing password reset token. Please request a new reset link from the login page."
      );
      return;
    }

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.message ||
            "Failed to reset password. The link may be expired or invalid."
        );
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        "A network error occurred. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-5">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 space-y-2">
          <AlertCircle className="h-8 w-8 text-rose-600 mx-auto" />
          <h2 className="text-sm font-bold text-rose-900">
            Invalid Reset Link
          </h2>
          <p className="text-xs text-rose-700 leading-relaxed">
            No valid reset token was provided in the URL. Reset links are single-use and expire after 30 minutes.
          </p>
        </div>

        <Link
          href="/forgot-password"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all"
        >
          <span>Request New Reset Link</span>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <h2 className="text-base font-bold text-emerald-900">
            Password Reset Successfully
          </h2>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Your Prime Rides account password has been updated. You can now sign in with your new credentials.
          </p>
        </div>

        <Link
          href="/login"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Go to Sign In</span>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      {/* New Password */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
        >
          <Key className="h-3.5 w-3.5 text-blue-600" />
          <span>New Password</span>
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            disabled={loading}
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 pr-12 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={loading}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          Must be at least 8 characters long.
        </p>
      </div>

      {/* Confirm New Password */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
        >
          <Key className="h-3.5 w-3.5 text-blue-600" />
          <span>Confirm New Password</span>
        </label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (error) setError("");
          }}
          disabled={loading}
          className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 disabled:opacity-60"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-600 text-center flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit CTA */}
      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating Password...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            <span>Set New Password</span>
          </>
        )}
      </button>

      {/* Footer link */}
      <p className="mt-6 text-center text-xs font-semibold text-slate-500">
        Already know your password?{" "}
        <Link
          href="/login"
          className="font-bold text-blue-600 hover:text-blue-700 underline"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 text-slate-900 relative overflow-hidden">
      {/* Subtle atmospheric light background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50/80 via-slate-50 to-slate-100 pointer-events-none" />

      <div className="relative mx-auto w-full max-w-md">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        {/* Reset Password Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-block">
              <div className="relative h-14 w-[103px] mx-auto overflow-hidden rounded-2xl border border-slate-200/80 shadow-md">
                <Image
                  src="/prime-rides-logo.png"
                  alt="Prime Rides Logo"
                  fill
                  sizes="103px"
                  className="object-cover rounded-2xl"
                  priority
                />
              </div>
            </Link>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Create New Password
            </h1>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enter and confirm your new secure account password.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-xs font-semibold text-slate-500">
                  Loading secure reset session...
                </p>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
