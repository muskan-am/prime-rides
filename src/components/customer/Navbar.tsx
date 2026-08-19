"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Cars", href: "/cars" },
  { label: "Locations", href: "/locations" },
  { label: "Monthly Rentals", href: "/monthly-rentals" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
        >
          Prime<span className="text-muted-foreground">Rides</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">

          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            My Bookings
          </Link>

          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Login
          </Link>

        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="rounded-md p-2 md:hidden"
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

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              My Bookings
            </Link>

            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Login
            </Link>

          </nav>
        </div>
      )}
    </header>
  );
}