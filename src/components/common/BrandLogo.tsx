import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  variant?: "white" | "dark" | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
  showSubtitle?: boolean;
  showText?: boolean;
}

export default function BrandLogo({
  variant = "default",
  size = "md",
  className = "",
  showSubtitle = true,
  showText = true,
}: BrandLogoProps) {
  const isWhite = variant === "white";
  const isDark = variant === "dark";

  const sizeStyles = {
    sm: {
      badge: "h-8 w-8",
      imageSize: 32,
      title: "text-xs sm:text-sm",
      sub: "text-[6px] sm:text-[7px]",
      gap: "gap-2",
    },
    md: {
      badge: "h-9 w-9 sm:h-10 sm:w-10",
      imageSize: 40,
      title: "text-sm sm:text-base",
      sub: "text-[7px] sm:text-[8px]",
      gap: "gap-2.5 sm:gap-3",
    },
    lg: {
      badge: "h-12 w-12",
      imageSize: 48,
      title: "text-lg sm:text-xl",
      sub: "text-[8px] sm:text-[9px]",
      gap: "gap-3",
    },
  }[size];

  const textColor = isWhite
    ? "text-white"
    : isDark
    ? "text-slate-900"
    : "text-slate-900 dark:text-white";

  const subTextColor = isWhite
    ? "text-slate-400"
    : isDark
    ? "text-slate-500"
    : "text-slate-500 dark:text-slate-400";

  return (
    <div className={`relative flex items-center ${sizeStyles.gap} ${className}`}>
      {/* Circular Brand Logo Badge */}
      <div
        className={`relative flex items-center justify-center ${sizeStyles.badge} rounded-full bg-gradient-to-br from-slate-900 via-[#0A1128] to-blue-950 p-0.5 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.25)] overflow-hidden shrink-0 transition-all duration-300`}
      >
        <Image
          src="/prime-rides-logo.png"
          alt="Prime Rides Logo"
          width={sizeStyles.imageSize}
          height={sizeStyles.imageSize}
          className="h-full w-full object-cover rounded-full"
          priority
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight select-none">
          <div className="flex items-baseline tracking-tight font-black">
            <span className={`${sizeStyles.title} font-black tracking-wider ${textColor}`}>
              PRIME
            </span>
            <span className={`${sizeStyles.title} font-black tracking-wider ml-1 bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent`}>
              RIDES
            </span>
          </div>
          {showSubtitle && (
            <span className={`${sizeStyles.sub} font-bold tracking-[0.25em] uppercase ${subTextColor}`}>
              SELF-DRIVE
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { BrandLogo };
