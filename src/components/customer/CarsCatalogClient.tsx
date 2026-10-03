"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Fuel,
  Gauge,
  Users,
  Wind,
  MapPin,
  Filter,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
  Star,
  Info,
  X,
  Car as CarIcon,
  Sparkles,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import CarImageSlider from "@/components/customer/CarImageSlider";
import FavoriteButton from "@/components/customer/FavoriteButton";
import SearchSummary from "@/components/customer/SearchSummary";
import { FilterSettings, DEFAULT_FILTER_SETTINGS } from "@/lib/filterSettings";
import { ParsedSearchContext } from "@/lib/datetime";

export type FormattedVehicle = {
  id: string;
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
  locationIds: string[];
  locationNames: string[];
  isAvailable: boolean;
  image: string;
  images?: string[];
  badge: string;
  searchPriority: number;
  rating?: number | null;
  reviewCount?: number;
  modelYear?: number;
};

export type FormattedLocation = {
  id: string;
  name: string;
};

export type InitialFilterParams = {
  location?: string;
  vehicleType?: string;
  type?: string;
  category?: string;
  fuel?: string;
  transmission?: string;
  seats?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  delivery?: string;
  search?: string;
  sort?: string;
};

type CarsCatalogClientProps = {
  initialVehicles: FormattedVehicle[];
  locations: FormattedLocation[];
  initialLocationQuery?: string;
  initialParams?: InitialFilterParams;
  isDateFilterActive?: boolean;
  startDateText?: string;
  endDateText?: string;
  searchContext?: ParsedSearchContext;
  filterSettings?: FilterSettings;
};

// Recognized valid Car Types to strictly prevent variant leakage
const VALID_CAR_TYPES = [
  "SUV",
  "Sedan",
  "Hatchback",
  "MUV/MPV",
  "Luxury Sedan",
  "Compact SUV",
  "Luxury SUV",
];

