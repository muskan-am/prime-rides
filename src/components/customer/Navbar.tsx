"use client";

import Link from "next/link";
import { Menu, X, Car, User, Calendar, ChevronDown, LogOut, Shield, Settings, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import NotificationBell from "@/components/notifications/NotificationBell";
import BrandLogo from "@/components/common/BrandLogo";

const packageSubmenu = [
  { label: "Weekly Packages", href: "/packages/weekly", description: "Best for 7-day trips & getaways" },
  { label: "Monthly Packages", href: "/packages/monthly", description: "Long term 30-day corporate & personal rentals" },
  { label: "Yearly Packages", href: "/packages/yearly", description: "Annual subscription deals with maintenance" },
];

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPackagesOpen, setIsPackagesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mobilePackagesOpen, setMobilePackagesOpen] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const userDropdownTimeout = useRef<NodeJS.Timeout | null>(null);

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
      if (userDropdownTimeout.current) clearTimeout(userDropdownTimeout.current);
    };
  }, []);

  const isLoggedIn = status === "authenticated" && Boolean(session?.user);
  const isAdmin = session?.user?.role === "ADMIN";
  const displayName = isAdmin
    ? (session?.user?.name || "Prime Rides Admin")
    : (session?.user?.name || session?.user?.email?.split("@")[0] || "Account");

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent px-3 sm:px-6 py-2.5 sm:py-3 flex justify-center pointer-events-none transition-all">
      <div className="pointer-events-auto mx-auto flex w-full max-w-7xl items-center justify-between gap-3 sm:gap-6 rounded-full border border-white/10 bg-neutral-900/85 backdrop-blur-2xl px-4 sm:px-6 py-2 shadow-2xl text-white">

        {/* Brand Logo */}
        <Link
          href="/"
          className="group relative flex items-center transition-transform hover:scale-105 active:scale-95 shrink-0"
          aria-label="Prime Rides Home"
        >
          <BrandLogo variant="white" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 sm:gap-2 md:flex">
          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white relative after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-blue-500 after:rounded-full transition-all duration-150"
          >
            Home
          </Link>
          <Link
            href="/cars"
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-150"
          >
            Cars
          </Link>
          <Link
            href="/#locations"
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-150"
          >
            Locations
          </Link>

          {/* Packages Dropdown */}
          <div
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* <button
              type="button"
              onClick={() => setIsPackagesOpen(!isPackagesOpen)}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 group-hover:text-white hover:text-white group-hover:bg-white/10 hover:bg-white/10 rounded-full transition-all duration-150 focus:outline-none cursor-pointer"
              aria-expanded={isPackagesOpen}
            >
              <span>Packages</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:text-white ${
                  isPackagesOpen ? "rotate-180 text-blue-300" : ""
                }`}
              />
            </button> */}

            {/* Dropdown Menu */}
            <div
              className={`absolute left-0 top-full pt-2 w-72 z-50 transition-all duration-150 ${
                isPackagesOpen
                  ? "block opacity-100 translate-y-0"
                  : "hidden group-hover:block opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
              }`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="rounded-2xl border border-slate-700/60 bg-[#070E22]/95 p-2 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl text-white">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-blue-400 border-b border-white/10 mb-1">
                  Rental Packages
                </div>
                {packageSubmenu.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setIsPackagesOpen(false)}
                    className="group/item flex flex-col gap-0.5 rounded-xl p-2.5 transition-all hover:bg-blue-600/20 cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white group-hover/item:text-blue-400">
                      <span>{sub.label}</span>
                      <span className="text-xs text-blue-400 opacity-0 transition-opacity group-hover/item:opacity-100">→</span>
                    </div>
                    <span className="text-[11px] text-slate-300 line-clamp-1">{sub.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/#why-us"
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-150"
          >
            Why Us
          </Link>
          <Link
            href="/#contact"
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-150"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 sm:gap-2.5 md:flex">
          {/* Search Icon Button */}
          <Link
            href="/cars"
            className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-all"
            aria-label="Search Cars"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Notification Bell */}
          <NotificationBell />

          {isLoggedIn ? (
            /* Logged in User Profile Avatar Dropdown (Only first letter circular avatar) */
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User Account Menu"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-blue-600/30 ring-2 ring-white/15 transition-all hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
              >
                <span>{displayName.charAt(0).toUpperCase()}</span>
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsUserMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-full pt-2 w-64 max-w-[calc(100vw-2rem)] z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                    <div className="rounded-2xl border border-slate-700/60 bg-[#070E22]/95 p-3 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl text-white">
                      <div className="px-3 py-2 border-b border-white/10 mb-1.5 min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {isAdmin ? "Prime Rides Admin" : (session?.user?.name || "Logged In")}
                        </p>
                        <p className="text-[11px] text-slate-300 truncate">{session?.user?.email}</p>
                        {isAdmin && (
                          <span className="mt-1 inline-block rounded bg-blue-600/30 border border-blue-400/40 px-2 py-0.5 text-[10px] font-black uppercase text-blue-300">
                            Administrator
                          </span>
                        )}
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/15 hover:text-white transition-colors"
                      >
                        <Calendar className="h-4 w-4 text-blue-400 shrink-0" />
                        <span>My Bookings</span>
                      </Link>

                      <Link
                        href="/notification-preferences"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/15 hover:text-white transition-colors"
                      >
                        <Settings className="h-4 w-4 text-blue-400 shrink-0" />
                        <span>Notification Settings</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-blue-600/30 hover:text-white transition-colors"
                        >
                          <Shield className="h-4 w-4 text-blue-400 shrink-0" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <div className="my-1.5 border-t border-white/10" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition-colors"
                      >
                        <LogOut className="h-4 w-4 text-rose-400 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-all"
            >
              <User className="h-3.5 w-3.5 text-blue-400" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Action CTA Pill Button */}
          <Link
            href="/cars"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 text-xs sm:text-sm shadow-lg shadow-blue-600/40 transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
          >
            <Car className="h-4 w-4" />
            <span>Book a Car</span>
            <span className="text-xs leading-none">→</span>
          </Link>
        </div>

        {/* Mobile Actions & Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {isLoggedIn && <NotificationBell />}
          <Link
            href="/cars"
            className="inline-flex h-8 items-center rounded-full bg-blue-600 text-white px-3 text-[11px] font-bold shadow-md shadow-blue-600/40"
          >
            Book
          </Link>
          <button
            type="button"
            className="rounded-full p-2 text-white hover:bg-white/15 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="pointer-events-auto absolute top-full mt-2 w-[calc(100%-2rem)] max-w-md rounded-3xl border border-slate-700/60 bg-[#0A1128]/98 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl text-white md:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Home
            </Link>
            <Link
              href="/cars"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Cars
            </Link>
            <Link
              href="/#locations"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Locations
            </Link>

            {/* Mobile Packages Expandable */}
            <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 my-0.5">
              <button
                type="button"
                onClick={() => setMobilePackagesOpen(!mobilePackagesOpen)}
                className="flex w-full items-center justify-between px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                <span>Packages</span>
                <ChevronDown className={`h-4 w-4 text-blue-400 transition-transform ${mobilePackagesOpen ? "rotate-180" : ""}`} />
              </button>

              {mobilePackagesOpen && (
                <div className="flex flex-col gap-1 px-3 pb-2 pt-1 border-t border-white/10 bg-black/40">
                  {packageSubmenu.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/15 hover:text-blue-400"
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
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Why Us
            </Link>
            <Link
              href="/#contact"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Contact
            </Link>

            <div className="my-2 h-px bg-white/15" />

            <div className="flex flex-col gap-2 pt-1">
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/15">
                    <p className="text-[11px] text-slate-300 font-medium">Logged in as</p>
                    <p className="text-xs font-bold text-white truncate">{displayName}</p>
                    {isAdmin && (
                      <span className="mt-1 inline-block rounded bg-blue-600/30 border border-blue-400/40 px-2 py-0.5 text-[10px] font-black uppercase text-blue-300">
                        Administrator
                      </span>
                    )}
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/15"
                  >
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span>My Bookings</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-950/70 text-xs font-bold text-white shadow-sm"
                    >
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span>Administrator</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 text-xs font-semibold text-rose-300 hover:bg-rose-900/50"
                  >
                    <LogOut className="h-4 w-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-xs font-semibold text-white hover:bg-white/15"
                >
                  <User className="h-4 w-4 text-blue-400" />
                  <span>Sign In</span>
                </Link>
              )}

              <Link
                href="/cars"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/30"
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
