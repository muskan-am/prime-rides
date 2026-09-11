"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Car, User, Calendar, ChevronDown, LogOut, Shield, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const packageSubmenu = [
  { label: "Weekly Packages", href: "/packages/weekly", description: "Best for 7-day trips & getaways" },
  { label: "Monthly Packages", href: "/packages/monthly", description: "Long term 30-day corporate & personal rentals" },
  { label: "Yearly Packages", href: "/packages/yearly", description: "Annual subscription deals with maintenance" },
];

export default function Navbar() {
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
  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "Account";

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
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#2563EB]/30 bg-[#0A1128] px-3.5 text-xs font-extrabold text-white transition-all hover:bg-[#111B3A]"
                >
                  <Shield className="h-4 w-4 text-[#2563EB]" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 sm:px-4 text-sm font-bold text-slate-800 transition-all hover:bg-slate-50 focus:outline-none"
                >
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[90px] sm:max-w-[140px] truncate text-xs sm:text-sm">{displayName}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setIsUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 top-full pt-2 w-60 max-w-[calc(100vw-2rem)] z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl">
                        <div className="px-3 py-2 border-b border-slate-100 mb-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{session?.user?.name || "Logged In"}</p>
                          <p className="text-[11px] text-slate-500 truncate">{session?.user?.email}</p>
                          {isAdmin && (
                            <span className="mt-1 inline-block rounded bg-[#0A1128] px-1.5 py-0.5 text-[10px] font-black uppercase text-blue-400">
                              Administrator
                            </span>
                          )}
                        </div>

                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>My Bookings</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0A1128] transition-colors"
                          >
                            <Shield className="h-4 w-4 text-blue-600 shrink-0" />
                            <span>Admin Control Panel</span>
                          </Link>
                        )}

                        <div className="my-1 border-t border-slate-100" />

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 text-rose-600 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              <User className="h-4 w-4 text-slate-500" />
              <span>Login / Signup</span>
            </Link>
          )}

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
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="text-xs text-slate-500 font-medium">Logged in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                    {isAdmin && (
                      <span className="mt-1 inline-block rounded bg-[#0A1128] px-2 py-0.5 text-[10px] font-black uppercase text-blue-400">
                        Admin Account
                      </span>
                    )}
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800"
                  >
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>My Bookings</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#2563EB]/30 bg-[#0A1128] text-sm font-bold text-white shadow-sm"
                    >
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span>Admin Control Panel</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-600"
                  >
                    <LogOut className="h-4 w-4 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
                >
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Login / Signup</span>
                </Link>
              )}

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
