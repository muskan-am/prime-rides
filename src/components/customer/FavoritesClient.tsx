"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Heart,
  Car,
  Fuel,
  Gauge,
  Users,
  Wind,
  Star,
  ArrowRight,
  Loader2,
} from "lucide-react";
import CarImageSlider from "@/components/customer/CarImageSlider";
import FavoriteButton from "@/components/customer/FavoriteButton";
import { useFavorites } from "@/context/FavoritesContext";

type FavoriteVehicle = {
  id: string;
  favoriteId: string;
  brand: string;
  name: string;
  model: string;
  variant: string;
  type?: string;
  vehicleType?: string | null;
  fuel: string;
  transmission: string;
  seats: number;
  hasAirConditioning?: boolean;
  price: number;
  deposit: number;
  location: string;
  isAvailable: boolean;
  image: string;
  images?: string[];
  badge: string;
  rating?: number | null;
  reviewCount?: number;
};

export default function FavoritesClient() {
  const { data: session, status } = useSession();
  const { favoriteIds } = useFavorites();

  const [favorites, setFavorites] = useState<FavoriteVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (status !== "authenticated") {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.favorites)) {
          setFavorites(data.favorites);
        }
      }
    } catch (err) {
      console.error("Failed to load favorites list:", err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      void fetchFavorites();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, fetchFavorites]);

  const displayedFavorites = favorites.filter((car) =>
    favoriteIds.has(car.id)
  );

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-500">
            Loading your favorite cars...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 text-center shadow-lg space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <Heart className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">
              Sign In to View Favorites
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in to your Prime Rides account to view and manage your saved self-drive cars across devices.
            </p>
          </div>

          <Link
            href="/login?callbackUrl=/favorites"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all"
          >
            <span>Sign In to Prime Rides</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="space-y-1.5 pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/60 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-widest text-rose-600">
          <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
          <span>MY WISHLIST</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0A1128]">
            My Favorite Cars
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-500">
            {displayedFavorites.length}{" "}
            {displayedFavorites.length === 1 ? "saved vehicle" : "saved vehicles"}
          </p>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
          Quickly access and book your preferred self-drive vehicles for upcoming journeys.
        </p>
      </div>

      {/* Grid or Empty State */}
      {displayedFavorites.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 sm:p-14 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-400">
            <Heart className="h-7 w-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              No favorite cars yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore our fleet of premium self-drive cars and click the heart icon on any car to save it to your wishlist.
            </p>
          </div>

          <Link
            href="/cars"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Car className="h-4 w-4" />
            <span>Explore Cars</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedFavorites.map((car) => (
            <article
              key={car.id}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 flex flex-col justify-between"
            >
              <div className="flex flex-col h-full">
                {/* Image Container with Heart Button */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                  <CarImageSlider
                    primaryImage={car.image}
                    images={car.images}
                    alt={`${car.brand} ${car.model}`}
                    brand={car.brand}
                    model={car.model}
                  />

                  {/* Favorite Button */}
                  <div className="absolute top-2.5 right-2.5 z-20">
                    <FavoriteButton
                      vehicleId={car.id}
                      vehicleName={`${car.brand} ${car.model}`}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Compact Info Below Image */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {/* Name & Variant on Left, Rating on Right */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors truncate">
                          {car.brand} {car.model}
                        </h3>
                        {car.variant && (
                          <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">
                            {car.variant}
                          </p>
                        )}
                      </div>

                      {/* Rating Summary on Right */}
                      <div className="shrink-0 text-right">
                        {car.reviewCount !== undefined && car.reviewCount > 0 && car.rating ? (
                          <div className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>
                              {car.rating.toFixed(1)} ({car.reviewCount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">
                            No reviews yet
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4 Compact Specs */}
                    <div className="grid grid-cols-4 gap-1.5 text-center pt-1.5">
                      <div className="rounded-lg bg-slate-50 border border-slate-100/80 py-1.5 px-1 text-slate-700 min-w-0">
                        <Fuel className="mx-auto h-3.5 w-3.5 text-emerald-600 mb-0.5" />
                        <span className="text-[10px] font-bold block truncate">
                          {car.fuel}
                        </span>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100/80 py-1.5 px-1 text-slate-700 min-w-0">
                        <Gauge className="mx-auto h-3.5 w-3.5 text-blue-600 mb-0.5" />
                        <span className="text-[10px] font-bold block truncate">
                          {car.transmission}
                        </span>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100/80 py-1.5 px-1 text-slate-700 min-w-0">
                        <Users className="mx-auto h-3.5 w-3.5 text-indigo-600 mb-0.5" />
                        <span className="text-[10px] font-bold block truncate">
                          {car.seats} Seats
                        </span>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100/80 py-1.5 px-1 text-slate-700 min-w-0">
                        <Wind className="mx-auto h-3.5 w-3.5 text-cyan-600 mb-0.5" />
                        <span className="text-[10px] font-bold block truncate">
                          {car.hasAirConditioning !== false ? "AC" : "Non-AC"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price, Deposit & Action */}
                  <div className="pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg sm:text-xl font-black text-slate-900">
                            ₹{car.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            /day
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 block">
                          {car.deposit !== undefined && car.deposit > 0
                            ? `Deposit: ₹${car.deposit.toLocaleString("en-IN")}`
                            : "₹0 Security Deposit"}
                        </span>
                      </div>

                      <Link
                        href={`/cars/${car.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
