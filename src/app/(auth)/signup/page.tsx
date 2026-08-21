import Link from "next/link";
import { Car } from "lucide-react";
import GoogleButton from "@/components/auth/GoogleButton";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold"
          >
            <Car className="h-6 w-6" />
            PrimeRides
          </Link>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Create your Prime Rides account
            </p>
          </div>

          {/* Signup Form */}
          <form className="mt-8 space-y-5">

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

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
              <label className="text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className="h-11 w-full rounded-lg bg-black text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Create Account
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

          {/* Google */}
          <GoogleButton />

          {/* Login */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline"
            >
              Login
            </Link>
          </p>

        </div>

        {/* Back */}
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
