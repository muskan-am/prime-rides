"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, User, Calendar, ChevronDown, LogOut, Shield, Settings, Heart } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import NotificationBell from "@/components/notifications/NotificationBell";
import BrandLogo from "@/components/common/BrandLogo";
import { useFavorites } from "@/context/FavoritesContext";

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
  const { favoritesCount } = useFavorites();
  const pathname = usePathname();
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
    }, 220);
  };

  const handleUserMouseEnter = () => {
    if (userDropdownTimeout.current) clearTimeout(userDropdownTimeout.current);
    setIsUserMenuOpen(true);
  };

  const handleUserMouseLeave = () => {
    userDropdownTimeout.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
      if (userDropdownTimeout.current) clearTimeout(userDropdownTimeout.current);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsPackagesOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const isLoggedIn = status === "authenticated" && Boolean(session?.user);
  const isAdmin = session?.user?.role === "ADMIN";
  const displayName = isAdmin
    ? (session?.user?.name || "Prime Rides Admin")
    : (session?.user?.name || session?.user?.email?.split("@")[0] || "Account");

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full px-2.5 sm:px-6 lg:px-8 pt-2.5 sm:pt-4">
      {/* Outer Floating Container */}
      <div className="relative mx-auto max-w-6xl w-full">
        {/* Layer 1: Animated Nova Glow Rotor & Dark Glass Pill Background */}
        <div
          className={`absolute inset-0 pointer-events-none overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMenuOpen ? "rounded-[28px]" : "rounded-[26px] sm:rounded-full"
          }`}
          style={{
            boxShadow:
              "0px 14px 40px 0px rgba(0, 0, 0, 0.55)",
          }}
        >
          {/* Subtle Rotating Light Shimmer Rotor */}
          <div
            className="absolute -top-[500%] -bottom-[500%] -left-[200%] -right-[200%] animate-nova-spin pointer-events-none will-change-transform opacity-30"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 75deg, rgba(255, 255, 255, 0.35) 88deg, #ffffff 90deg, transparent 95deg)",
            }}
            aria-hidden="true"
          />

          {/* Inner Dark Frosted Glass Backdrop */}
          <div
            className={`absolute inset-[1px] bg-gradient-to-b from-[#11182e]/95 via-[#090d1f]/97 to-[#060917]/98 backdrop-blur-2xl border border-white/15 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isMenuOpen ? "rounded-[27px]" : "rounded-[25px] sm:rounded-full"
            }`}
            style={{
              boxShadow: "inset 0px 1px 0px 0px rgba(255, 255, 255, 0.2)",
            }}
          />

          {/* Top Hairline Glow Beam */}
          <div
            className="absolute top-0 left-[10%] right-[10%] h-[1px] pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255,255,255,0) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Shimmer Light Streak */}
          <div
            className="absolute top-0 bottom-0 left-0 w-32 pointer-events-none animate-nova-shimmer will-change-transform"
            style={{
              background:
                "linear-gradient(105deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.05) 45%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.05) 55%, rgba(255, 255, 255, 0) 100%)",
            }}
            aria-hidden="true"
          />
        </div>

        {/* Layer 2: Interactive Foreground Content & Floating Dropdowns */}
        <div className="relative z-20 flex flex-col w-full">
          {/* Main Horizontal Navbar Row */}
          <div className="flex items-center justify-between h-14 sm:h-16 px-3.5 sm:px-6">
            {/* Nova Glow Logo Mark & Brand */}
            <Link
              href="/"
              className="group relative flex items-center transition-transform duration-200 hover:scale-[1.02] active:scale-95 shrink-0"
              aria-label="Prime Rides Home"
            >
              <BrandLogo variant="white" size="md" />
            </Link>

            {/* Desktop Navigation Links (Visible on >= 1024px) */}
            <nav className="hidden items-center gap-1 xl:gap-1.5 lg:flex">
              <Link
                href="/"
                className={`relative px-3.5 py-1.5 text-xs xl:text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
                  isActive("/")
                    ? "text-white bg-white/15 border border-white/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                    : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent"
                }`}
              >
                Home
              </Link>
              <Link
                href="/cars"
                className={`relative px-3.5 py-1.5 text-xs xl:text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
                  isActive("/cars")
                    ? "text-white bg-white/15 border border-white/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                    : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent"
                }`}
              >
                Cars
              </Link>
              <Link
                href="/#locations"
                className="relative px-3.5 py-1.5 text-xs xl:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 whitespace-nowrap border border-transparent"
              >
                Locations
              </Link>

              {/* Packages Dropdown (White Theme) */}
              {/* <div
                className="relative group/packages"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setIsPackagesOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1 px-3.5 py-1.5 text-xs xl:text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive("/packages") || isPackagesOpen
                      ? "text-white bg-white/15 border border-white/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                      : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <span>Packages</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-250 ease-out ${
                      isPackagesOpen ? "rotate-180 text-blue-400" : "text-slate-400 group-hover/packages:rotate-180 group-hover/packages:text-blue-400"
                    }`}
                  />
                </button>

               
                <div
                  className={`absolute left-0 top-full pt-2.5 w-72 z-50 transition-all duration-200 ease-out origin-top before:absolute before:-top-3 before:left-0 before:right-0 before:h-4 before:content-[''] ${
                    isPackagesOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none invisible group-hover/packages:opacity-100 group-hover/packages:translate-y-0 group-hover/packages:scale-100 group-hover/packages:pointer-events-auto group-hover/packages:visible"
                  }`}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xl ring-1 ring-slate-900/5 text-slate-900">
                    <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 mb-1 flex items-center justify-between">
                      <span>Rental Packages</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                    </div>
                    {packageSubmenu.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setIsPackagesOpen(false)}
                        className="group/item flex flex-col gap-0.5 rounded-xl p-2.5 transition-all duration-150 hover:bg-blue-50/80 cursor-pointer text-left border border-transparent hover:border-blue-100"
                      >
                        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 group-hover/item:text-blue-600 transition-colors">
                          <span>{sub.label}</span>
                          <span className="text-xs text-blue-600 opacity-0 transition-all duration-150 transform translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0">
                            →
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                          {sub.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div> */}

              <Link
                href="/#why-us"
                className="relative px-3.5 py-1.5 text-xs xl:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 whitespace-nowrap border border-transparent"
              >
                Why Us
              </Link>
              <Link
                href="/#contact"
                className="relative px-3.5 py-1.5 text-xs xl:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 whitespace-nowrap border border-transparent"
              >
                Contact
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-2.5 xl:gap-3.5 lg:flex shrink-0">
              {/* Notification Bell */}
              <NotificationBell variant="customer" />

              {isLoggedIn ? (
                /* User Profile Dropdown (White Theme) */
                <div
                  className="relative group/user"
                  onMouseEnter={handleUserMouseEnter}
                  onMouseLeave={handleUserMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    aria-label="User Account Menu"
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white text-xs font-black shadow-[0_0_15px_rgba(99,102,241,0.4)] ring-2 ring-white/20 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
                  >
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  </button>

                  <div
                    className={`absolute right-0 top-full pt-2.5 w-64 max-w-[calc(100vw-2rem)] z-50 transition-all duration-200 ease-out origin-top-right before:absolute before:-top-3 before:left-0 before:right-0 before:h-4 before:content-[''] ${
                      isUserMenuOpen
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible"
                        : "opacity-0 -translate-y-2 scale-95 pointer-events-none invisible group-hover/user:opacity-100 group-hover/user:translate-y-0 group-hover/user:scale-100 group-hover/user:pointer-events-auto group-hover/user:visible"
                    }`}
                    onMouseEnter={handleUserMouseEnter}
                    onMouseLeave={handleUserMouseLeave}
                  >
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xl ring-1 ring-slate-900/5 text-slate-900">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1.5 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {isAdmin ? "Prime Rides Admin" : (session?.user?.name || "Logged In")}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{session?.user?.email}</p>
                        {isAdmin && (
                          <span className="mt-1 inline-block rounded bg-blue-50 border border-blue-200/70 px-2 py-0.5 text-[10px] font-black uppercase text-blue-700">
                            Administrator
                          </span>
                        )}
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 hover:text-blue-600 transition-colors"
                      >
                        <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>My Bookings</span>
                      </Link>

                      <Link
                        href="/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 hover:text-rose-600 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                          <span>Favorites</span>
                        </div>
                        {favoritesCount > 0 && (
                          <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-200/60">
                            {favoritesCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/notification-preferences"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 hover:text-blue-600 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>Notification Settings</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Shield className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <div className="my-1.5 border-t border-slate-100" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 border border-white/10 transition-all whitespace-nowrap"
                >
                  <User className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Glowing Nova CTA Button */}
              <Link
                href="/cars"
                className="group relative inline-flex h-9 sm:h-10 items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-4 sm:px-5 text-xs xl:text-sm shadow-[0_0_20px_rgba(79,70,229,0.45)] border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(79,70,229,0.65)] active:scale-95 shrink-0 whitespace-nowrap overflow-hidden"
              >
                {/* Internal button shimmer */}
                <div
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                  aria-hidden="true"
                />
                <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>Book a Car</span>
                <span className="text-xs transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>

            {/* Mobile & Tablet Actions & Menu Toggle (Visible on < 1024px) */}
            <div className="flex items-center gap-2 lg:hidden">
              <NotificationBell variant="customer" />

              {isLoggedIn ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen((prev) => !prev);
                      setIsMenuOpen(false);
                    }}
                    aria-label="User Account Menu"
                    className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white text-xs font-black shadow-[0_0_12px_rgba(99,102,241,0.4)] ring-1 ring-white/20 active:scale-95 cursor-pointer"
                  >
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  </button>

                  {/* Backdrop click dismiss */}
                  {isUserMenuOpen && (
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setIsUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                  )}

                  <div
                    className={`absolute right-0 top-full pt-2.5 w-64 max-w-[calc(100vw-2rem)] z-50 transition-all duration-250 ease-out origin-top-right ${
                      isUserMenuOpen
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                        : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                    }`}
                  >
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xl ring-1 ring-slate-900/5 text-slate-900">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1.5 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {isAdmin ? "Prime Rides Admin" : (session?.user?.name || "Logged In")}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{session?.user?.email}</p>
                        {isAdmin && (
                          <span className="mt-1 inline-block rounded bg-blue-50 border border-blue-200/70 px-2 py-0.5 text-[10px] font-black uppercase text-blue-700">
                            Administrator
                          </span>
                        )}
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 hover:text-blue-600 transition-colors"
                      >
                        <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>My Bookings</span>
                      </Link>

                      <Link
                        href="/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 hover:text-rose-600 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                          <span>Favorites</span>
                        </div>
                        {favoritesCount > 0 && (
                          <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-200/60">
                            {favoritesCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/notification-preferences"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 hover:text-blue-600 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>Notification Settings</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Shield className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <div className="my-1.5 border-t border-slate-100" />

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex h-8 items-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 sm:px-3 text-[11px] sm:text-xs font-semibold text-slate-200 transition-all"
                >
                  Sign In
                </Link>
              )}

              {/* Framer Nova Animated Menu Toggle Button */}
              <button
                type="button"
                className="relative flex flex-col items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all cursor-pointer"
                onClick={() => {
                  setIsMenuOpen((prev) => !prev);
                  setIsUserMenuOpen(false);
                }}
                aria-label="Toggle navigation menu"
              >
                <div className="relative w-4 h-3.5 flex flex-col justify-between">
                  <span
                    className={`h-[2px] w-full bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-center ${
                      isMenuOpen ? "rotate-45 translate-y-[5.5px]" : ""
                    }`}
                  />
                  <span
                    className={`h-[2px] w-full bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-center ${
                      isMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Smooth Grid-Expanded Mobile Drawer Inside the Glass Pill Container */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
              isMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-2 px-4 pb-5 pt-2 border-t border-white/10 text-white">
                <nav className="flex flex-col gap-1 max-w-md mx-auto w-full">
                  <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isActive("/")
                        ? "bg-white/15 text-white border border-white/20 font-bold"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/cars"
                    onClick={() => setIsMenuOpen(false)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isActive("/cars")
                        ? "bg-white/15 text-white border border-white/20 font-bold"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    Cars
                  </Link>
                  <Link
                    href="/#locations"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
                  >
                    Locations
                  </Link>

                  {/* Mobile Packages Expandable with Smooth Accordion */}
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 my-0.5 transition-all">
                    <button
                      type="button"
                      onClick={() => setMobilePackagesOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span>Packages</span>
                      <ChevronDown
                        className={`h-4 w-4 text-indigo-400 transition-transform duration-250 ease-out ${
                          mobilePackagesOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows] duration-250 ease-out ${
                        mobilePackagesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="flex flex-col gap-1 px-3 pb-2 pt-1 border-t border-white/10 bg-black/40">
                          {packageSubmenu.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/15 hover:text-indigo-300 transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/#why-us"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
                  >
                    Why Us
                  </Link>
                  <Link
                    href="/#contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
                  >
                    Contact
                  </Link>

                  <div className="my-2 h-px bg-white/10" />

                  <div className="flex flex-col gap-2 pt-1">
                    {isLoggedIn ? (
                      <>
                        <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/15">
                          <p className="text-[11px] text-slate-300 font-medium">Logged in as</p>
                          <p className="text-xs font-bold text-white truncate">{displayName}</p>
                          {isAdmin && (
                            <span className="mt-1 inline-block rounded bg-indigo-600/30 border border-indigo-400/40 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-300">
                              Administrator
                            </span>
                          )}
                        </div>

                        <Link
                          href="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
                        >
                          <Calendar className="h-4 w-4 text-indigo-400" />
                          <span>My Bookings</span>
                        </Link>

                        <Link
                          href="/favorites"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex h-11 items-center justify-between px-4 rounded-xl border border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-rose-400" />
                            <span>Favorites</span>
                          </div>
                          {favoritesCount > 0 && (
                            <span className="rounded-full bg-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-400/40">
                              {favoritesCount}
                            </span>
                          )}
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-950/70 text-xs font-bold text-white shadow-sm transition-colors"
                          >
                            <Shield className="h-4 w-4 text-indigo-400" />
                            <span>Admin Panel</span>
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 transition-colors cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-rose-400" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
                      >
                        <User className="h-4 w-4 text-indigo-400" />
                        <span>Sign In</span>
                      </Link>
                    )}

                    {/* Mobile CTA */}
                    <Link
                      href="/cars"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-white/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <Car className="h-4 w-4" />
                      <span>Book a Car</span>
                      <span>→</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
