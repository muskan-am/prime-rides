import React from "react";

interface BrandLogoProps {
  variant?: "white" | "dark" | "auto";
  className?: string;
}

export default function BrandLogo({ variant = "white", className = "" }: BrandLogoProps) {
  const isWhite = variant === "white";
  const primaryColor = isWhite ? "#FFFFFF" : "#0A1128";
  const accentColor = isWhite ? "#38BDF8" : "#2563EB";
  const silverColor = isWhite ? "#94A3B8" : "#64748B";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Stylized Vector Car & Glowing Road Trail */}
      <svg
        viewBox="0 0 110 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-auto shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoCarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="logoTrailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Car Roof & Hood Sleek Curve */}
        <path
          d="M 12 24 C 18 20 28 14 46 13 C 65 12 80 15 88 19 C 78 16 62 15 45 15.5 C 28 16 18 21 12 24 Z"
          fill="url(#logoCarGrad)"
        />
        {/* Car Body Shell */}
        <path
          d="M 14 24.5 C 20 24.5 24 20 28 20 C 32 20 35 24.5 42 24.5 C 55 24.5 70 23 85 20 C 72 23 55 24.5 40 24.5 C 32 24.5 28 20 24 20 C 20 20 16 24 14 24.5 Z"
          fill={primaryColor}
        />
        {/* Dynamic Sweep / Road Curve */}
        <path
          d="M 8 28 C 30 27 60 25 88 17 C 94 15 97 12 98 10 C 96 14 88 18 78 22 C 55 29 25 31 8 28 Z"
          fill="url(#logoTrailGrad)"
        />
        {/* Lower Highlight */}
        <path
          d="M 22 29 C 45 28.5 75 25 90 19 C 80 22 55 26 30 27.5 C 26 27.8 23 28.5 22 29 Z"
          fill="#38BDF8"
        />
      </svg>

      {/* Brand Typography */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline tracking-tight font-black">
          <span
            className="text-base sm:text-lg font-black tracking-wider"
            style={{ color: primaryColor }}
          >
            PRIME
          </span>
          <span
            className="text-base sm:text-lg font-black tracking-wider ml-1"
            style={{ color: accentColor }}
          >
            RIDES
          </span>
        </div>
        <span
          className="text-[8px] font-bold tracking-[0.25em] uppercase opacity-80"
          style={{ color: silverColor }}
        >
          SELF-DRIVE
        </span>
      </div>
    </div>
  );
}
