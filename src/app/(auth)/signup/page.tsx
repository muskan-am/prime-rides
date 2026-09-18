"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Key,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import GoogleButton from "@/components/auth/GoogleButton";

export default function SignupPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Clear previous messages
    setError("");
    setSuccess("");

    // -----------------------------
    // Frontend validation
    // -----------------------------

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Full name must contain at least 2 characters.");
      return;
    }

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // -----------------------------
    // Submit signup request
    // -----------------------------

    try {
      setLoading(true);

      console.log("Signup request started");

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();

      console.log("Signup response:", data);

      // -----------------------------
      // API error
      // -----------------------------

      if (!response.ok) {
        setError(
          data?.message ||
            "Unable to create your account. Please try again."
        );
        return;
      }

      // -----------------------------
      // Success
      // -----------------------------

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      // Clear form
      setName("");
      setEmail("");
      setPassword("");

      // Redirect after short delay
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1200);
    } catch (error) {
      console.error("Signup request failed:", error);

      setError(
        "Unable to connect to the server. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">

      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50/80 via-slate-50 to-slate-100" />

      {/* Content */}
      <div className="relative mx-auto w-full max-w-md">

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600" />

            <span>Back to Prime Rides</span>
          </Link>
        </div>

        {/* Signup Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

          {/* Header */}
          <div className="space-y-3 text-center">

            {/* Logo */}
            <Link
              href="/"
              className="inline-block"
              aria-label="Prime Rides Home"
            >
              <div className="relative mx-auto h-14 w-[103px] overflow-hidden rounded-2xl border border-slate-200/80 shadow-md">
                <Image
                  src="/prime-rides-logo.png"
                  alt="Prime Rides Logo"
                  fill
                  sizes="103px"
                  className="rounded-2xl object-cover"
                  priority
                />
              </div>
            </Link>

            {/* Heading */}
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Create Customer Account
            </h1>

            {/* Subtitle */}
            <p className="text-xs text-slate-500">
              Join Prime Rides for self-drive mobility across India
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              role="status"
              className="mt-6 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{success}</span>
            </div>
          )}

          {/* Signup Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-4"
          >

            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                <User className="h-3.5 w-3.5 text-blue-600" />

                <span>Full Name</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="John Doe"
                autoComplete="name"
                disabled={loading}
                required
                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                <Mail className="h-3.5 w-3.5 text-blue-600" />

                <span>Email Address</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="name@domain.com"
                autoComplete="email"
                disabled={loading}
                required
                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                <Key className="h-3.5 w-3.5 text-blue-600" />

                <span>Create Password</span>
              </label>

              <div className="relative">

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                  minLength={8}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 pr-12 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {/* Show / Hide Password */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>

              </div>

              <p className="text-[11px] text-slate-400">
                Password must be at least 8 characters.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />

                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Google Authentication */}
          <GoogleButton />

          {/* Login Link */}
          <p className="mt-6 text-center text-xs font-semibold text-slate-500">
            Already have an account?{" "}

            <Link
              href="/login"
              className="font-bold text-blue-600 underline transition-colors hover:text-blue-700"
            >
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}