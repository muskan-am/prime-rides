import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, MapPin, Phone, Mail, ArrowRight, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#0A1128] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-12 w-[88px] overflow-hidden rounded-xl shadow-sm border border-white/10">
                <Image
                  src="/prime-rides-logo.png"
                  alt="Prime Rides Logo"
                  fill
                  sizes="88px"
                  className="object-cover rounded-xl"
                />
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-slate-400">
              Book your car. Hit the road. Enjoy the journey. Premium self-drive mobility platform delivering seamless rentals.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/50 rounded-lg px-3 py-1.5 w-fit">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <span>Verified & Well-Maintained Fleet</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Explore Fleet</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/cars" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                  <span>All Vehicles</span>
                </Link>
              </li>
              <li>
                <Link href="/cars?type=Sedan" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                  <span>Executive Sedans</span>
                </Link>
              </li>
              <li>
                <Link href="/cars?type=SUV" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                  <span>Luxury SUVs</span>
                </Link>
              </li>
              <li>
                <Link href="/packages/monthly" className="transition-colors hover:text-white flex items-center gap-1.5">
                  <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                  <span>Monthly Packages</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Account */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Customer Portal</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-white">My Bookings</Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-white">Customer Login</Link>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-white">Create Account</Link>
              </li>
              <li>
                <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 pt-2">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Key Hubs & Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Prime Hubs</h3>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-200 bg-[#111B3A] border border-slate-700/50 rounded-lg px-2.5 py-1">
                <MapPin className="h-3 w-3 text-blue-400" /> Delhi NCR
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-200 bg-[#111B3A] border border-slate-700/50 rounded-lg px-2.5 py-1">
                <MapPin className="h-3 w-3 text-blue-400" /> Goa
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-200 bg-[#111B3A] border border-slate-700/50 rounded-lg px-2.5 py-1">
                <MapPin className="h-3 w-3 text-blue-400" /> Bangalore
              </span>
            </div>

            <div className="pt-3 text-xs text-slate-400 space-y-1.5">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-blue-400" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-400" />
                <span>support@primerides.com</span>
              </p>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Prime Rides Technologies. All rights reserved.</p>
          <p className="text-slate-500">Self-Drive Mobility & Luxury Car Rentals</p>
        </div>

      </div>
    </footer>
  );
}