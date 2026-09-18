"use client";

import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { ArrowLeft, Lock, Mail, Key } from "lucide-react";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email address or password.");
        setLoading(false);
        return;
      }

      // Fetch active session to determine role and redirect
      const res = await fetch("/api/auth/session");
      const session = await res.json();

      if (session?.user?.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get("callbackUrl") || "/";
        window.location.href = callbackUrl;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
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
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600" />
            <span>Back to Prime Rides</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

          {/* Logo & Title Header */}
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
              Welcome Back
            </h1>

            <p className="text-xs text-slate-500">
              Sign in to manage your bookings and self-drive rentals
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-8 space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                <span>Email Address</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@domain.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-blue-600" />
                  <span>Password</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot?
                </Link>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-600 text-center">
                {error}
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              <span>{loading ? "Verifying..." : "Sign In to Account"}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Google Login */}
          <GoogleButton />

          {/* Footer link */}
          <p className="mt-6 text-center text-xs font-semibold text-slate-500">
            Don't have an account yet?{" "}
            <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700 underline">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}