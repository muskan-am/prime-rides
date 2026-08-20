import Link from "next/link";
import { Car } from "lucide-react";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold"
          >
            <Car className="h-6 w-6" />
            PrimeRides
          </Link>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Login to continue to Prime Rides
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm font-medium">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                type="password"
                placeholder="Enter your password"
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-black text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Login
            </button>

          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />

            <span className="text-xs text-muted-foreground">
              OR
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google Login */}
          <GoogleButton/>

          {/* Signup */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground hover:underline"
            >
              Create Account
            </Link>
          </p>

        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </main>
  );
}