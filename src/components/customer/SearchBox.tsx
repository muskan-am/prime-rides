"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  Search,
  Car,
  Calendar,
  Tag,
  ChevronDown,
  Sparkles,
  RotateCw,
} from "lucide-react";

export type SearchLocationItem = {
  id: string;
  name: string;
};

type SearchBoxProps = {
  locations?: SearchLocationItem[];
};

export default function SearchBox({ locations = [] }: SearchBoxProps) {
  const router = useRouter();
  const [rentalType, setRentalType] = useState<"self-drive" | "monthly" | "long-term">("self-drive");
  const [pickupLocation, setPickupLocation] = useState("");
  const [returnLocation, setReturnLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (pickupLocation) {
      params.set("location", pickupLocation);
    }
    if (rentalType) {
      params.set("type", rentalType);
    }

    if (pickupDate) {
      const fullPickup = pickupTime
        ? `${pickupDate}T${pickupTime}`
        : `${pickupDate}T09:00`;
      params.set("startDate", fullPickup);
    }

    if (returnDate) {
      const fullReturn = returnTime
        ? `${returnDate}T${returnTime}`
        : `${returnDate}T09:00`;
      params.set("endDate", fullReturn);
    }

    if (rentalType === "monthly") {
      router.push(`/packages/monthly`);
      return;
    }

    if (rentalType === "long-term") {
      router.push(`/packages/yearly`);
      return;
    }

    router.push(`/cars?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
      {/* Rental Type Switcher & Tagline */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Self-Drive Daily Tab */}
          <button
            type="button"
            onClick={() => setRentalType("self-drive")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              rentalType === "self-drive"
                ? "bg-[#0A1128] text-white shadow-md shadow-slate-950/20"
                : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60 font-semibold"
            }`}
          >
            <Car className={`h-4 w-4 ${rentalType === "self-drive" ? "text-blue-400" : "text-slate-500"}`} />
            <span>Self-Drive Daily</span>
          </button>

          {/* Monthly Tab */}
          <button
            type="button"
            onClick={() => setRentalType("monthly")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm transition-all cursor-pointer ${
              rentalType === "monthly"
                ? "bg-[#0A1128] text-white font-bold shadow-md shadow-slate-950/20"
                : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60 font-semibold"
            }`}
          >
            <Calendar className={`h-4 w-4 ${rentalType === "monthly" ? "text-blue-400" : "text-blue-600"}`} />
            <span>Monthly</span>
          </button>

          {/* Long Term Tab */}
          <button
            type="button"
            onClick={() => setRentalType("long-term")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm transition-all cursor-pointer ${
              rentalType === "long-term"
                ? "bg-[#0A1128] text-white font-bold shadow-md shadow-slate-950/20"
                : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60 font-semibold"
            }`}
          >
            <Tag className={`h-4 w-4 ${rentalType === "long-term" ? "text-blue-400" : "text-blue-600"}`} />
            <span>Long Term</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500">
          <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
          <span>Flexible. Affordable. On Your Terms.</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Location Fields (Row 1) */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pickup Location */}
          <div className="space-y-1.5">
            <label
              htmlFor="pickup-location"
              className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"
            >
              <RotateCw className="h-3 w-3 text-slate-400" />
              <span>Pickup Location</span>
            </label>

            <div className="relative flex items-center rounded-2xl border border-blue-100/90 bg-[#F0F7FF] px-4 h-13 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0 mr-2.5" />
              <select
                id="pickup-location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="">Select Pickup Location (All Hubs)</option>
                {locations.length > 0
                  ? locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))
                  : [
                      <option key="delhi" value="delhi">
                        Delhi NCR Hub
                      </option>,
                      <option key="goa" value="goa">
                        Goa International Hub
                      </option>,
                      <option key="bangalore" value="bangalore">
                        Bangalore Airport Hub
                      </option>,
                    ]}
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-4 pointer-events-none" />
            </div>
          </div>

          {/* Return Location */}
          <div className="space-y-1.5">
            <label
              htmlFor="return-location"
              className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"
            >
              <RotateCw className="h-3 w-3 text-slate-400" />
              <span>Return Location</span>
            </label>

            <div className="relative flex items-center rounded-2xl border border-blue-100/90 bg-[#F0F7FF] px-4 h-13 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0 mr-2.5" />
              <select
                id="return-location"
                value={returnLocation}
                onChange={(e) => setReturnLocation(e.target.value)}
                className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="">Same as Pickup Location</option>
                {locations.length > 0
                  ? locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))
                  : [
                      <option key="delhi" value="delhi">
                        Delhi NCR Hub
                      </option>,
                      <option key="goa" value="goa">
                        Goa Hub
                      </option>,
                      <option key="bangalore" value="bangalore">
                        Bangalore Hub
                      </option>,
                    ]}
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Date & Time Grid + Search Button (Row 2) */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end pt-1">
          {/* Pickup Date */}
          <div className="space-y-1.5">
            <label
              htmlFor="pickup-date"
              className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"
            >
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>Pickup Date</span>
            </label>

            <div className="relative flex items-center rounded-2xl border border-blue-100/90 bg-[#F0F7FF] px-3.5 h-13 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <Calendar className="h-4 w-4 text-blue-600 shrink-0 mr-2 pointer-events-none" />
              <input
                id="pickup-date"
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Pickup Time */}
          <div className="space-y-1.5">
            <label
              htmlFor="pickup-time"
              className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"
            >
              <Clock className="h-3 w-3 text-slate-400" />
              <span>Pickup Time</span>
            </label>

            <div className="relative flex items-center rounded-2xl border border-blue-100/90 bg-[#F0F7FF] px-3.5 h-13 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <Clock className="h-4 w-4 text-blue-600 shrink-0 mr-2 pointer-events-none" />
              <input
                id="pickup-time"
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Return Date */}
          <div className="space-y-1.5">
            <label
              htmlFor="return-date"
              className="text-xs font-semibold text-sky-600 flex items-center gap-1.5"
            >
              <Calendar className="h-3 w-3 text-sky-500" />
              <span>Return Date</span>
            </label>

            <div className="relative flex items-center rounded-2xl border border-blue-100/90 bg-[#F0F7FF] px-3.5 h-13 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <Calendar className="h-4 w-4 text-blue-600 shrink-0 mr-2 pointer-events-none" />
              <input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Return Time */}
          <div className="space-y-1.5">
            <label
              htmlFor="return-time"
              className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"
            >
              <Clock className="h-3 w-3 text-slate-400" />
              <span>Return Time</span>
            </label>

            <div className="relative flex items-center rounded-2xl border border-blue-100/90 bg-[#F0F7FF] px-3.5 h-13 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <Clock className="h-4 w-4 text-blue-600 shrink-0 mr-2 pointer-events-none" />
              <input
                id="return-time"
                type="time"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Search CTA Button */}
          <div>
            <button
              type="submit"
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span>Search Available Cars</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}