"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Heart, CheckCircle2, AlertCircle } from "lucide-react";

type ToastState = {
  id: number;
  message: string;
  type: "success" | "info" | "error";
  vehicleName?: string;
};

type FavoritesContextType = {
  favoriteIds: Set<string>;
  favoritesCount: number;
  isLoading: boolean;
  isFavorite: (vehicleId: string) => boolean;
  toggleFavorite: (
    vehicleId: string,
    vehicleName?: string,
    e?: React.MouseEvent
  ) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "info" | "error" = "success", vehicleName?: string) => {
      setToast({
        id: Date.now(),
        message,
        type,
        vehicleName,
      });
    },
    []
  );

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const refreshFavorites = useCallback(async () => {
    if (status !== "authenticated") {
      setFavoriteIds(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/favorites/ids");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.favoriteVehicleIds)) {
          setFavoriteIds(new Set(data.favoriteVehicleIds));
        }
      }
    } catch (err) {
      console.error("Failed to fetch favorite IDs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      void refreshFavorites();
    } else if (status === "unauthenticated") {
      setFavoriteIds(new Set());
    }
  }, [status, refreshFavorites]);

  const isFavorite = useCallback(
    (vehicleId: string) => {
      return favoriteIds.has(vehicleId);
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (
      vehicleId: string,
      vehicleName?: string,
      e?: React.MouseEvent
    ): Promise<boolean> => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (status === "loading") {
        return false;
      }

      if (status === "unauthenticated" || !session?.user) {
        showToast("Please sign in to save favorite vehicles", "info");
        const currentUrl = encodeURIComponent(pathname || "/");
        router.push(`/login?callbackUrl=${currentUrl}`);
        return false;
      }

      const currentlyFav = favoriteIds.has(vehicleId);
      const targetState = !currentlyFav;

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (targetState) {
          next.add(vehicleId);
        } else {
          next.delete(vehicleId);
        }
        return next;
      });

      try {
        if (targetState) {
          // Add to favorites
          const res = await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicleId }),
          });

          if (res.status === 401) {
            setFavoriteIds((prev) => {
              const next = new Set(prev);
              next.delete(vehicleId);
              return next;
            });
            showToast("Please sign in to save favorite vehicles", "info");
            const currentUrl = encodeURIComponent(pathname || "/");
            router.push(`/login?callbackUrl=${currentUrl}`);
            return false;
          }

          const data = await res.json().catch(() => null);

          if (!res.ok || !data?.success) {
            throw new Error(data?.error || data?.message || "Failed to add favorite");
          }

          showToast(
            vehicleName ? `${vehicleName} added to favorites` : "Added to favorites",
            "success",
            vehicleName
          );
          return true;
        } else {
          // Remove from favorites
          const res = await fetch(`/api/favorites/${vehicleId}`, {
            method: "DELETE",
          });

          if (res.status === 401) {
            setFavoriteIds((prev) => {
              const next = new Set(prev);
              next.add(vehicleId);
              return next;
            });
            showToast("Please sign in to modify favorites", "info");
            const currentUrl = encodeURIComponent(pathname || "/");
            router.push(`/login?callbackUrl=${currentUrl}`);
            return false;
          }

          const data = await res.json().catch(() => null);

          if (!res.ok || !data?.success) {
            throw new Error(data?.error || data?.message || "Failed to remove favorite");
          }

          showToast(
            vehicleName
              ? `${vehicleName} removed from favorites`
              : "Removed from favorites",
            "info",
            vehicleName
          );
          return false;
        }
      } catch (err: any) {
        console.error("Toggle favorite failed:", err);
        // Rollback optimistic update
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (currentlyFav) {
            next.add(vehicleId);
          } else {
            next.delete(vehicleId);
          }
          return next;
        });
        showToast(
          err?.message || "Failed to update favorites. Please try again.",
          "error"
        );
        return currentlyFav;
      }
    },
    [status, session, favoriteIds, pathname, router, showToast]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoritesCount: favoriteIds.size,
        isLoading,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
      }}
    >
      {children}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#0A1128]/95 px-4 py-3 text-white shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {toast.type === "success" ? (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
            </div>
          ) : toast.type === "info" ? (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
            </div>
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
              <AlertCircle className="h-4 w-4 text-rose-400" />
            </div>
          )}

          <div className="text-xs">
            <p className="font-bold text-slate-100">{toast.message}</p>
          </div>
        </div>
      )}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
