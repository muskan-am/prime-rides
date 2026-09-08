"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Car, User, Calendar } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Cars", href: "/cars" },
  { label: "Locations", href: "/#locations" },
  { label: "Packages", href: "/#packages" },
  { label: "Monthly Plans", href: "/#monthly-plans" },
  { label: "Why Us", href: "/#why-us" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform hover:scale-[1.01]"
        >
          <div className="relative h-11 w-[80px] sm:h-12 sm:w-[88px] overflow-hidden rounded-xl border border-slate-200/60 shadow-sm">
            <Image
              src="/prime-rides-logo.png"
              alt="Prime Rides - Premium Self-Drive Rentals"
              fill
              sizes="88px"
              className="object-cover rounded-xl"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600 active:text-blue-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 transition-all hover:bg-slate-100 hover:border-slate-300"
          >
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>My Bookings</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
          >
            <User className="h-4 w-4 text-slate-500" />
            <span>Account</span>
          </Link>

          <Link
            href="/cars"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 via-blue-900 to-blue-600 px-5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
          >
            <Car className="h-4 w-4" />
            <span>Book a Car</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pb-6 pt-3 shadow-xl lg:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-slate-100" />

            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
              >
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>My Bookings</span>
              </Link>

              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
              >
                <User className="h-4 w-4 text-slate-500" />
                <span>Login / Signup</span>
              </Link>

              <Link
                href="/cars"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-blue-600 text-sm font-bold text-white shadow-md"
              >
                <Car className="h-4 w-4" />
                <span>Book a Car</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}