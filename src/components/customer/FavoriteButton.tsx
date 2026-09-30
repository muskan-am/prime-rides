"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

type FavoriteButtonProps = {
  vehicleId: string;
  vehicleName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export default function FavoriteButton({
  vehicleId,
  vehicleName,
  className = "",
  size = "md",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(vehicleId);

  const sizeClasses = {
    sm: "h-8 w-8 p-1.5",
    md: "h-9 w-9 p-2",
    lg: "h-11 w-11 p-2.5",
  }[size];

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  return (
    <button
      type="button"
      onClick={(e) => toggleFavorite(vehicleId, vehicleName, e)}
      aria-label={
        isFav
          ? `Remove ${vehicleName || "vehicle"} from favorites`
          : `Add ${vehicleName || "vehicle"} to favorites`
      }
      aria-pressed={isFav}
      className={`relative z-20 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md border border-white/60 transition-all duration-200 hover:bg-white hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${sizeClasses} ${className}`}
    >
      <Heart
        className={`${iconSizes} transition-colors duration-200 ${
          isFav
            ? "fill-rose-500 text-rose-500 scale-105"
            : "text-slate-600 hover:text-rose-500"
        }`}
      />
    </button>
  );
}
