"use client";

import Link from "next/link";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your administrator email and password.");
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

      // Fetch active session to verify ADMIN role
      const res = await fetch("/api/auth/session");
      const session = await res.json();

      if (session?.user?.role !== "ADMIN") {
        // User logged in with valid credentials, but is NOT an ADMIN
        // Immediately sign them out to prevent session contamination on admin portal
        await signOut({ redirect: false });
        setError("Access Denied: You do not have administrator permissions.");
        setLoading(false);
        return;
      }

      // User verified as ADMIN -> redirect to admin dashboard
      window.location.href = "/admin";
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900 relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Subtle brand ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[500px] sm:h-[600px] bg-gradient-to-tr from-blue-600/5 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 space-y-6">
        {/* Main Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/50 space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-block">
              <div className="relative h-12 w-[88px] mx-auto overflow-hidden rounded-xl border border-slate-200/80 shadow-sm">
                <Image
                  src="/prime-rides-logo.png"
                  alt="Prime Rides Logo"
                  fill
                  sizes="88px"
                  className="object-cover rounded-xl"
                  priority
                />
              </div>
            </Link>

            <div className="pt-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
                ADMIN PORTAL
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-[#0A1128] tracking-tight">
              Welcome back
            </h1>

            <p className="text-sm font-medium text-slate-500">
              Sign in to manage Prime Rides.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="name@primerides.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-semibold text-slate-900 outline-none transition-all duration-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-11 text-sm font-semibold text-slate-900 outline-none transition-all duration-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 text-center">
                {error}
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-colors duration-200 disabled:opacity-50"
            >
              <Lock className="h-4 w-4 opacity-80" />
              <span>{loading ? "Signing in..." : "Sign in"}</span>
            </button>
          </form>

          {/* Security Note */}
          <p className="text-center text-[11px] font-medium text-slate-400 pt-1">
            Authorized administrators only.
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Prime Rides website</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