export default function CarsCatalogClient({
  initialVehicles,
  locations,
  initialLocationQuery = "All",
  initialParams,
  isDateFilterActive = false,
  startDateText,
  endDateText,
  searchContext,
  filterSettings = DEFAULT_FILTER_SETTINGS,
}: CarsCatalogClientProps) {
  // Collapsible Accordion States for the 7 Customer Filters
  const [openSections, setOpenSections] = useState({
    priceRange: true,
    carType: true,
    fuelType: true,
    transmission: true,
    seats: true,
    userRatings: true,
    deliveryType: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Dynamic Catalog Price Calculation
  const { minCatalogPrice, maxCatalogPrice } = useMemo(() => {
    if (!initialVehicles || initialVehicles.length === 0) {
      return { minCatalogPrice: 500, maxCatalogPrice: 15000 };
    }
    const prices = initialVehicles.map((v) => v.price).filter((p) => p > 0);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    return {
      minCatalogPrice: minP > 0 ? minP : 500,
      maxCatalogPrice: maxP > 0 ? maxP : 15000,
    };
  }, [initialVehicles]);

  // Dynamic Available Categories (Strictly vehicle types, NEVER vehicle variants)
  const dynamicCarTypes = useMemo(() => {
    const presentTypes = new Set<string>();
    initialVehicles.forEach((v) => {
      const t = v.vehicleType || v.type;
      if (t && VALID_CAR_TYPES.some((vt) => vt.toLowerCase() === t.toLowerCase())) {
        const canonical = VALID_CAR_TYPES.find((vt) => vt.toLowerCase() === t.toLowerCase()) || t;
        presentTypes.add(canonical);
      }
    });

    const configured = filterSettings.carType?.options?.filter((opt) =>
      VALID_CAR_TYPES.some((vt) => vt.toLowerCase() === opt.toLowerCase())
    ) || VALID_CAR_TYPES;

    const combined = Array.from(new Set([...configured, ...Array.from(presentTypes)]));
    return combined.length > 0 ? combined : VALID_CAR_TYPES;
  }, [initialVehicles, filterSettings.carType?.options]);

  // Dynamic Available Fuel Types from Active Vehicles
  const dynamicFuelTypes = useMemo(() => {
    const presentFuels = new Set<string>();
    initialVehicles.forEach((v) => {
      if (v.fuel) presentFuels.add(v.fuel);
    });
    if (filterSettings.fuelType?.options && filterSettings.fuelType.options.length > 0) {
      const configured = filterSettings.fuelType.options;
      const combined = Array.from(new Set([...configured, ...Array.from(presentFuels)]));
      return combined;
    }
    return Array.from(presentFuels);
  }, [initialVehicles, filterSettings.fuelType?.options]);

  // Initial parsed filters from URL params
  const initTypes = useMemo(() => {
    const raw = initialParams?.vehicleType || initialParams?.type || initialParams?.category;
    if (!raw) return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }, [initialParams?.vehicleType, initialParams?.type, initialParams?.category]);

  const initFuels = useMemo(() => {
    const raw = initialParams?.fuel;
    if (!raw) return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }, [initialParams?.fuel]);

  const initTrans = useMemo(() => {
    const raw = initialParams?.transmission;
    if (!raw) return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }, [initialParams?.transmission]);

  const initSeats = useMemo(() => {
    const raw = initialParams?.seats;
    if (!raw) return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }, [initialParams?.seats]);

  // Normalize initial location query with available locations
  const normalizedInitialLocation = useMemo(() => {
    const raw = (initialParams?.location || initialLocationQuery || "").trim();
    if (!raw || raw === "All" || raw === "All City Hubs") return "All";
    const found = locations.find((l) => {
      const nLower = l.name.toLowerCase().trim();
      const rLower = raw.toLowerCase().trim();
      return nLower === rLower || l.id === raw || nLower.includes(rLower) || rLower.includes(nLower);
    });
    return found ? found.name : raw;
  }, [initialParams?.location, initialLocationQuery, locations]);

  // Filter States
  const [selectedLocation, setSelectedLocation] = useState(normalizedInitialLocation);
  const [homeDelivery, setHomeDelivery] = useState(
    initialParams?.delivery === "home" || false
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    initialParams?.maxPrice || maxCatalogPrice
  );
  const [selectedCarTypes, setSelectedCarTypes] = useState<string[]>(initTypes);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>(initTrans);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>(initFuels);
  const [selectedSeatOptions, setSelectedSeatOptions] = useState<string[]>(initSeats);
  const [selectedMinRating, setSelectedMinRating] = useState<number>(
    initialParams?.rating || 0
  );
  const [sortOption, setSortOption] = useState(initialParams?.sort || "default");
  const [searchQuery, setSearchQuery] = useState(initialParams?.search || "");

  // Update selectedLocation if normalizedInitialLocation updates
  useEffect(() => {
    if (normalizedInitialLocation && normalizedInitialLocation !== "All") {
      setSelectedLocation(normalizedInitialLocation);
    }
  }, [normalizedInitialLocation]);

  // Helper to dynamically get the most relevant display location for a vehicle card
  const getVehicleDisplayLocation = (car: FormattedVehicle) => {
    const targetLoc =
      selectedLocation && selectedLocation !== "All" && selectedLocation !== "All City Hubs"
        ? selectedLocation
        : searchContext?.location && searchContext.location !== "All" && searchContext.location !== "All City Hubs"
        ? searchContext.location
        : "";

    if (targetLoc) {
      const targetLower = targetLoc.toLowerCase().trim();
      const matched = car.locationNames.find((name) => {
        const nLower = name.toLowerCase().trim();
        return nLower === targetLower || nLower.includes(targetLower) || targetLower.includes(nLower);
      });
      if (matched) return matched;
    }

    return car.location || car.locationNames[0] || "Main Hub";
  };

  // Synchronize state with browser URL search parameters seamlessly
  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const params = url.searchParams;

    // Preserve exact search parameters from searchContext if active
    if (searchContext?.location) {
      params.set("location", searchContext.location);
    } else if (selectedLocation && selectedLocation !== "All" && selectedLocation !== "All City Hubs") {
      params.set("location", selectedLocation);
    } else {
      params.delete("location");
      params.delete("locationId");
    }

    if (searchContext?.returnLocation) {
      params.set("returnLocation", searchContext.returnLocation);
    }
    if (searchContext?.startDate) {
      params.set("startDate", searchContext.startDate);
    }
    if (searchContext?.startTime) {
      params.set("startTime", searchContext.startTime);
    }
    if (searchContext?.endDate) {
      params.set("endDate", searchContext.endDate);
    }
    if (searchContext?.endTime) {
      params.set("endTime", searchContext.endTime);
    }

    // Car Type / Vehicle Type
    if (selectedCarTypes.length > 0) {
      params.set("vehicleType", selectedCarTypes.join(","));
    } else {
      params.delete("vehicleType");
      params.delete("type");
      params.delete("category");
    }

    // Transmission
    if (selectedTransmissions.length > 0) {
      params.set("transmission", selectedTransmissions.join(","));
    } else {
      params.delete("transmission");
    }

    // Fuel types
    if (selectedFuelTypes.length > 0) {
      params.set("fuel", selectedFuelTypes.join(","));
    } else {
      params.delete("fuel");
    }

    // Seats
    if (selectedSeatOptions.length > 0) {
      params.set("seats", selectedSeatOptions.join(","));
    } else {
      params.delete("seats");
    }

    // Delivery Type
    if (homeDelivery) {
      params.set("delivery", "home");
    } else {
      params.delete("delivery");
    }

    // Price
    if (maxPrice < maxCatalogPrice) {
      params.set("maxPrice", maxPrice.toString());
    } else {
      params.delete("maxPrice");
    }

    // Rating
    if (selectedMinRating > 0) {
      params.set("rating", selectedMinRating.toString());
    } else {
      params.delete("rating");
    }

    // Sort
    if (sortOption !== "default") {
      params.set("sort", sortOption);
    } else {
      params.delete("sort");
    }

    // Search query
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }

    const newQuery = params.toString();
    const newPath = newQuery ? `${url.pathname}?${newQuery}` : url.pathname;
    window.history.replaceState({ ...window.history.state, as: newPath, url: newPath }, "", newPath);
  }, [
    selectedLocation,
    selectedCarTypes,
    selectedTransmissions,
    selectedFuelTypes,
    selectedSeatOptions,
    homeDelivery,
    maxPrice,
    maxCatalogPrice,
    selectedMinRating,
    sortOption,
    searchQuery,
    searchContext,
  ]);

  // Toggle helper for multi-select arrays
  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleResetFilters = () => {
    setSelectedLocation("All");
    setHomeDelivery(false);
    setMaxPrice(maxCatalogPrice);
    setSelectedCarTypes([]);
    setSelectedTransmissions([]);
    setSelectedFuelTypes([]);
    setSelectedSeatOptions([]);
    setSelectedMinRating(0);
    setSortOption("default");
    setSearchQuery("");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const keepParams = new URLSearchParams();
      if (searchContext?.location) keepParams.set("location", searchContext.location);
      if (searchContext?.returnLocation) keepParams.set("returnLocation", searchContext.returnLocation);
      if (searchContext?.startDate) keepParams.set("startDate", searchContext.startDate);
      if (searchContext?.startTime) keepParams.set("startTime", searchContext.startTime);
      if (searchContext?.endDate) keepParams.set("endDate", searchContext.endDate);
      if (searchContext?.endTime) keepParams.set("endTime", searchContext.endTime);
      const newQuery = keepParams.toString();
      const newPath = newQuery ? `${url.pathname}?${newQuery}` : url.pathname;
      window.history.replaceState({ ...window.history.state, as: newPath, url: newPath }, "", newPath);
    }
  };

  // Active customer filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedLocation !== "All" && selectedLocation !== "All City Hubs") count++;
    if (homeDelivery) count++;
    if (maxPrice < maxCatalogPrice) count++;
    count += selectedCarTypes.length;
    count += selectedTransmissions.length;
    count += selectedFuelTypes.length;
    count += selectedSeatOptions.length;
    if (selectedMinRating > 0) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [
    selectedLocation,
    homeDelivery,
    maxPrice,
    maxCatalogPrice,
    selectedCarTypes,
    selectedTransmissions,
    selectedFuelTypes,
    selectedSeatOptions,
    selectedMinRating,
    searchQuery,
  ]);

  // Helper to build URL for vehicle detail page with search context preserved
  const getVehicleDetailHref = (vehicleId: string) => {
    const detailParams = new URLSearchParams();
    if (searchContext?.hasSearchContext) {
      if (searchContext.location) detailParams.set("location", searchContext.location);
      if (searchContext.returnLocation) detailParams.set("returnLocation", searchContext.returnLocation);
      if (searchContext.startDate) detailParams.set("startDate", searchContext.startDate);
      if (searchContext.startTime) detailParams.set("startTime", searchContext.startTime);
      if (searchContext.endDate) detailParams.set("endDate", searchContext.endDate);
      if (searchContext.endTime) detailParams.set("endTime", searchContext.endTime);
    }
    const qs = detailParams.toString();
    return `/cars/${vehicleId}${qs ? `?${qs}` : ""}`;
  };

  // Filtered and Sorted Cars using strict AND logic between categories and OR inside categories
  const filteredCars = useMemo(() => {
    return initialVehicles
      .filter((car) => {
        // 0. Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            car.name.toLowerCase().includes(q) ||
            car.brand.toLowerCase().includes(q) ||
            car.model.toLowerCase().includes(q) ||
            (car.vehicleType && car.vehicleType.toLowerCase().includes(q)) ||
            car.variant.toLowerCase().includes(q) ||
            car.fuel.toLowerCase().includes(q) ||
            car.location.toLowerCase().includes(q);
          if (!match) return false;
        }

        // 1. Location filter (using actual database location & inventory records)
        if (selectedLocation !== "All" && selectedLocation !== "All City Hubs") {
          const selLocLower = selectedLocation.toLowerCase().trim();
          const matchesLocation =
            car.locationNames.some((locName) => {
              const l = locName.toLowerCase().trim();
              return l === selLocLower || l.includes(selLocLower) || selLocLower.includes(l);
            }) ||
            car.locationIds.some((locId) => locId === selectedLocation) ||
            car.location.toLowerCase().includes(selLocLower);
          if (!matchesLocation) return false;
        }

        // 2. Price filter
        if (car.price > maxPrice) {
          return false;
        }

        // 3. Car Type / Vehicle Type filter (Database Single Source of Truth, NEVER matches variant)
        if (selectedCarTypes.length > 0) {
          const carType = (car.vehicleType || car.type || "").toLowerCase().trim();
          const matchesType = selectedCarTypes.some((type) => {
            const tLower = type.toLowerCase().trim();
            return carType === tLower || carType.includes(tLower) || tLower.includes(carType);
          });
          if (!matchesType) return false;
        }

        // 4. Transmission filter
        if (selectedTransmissions.length > 0) {
          const matchesTrans = selectedTransmissions.some(
            (t) => t.toLowerCase() === car.transmission.toLowerCase()
          );
          if (!matchesTrans) return false;
        }

        // 5. Fuel Type filter
        if (selectedFuelTypes.length > 0) {
          const matchesFuel = selectedFuelTypes.some(
            (f) => f.toLowerCase() === car.fuel.toLowerCase()
          );
          if (!matchesFuel) return false;
        }

        // 6. Seats filter
        if (selectedSeatOptions.length > 0) {
          const matchesSeats = selectedSeatOptions.some((seatOpt) => {
            if (seatOpt.includes("4") || seatOpt.includes("5")) return car.seats <= 5;
            if (seatOpt.includes("6") || seatOpt.includes("7")) return car.seats >= 6 && car.seats <= 7;
            if (seatOpt.includes("8")) return car.seats >= 8;
            return false;
          });
          if (!matchesSeats) return false;
        }

        // 7. Rating filter (Actual Approved Review Ratings)
        if (selectedMinRating > 0) {
          if (!car.rating || car.rating < selectedMinRating) return false;
        }

        // 8. Delivery Type filter
        if (homeDelivery) {
          if (!car.isAvailable) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "low") return a.price - b.price;
        if (sortOption === "high") return b.price - a.price;
        if (sortOption === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
        return 0;
      });
  }, [
    initialVehicles,
    searchQuery,
    selectedLocation,
    maxPrice,
    selectedCarTypes,
    selectedTransmissions,
    selectedFuelTypes,
    selectedSeatOptions,
    selectedMinRating,
    homeDelivery,
    sortOption,
  ]);

  // Sidebar Filter Component Content
  const renderFilterSidebar = () => (
    <div className="space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Filters</h2>
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset All
          </button>
        )}
      </div>

      {/* 1. Price Range Section */}
      {filterSettings.priceRange?.enabled && (
        <div className="border-b border-slate-100 pb-5">
          <button
            type="button"
            onClick={() => toggleSection("priceRange")}
            className="flex w-full items-center justify-between text-left font-bold text-slate-900 text-sm py-1 cursor-pointer group"
          >
            <span className="group-hover:text-emerald-700 transition-colors">
              {filterSettings.priceRange.label || "Price Range"}
            </span>
            {openSections.priceRange ? (
              <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            )}
          </button>

          {openSections.priceRange && (
            <div className="mt-4 space-y-3 px-1">
              <div className="flex items-center justify-between">
                <div className="relative bg-[#108A00] text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-sm">
                  ₹{minCatalogPrice.toLocaleString("en-IN")}
                </div>
                <div className="relative bg-[#108A00] text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-sm">
                  ₹{maxPrice.toLocaleString("en-IN")}
                </div>
              </div>

              <input
                type="range"
                min={minCatalogPrice}
                max={maxCatalogPrice}
                step={filterSettings.priceRange.step || 100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#108A00]"
              />

              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Min Price</span>
                <span>Max Price</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Car Type Filter (Actual Body/Category Types only) */}
      {filterSettings.carType?.enabled && dynamicCarTypes.length > 0 && (
        <div className="border-b border-slate-100 pb-5">
          <button
            type="button"
            onClick={() => toggleSection("carType")}
            className="flex w-full items-center justify-between text-left font-bold text-slate-900 text-sm py-1 cursor-pointer group"
          >
            <span className="group-hover:text-emerald-700 transition-colors">
              {filterSettings.carType.label || "Car Type"}
            </span>
            {openSections.carType ? (
              <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            )}
          </button>

          {openSections.carType && (
            <div className="mt-3.5 space-y-2">
              {dynamicCarTypes.map((type) => {
                const isChecked = selectedCarTypes.includes(type);
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        toggleArrayItem(selectedCarTypes, type, setSelectedCarTypes)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#108A00] focus:ring-[#108A00] accent-[#108A00] cursor-pointer"
                    />
                    <span>{type}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Fuel Type Section */}
      {filterSettings.fuelType?.enabled && dynamicFuelTypes.length > 0 && (
        <div className="border-b border-slate-100 pb-5">
          <button
            type="button"
            onClick={() => toggleSection("fuelType")}
            className="flex w-full items-center justify-between text-left font-bold text-slate-900 text-sm py-1 cursor-pointer group"
          >
            <span className="group-hover:text-emerald-700 transition-colors">
              {filterSettings.fuelType.label || "Fuel Type"}
            </span>
            {openSections.fuelType ? (
              <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            )}
          </button>

          {openSections.fuelType && (
            <div className="mt-3.5 space-y-2">
              {dynamicFuelTypes.map((fuel) => {
                const isChecked = selectedFuelTypes.includes(fuel);
                return (
                  <label
                    key={fuel}
                    className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        toggleArrayItem(selectedFuelTypes, fuel, setSelectedFuelTypes)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#108A00] focus:ring-[#108A00] accent-[#108A00] cursor-pointer"
                    />
                    <span>{fuel}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Transmission Section */}
      {filterSettings.transmission?.enabled && (
        <div className="border-b border-slate-100 pb-5">
          <button
            type="button"
            onClick={() => toggleSection("transmission")}
            className="flex w-full items-center justify-between text-left font-bold text-slate-900 text-sm py-1 cursor-pointer group"
          >
            <span className="group-hover:text-emerald-700 transition-colors">
              {filterSettings.transmission.label || "Transmission"}
            </span>
            {openSections.transmission ? (
              <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            )}
          </button>

          {openSections.transmission && (
            <div className="mt-3.5 space-y-2">
              {filterSettings.transmission.options.map((trans) => {
                const isChecked = selectedTransmissions.includes(trans);
                return (
                  <label
                    key={trans}
                    className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        toggleArrayItem(selectedTransmissions, trans, setSelectedTransmissions)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#108A00] focus:ring-[#108A00] accent-[#108A00] cursor-pointer"
                    />
                    <span>{trans}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Seats Section */}
      {filterSettings.seats?.enabled && (
        <div className="border-b border-slate-100 pb-5">
          <button
            type="button"
            onClick={() => toggleSection("seats")}
            className="flex w-full items-center justify-between text-left font-bold text-slate-900 text-sm py-1 cursor-pointer group"
          >
            <span className="group-hover:text-emerald-700 transition-colors">
              {filterSettings.seats.label || "Seats"}
            </span>
            {openSections.seats ? (
              <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            )}
          </button>

          {openSections.seats && (
            <div className="mt-3.5 space-y-2">
              {filterSettings.seats.options.map((seatOpt) => {
                const isChecked = selectedSeatOptions.includes(seatOpt);
                return (
                  <label
                    key={seatOpt}
                    className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        toggleArrayItem(selectedSeatOptions, seatOpt, setSelectedSeatOptions)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#108A00] focus:ring-[#108A00] accent-[#108A00] cursor-pointer"
                    />
                    <span>{seatOpt}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. User Ratings Section */}
      {filterSettings.userRatings?.enabled && (
        <div className="border-b border-slate-100 pb-5">
          <button
            type="button"
            onClick={() => toggleSection("userRatings")}
            className="flex w-full items-center justify-between text-left font-bold text-slate-900 text-sm py-1 cursor-pointer group"
          >
            <span className="group-hover:text-emerald-700 transition-colors">
              {filterSettings.userRatings.label || "User Ratings"}
            </span>
            {openSections.userRatings ? (
              <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            )}
          </button>

          {openSections.userRatings && (
            <div className="mt-3.5 space-y-2">
              {filterSettings.userRatings.options.map((ratingOpt, idx) => {
                const isSelected = selectedMinRating === ratingOpt.minRating;
                return (
                  <label
                    key={idx}
                    className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="userRatingFilter"
                      checked={isSelected}
                      onChange={() => setSelectedMinRating(ratingOpt.minRating)}
                      className="h-4 w-4 text-[#108A00] focus:ring-[#108A00] accent-[#108A00] cursor-pointer"
                    />
                    <span className="flex items-center gap-1">
                      {ratingOpt.label}
                      {ratingOpt.minRating > 0 && (
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7. Delivery Type Section */}
      {filterSettings.deliveryType?.enabled && (
        <div className="pb-2">
          <button
            type="button"
            onClick={() => toggleSection("deliveryType")}
            className="flex w-full items-center justify-between text-left font-bold text-slate-900 text-sm py-1 cursor-pointer group"
          >
            <span className="group-hover:text-emerald-700 transition-colors">
              {filterSettings.deliveryType.label || "Delivery Option"}
            </span>
            {openSections.deliveryType ? (
              <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
            )}
          </button>

          {openSections.deliveryType && (
            <div className="mt-3.5 space-y-2">
              <label className="flex items-start gap-3 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={homeDelivery}
                  onChange={(e) => setHomeDelivery(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#108A00] focus:ring-[#108A00] accent-[#108A00] cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-slate-800">Home Delivery</span>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{filterSettings.deliveryType.noticeText || "Delivery available across hub locations"}</span>
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="pb-24">
        {/* Banner Header - Modern White / Light Luxury Theme */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/75 border-b border-slate-200/80 px-4 pt-7 pb-12 sm:pt-9 sm:pb-16 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3 py-1 text-xs font-bold text-blue-700 mb-2.5 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Self-Drive Vehicle Fleet
                </div>

                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  {isDateFilterActive ? "Available Vehicles" : "Available Fleet Catalog"}
                </h1>

                <p className="mt-1.5 max-w-2xl text-xs sm:text-sm lg:text-base font-medium text-slate-600">
                  {isDateFilterActive
                    ? "Showing vehicles available for your selected rental period with verified instant confirmation."
                    : "Choose from our verified fleet of SUVs, Sedans, Luxury, and Hatchbacks with transparent dynamic pricing."}
                </p>
              </div>

              <div className="flex flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
                <div className="rounded-2xl border border-slate-200/90 bg-white/95 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-xs backdrop-blur-xs ring-1 ring-slate-100">
                  Showing <span className="text-emerald-600 font-black text-sm sm:text-base">{filteredCars.length}</span> available vehicles
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>100% Verified Fleet • Instant Confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Summary Component (Compact Horizontal on Desktop, Clean Stack on Mobile) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 z-20 relative">
          <SearchSummary
            searchContext={
              searchContext || {
                hasSearchContext: false,
                isValid: true,
              }
            }
            locations={locations}
          />
        </section>

        {/* Mobile Filter Toggle Button & Top Controls */}
        <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-xs lg:hidden mt-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 cursor-pointer"
            >
              <Filter className="h-4 w-4 text-emerald-400" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Quick Location dropdown on mobile */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="All">All City Hubs</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Layout: Left Sidebar + Right Fleet Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Sidebar: Filter System (Desktop) */}
            <aside className="hidden lg:block w-72 shrink-0 sticky top-24 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
              {renderFilterSidebar()}
            </aside>

            {/* Mobile Filter Drawer Modal */}
            {isMobileFilterOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden">
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                  onClick={() => setIsMobileFilterOpen(false)}
                />
                <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-6 shadow-2xl overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <h3 className="font-extrabold text-slate-900 text-lg">Filter Options</h3>
                    <button
                      type="button"
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  {renderFilterSidebar()}
                  <div className="sticky bottom-0 pt-4 mt-6 bg-white border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="w-full py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer hover:bg-emerald-800"
                    >
                      Show {filteredCars.length} Results
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Right Main Results Area */}
            <div className="flex-1 min-w-0 w-full">
              {/* Top Controls Bar (Location + Sorting) */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-400 mr-1">Hub Location:</span>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <option value="All">All City Hubs</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Sort:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <option value="default">Recommended</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                    <option value="rating">Top Rated (Stars)</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Badges */}
              {activeFiltersCount > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Active filters:</span>
                  {selectedLocation !== "All" && selectedLocation !== "All City Hubs" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                      <span>Hub: {selectedLocation}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedLocation("All")}
                        className="hover:text-emerald-900 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {homeDelivery && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                      <span>Home Delivery</span>
                      <button
                        type="button"
                        onClick={() => setHomeDelivery(false)}
                        className="hover:text-emerald-900 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedCarTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-800"
                    >
                      <span>{type}</span>
                      <button
                        type="button"
                        onClick={() =>
                          toggleArrayItem(selectedCarTypes, type, setSelectedCarTypes)
                        }
                        className="hover:text-purple-900 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedTransmissions.map((trans) => (
                    <span
                      key={trans}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-800"
                    >
                      <span>{trans}</span>
                      <button
                        type="button"
                        onClick={() =>
                          toggleArrayItem(
                            selectedTransmissions,
                            trans,
                            setSelectedTransmissions
                          )
                        }
                        className="hover:text-blue-900 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedFuelTypes.map((fuel) => (
                    <span
                      key={fuel}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800"
                    >
                      <span>{fuel}</span>
                      <button
                        type="button"
                        onClick={() =>
                          toggleArrayItem(selectedFuelTypes, fuel, setSelectedFuelTypes)
                        }
                        className="hover:text-amber-900 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedSeatOptions.map((seat) => (
                    <span
                      key={seat}
                      className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-800"
                    >
                      <span>{seat}</span>
                      <button
                        type="button"
                        onClick={() =>
                          toggleArrayItem(
                            selectedSeatOptions,
                            seat,
                            setSelectedSeatOptions
                          )
                        }
                        className="hover:text-indigo-900 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {selectedMinRating > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                      <span>≥ {selectedMinRating}★ Rating</span>
                      <button
                        type="button"
                        onClick={() => setSelectedMinRating(0)}
                        className="hover:text-amber-900 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline ml-2 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Cars Grid / Empty State */}
              {filteredCars.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center my-6 shadow-xs space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <CarIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {isDateFilterActive
                      ? "No cars available for your selected rental period."
                      : "No Vehicles Found Matching Your Filters"}
                  </h3>
                  {isDateFilterActive && (startDateText || endDateText) ? (
                    <div className="max-w-md mx-auto space-y-3">
                      <p className="text-xs sm:text-sm text-slate-600">
                        All matching fleet vehicles are reserved or unavailable for this selected interval:
                      </p>
                      <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700">
                        {startDateText && (
                          <span>
                            Pickup: <strong className="text-blue-600">{startDateText}</strong>
                          </span>
                        )}
                        {startDateText && endDateText && (
                          <span className="hidden sm:inline text-slate-300">•</span>
                        )}
                        {endDateText && (
                          <span>
                            Return: <strong className="text-sky-600">{endDateText}</strong>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Try modifying your pickup or return date/time, or changing the hub location.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      Try adjusting the price slider, clearing fuel, category, or transmission selections, or searching all hub locations.
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset Filter Criteria
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredCars.map((car) => {
                    const detailHref = getVehicleDetailHref(car.id);

                    return (
                      <article
                        key={car.id}
                        className="group overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Clean Vehicle Image Container */}
                          <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                            <CarImageSlider
                              primaryImage={car.image}
                              images={car.images}
                              alt={car.name}
                              brand={car.brand}
                              model={car.model}
                            />

                            {/* Favorite / Heart Button Floating Top-Right */}
                            <div className="absolute top-3 right-3 z-20">
                              <FavoriteButton
                                vehicleId={car.id}
                                vehicleName={car.name}
                                size="sm"
                              />
                            </div>
                          </div>

                          {/* Vehicle Information Below Image */}
                          <div className="p-5 space-y-3">
                            {/* Name, Variant on Left & Rating on Right */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors truncate">
                                  {car.name}
                                </h3>
                                {car.variant && (
                                  <p className="text-xs font-semibold text-slate-400 mt-0.5 truncate">
                                    {car.variant}
                                  </p>
                                )}
                              </div>

                              {/* Rating / Reviews on Right */}
                              <div className="shrink-0 text-right">
                                {car.reviewCount && car.reviewCount > 0 && car.rating ? (
                                  <div className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <span>{car.rating.toFixed(1)} ({car.reviewCount})</span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-medium text-slate-400">
                                    No reviews yet
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Location Tag */}
                            {getVehicleDisplayLocation(car) && (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{getVehicleDisplayLocation(car)}</span>
                              </div>
                            )}

                            {/* Specs Matrix: Fuel, Transmission, Seats, AC */}
                            <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                              <div className="rounded-xl bg-slate-50 border border-slate-100 p-2 text-slate-700 min-w-0">
                                <Fuel className="mx-auto h-3.5 w-3.5 text-emerald-600 mb-0.5" />
                                <span className="text-[10px] font-bold block truncate">
                                  {car.fuel}
                                </span>
                              </div>
                              <div className="rounded-xl bg-slate-50 border border-slate-100 p-2 text-slate-700 min-w-0">
                                <Gauge className="mx-auto h-3.5 w-3.5 text-blue-600 mb-0.5" />
                                <span className="text-[10px] font-bold block truncate">
                                  {car.transmission}
                                </span>
                              </div>
                              <div className="rounded-xl bg-slate-50 border border-slate-100 p-2 text-slate-700 min-w-0">
                                <Users className="mx-auto h-3.5 w-3.5 text-indigo-600 mb-0.5" />
                                <span className="text-[10px] font-bold block truncate">
                                  {car.seats} Seats
                                </span>
                              </div>
                              <div className="rounded-xl bg-slate-50 border border-slate-100 p-2 text-slate-700 min-w-0">
                                <Wind className="mx-auto h-3.5 w-3.5 text-cyan-600 mb-0.5" />
                                <span className="text-[10px] font-bold block truncate">
                                  {car.hasAirConditioning !== false ? "AC" : "Non-AC"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Price & View Details CTA */}
                        <div className="p-5 pt-0">
                          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5">
                            <div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-slate-900">
                                  ₹{car.price.toLocaleString("en-IN")}
                                </span>
                                <span className="text-xs font-medium text-slate-500">/day</span>
                              </div>
                              {car.deposit > 0 && (
                                <p className="text-[10px] text-slate-400 font-medium">
                                  Deposit: ₹{car.deposit.toLocaleString("en-IN")}
                                </p>
                              )}
                            </div>

                            <Link
                              href={detailHref}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-black/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <span>View Details</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
