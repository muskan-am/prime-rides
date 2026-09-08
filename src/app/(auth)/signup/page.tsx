import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, Mail, Key, ShieldCheck } from "lucide-react";
import GoogleButton from "@/components/auth/GoogleButton";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 text-slate-900 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50/80 via-slate-50 to-slate-100 pointer-events-none" />

      <div className="relative mx-auto w-full max-w-md">

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600" />
            <span>Back to Prime Rides</span>
          </Link>
        </div>

        {/* Signup Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

          {/* Header */}
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
              Create Customer Account
            </h1>

            <p className="text-xs text-slate-500">
              Join Prime Rides for self-drive mobility across India
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-4">

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-blue-600" />
                <span>Full Name</span>
              </label>

              <input
                type="text"
                placeholder="John Doe"
                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                <span>Email Address</span>
              </label>

              <input
                type="email"
                placeholder="name@domain.com"
                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-blue-600" />
                <span>Create Password</span>
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Create Account</span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Google Button */}
          <GoogleButton />

          {/* Link */}
          <p className="mt-6 text-center text-xs font-semibold text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
