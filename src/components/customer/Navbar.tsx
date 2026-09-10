"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Car, User, Calendar, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const packageSubmenu = [
  { label: "Weekly Packages", href: "/packages/weekly", description: "Best for 7-day trips & getaways" },
  { label: "Monthly Packages", href: "/packages/monthly", description: "Long term 30-day corporate & personal rentals" },
  { label: "Yearly Packages", href: "/packages/yearly", description: "Annual subscription deals with maintenance" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPackagesOpen, setIsPackagesOpen] = useState(false);
  const [mobilePackagesOpen, setMobilePackagesOpen] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setIsPackagesOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setIsPackagesOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    };
  }, []);

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
          <Link
            href="/"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600 active:text-blue-700"
          >
            Home
          </Link>
          <Link
            href="/cars"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600 active:text-blue-700"
          >
            Cars
          </Link>
          <Link
            href="/#locations"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600 active:text-blue-700"
          >
            Locations
          </Link>

          {/* Packages Dropdown */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIsPackagesOpen(!isPackagesOpen)}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600 focus:outline-none"
              aria-expanded={isPackagesOpen}
            >
              <span>Packages</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isPackagesOpen ? "rotate-180 text-blue-600" : "text-slate-500"}`} />
            </button>

            {isPackagesOpen && (
              <div
                className="absolute left-0 top-full pt-2 w-72 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl">
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Rental Packages
                  </div>
                  {packageSubmenu.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setIsPackagesOpen(false)}
                      className="group flex flex-col gap-0.5 rounded-xl p-2.5 transition-all hover:bg-blue-50/80"
                    >
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-800 group-hover:text-blue-600">
                        <span>{sub.label}</span>
                        <span className="text-xs text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">→</span>
                      </div>
                      <span className="text-xs text-slate-500 line-clamp-1">{sub.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/#why-us"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600 active:text-blue-700"
          >
            Why Us
          </Link>
          <Link
            href="/#contact"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600 active:text-blue-700"
          >
            Contact
          </Link>
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
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            >
              Home
            </Link>
            <Link
              href="/cars"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            >
              Cars
            </Link>
            <Link
              href="/#locations"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            >
              Locations
            </Link>

            {/* Mobile Packages Expandable Submenu */}
            <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/50 my-0.5">
              <button
                type="button"
                onClick={() => setMobilePackagesOpen(!mobilePackagesOpen)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-600"
              >
                <span>Packages</span>
                <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${mobilePackagesOpen ? "rotate-180 text-blue-600" : ""}`} />
              </button>

              {mobilePackagesOpen && (
                <div className="flex flex-col gap-1 px-3 pb-3 pt-1 border-t border-slate-200/60 bg-white">
                  {packageSubmenu.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/#why-us"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            >
              Why Us
            </Link>
            <Link
              href="/#contact"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-base font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            >
              Contact
            </Link>

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