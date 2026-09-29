"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok && !data.success) {
        setError(data.message || "Failed to send reset email. Please try again.");
        return;
      }

      setSuccessMessage(
        data.message ||
          "If an account exists with this email, a password reset link has been sent."
      );
      setEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Forgot Password Card */}
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
              Forgot Your Password?
            </h1>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Enter your registered email address and we&apos;ll send you a secure password reset link.
            </p>
          </div>

          {/* Success Message Banner */}
          {successMessage ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <h2 className="text-sm font-bold text-emerald-900">
                  Reset Link Sent
                </h2>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  {successMessage}
                </p>
                <p className="text-[11px] text-emerald-600/80 pt-1">
                  Please check your inbox (and spam folder). The link expires in 30 minutes.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all"
                >
                  <span>Return to Sign In</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setSuccessMessage("")}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-2"
                >
                  Try another email address
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
                >
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                  <span>Registered Email</span>
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
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
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              {/* Footer link */}
              <p className="mt-6 text-center text-xs font-semibold text-slate-500">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-bold text-blue-600 hover:text-blue-700 underline"
                >
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
