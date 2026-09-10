"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  MapPin,
  Search,
  Car,
  CalendarCheck,
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
  const [rentalType, setRentalType] = useState("self-drive");
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

    router.push(`/cars?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      {/* Rental Type Switcher */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setRentalType("self-drive")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              rentalType === "self-drive"
                ? "bg-slate-950 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Car className="h-4 w-4 text-blue-400" />
            <span>Self-Drive Daily</span>
          </button>

          <button
            type="button"
            onClick={() => setRentalType("monthly")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              rentalType === "monthly"
                ? "bg-slate-950 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarCheck className="h-4 w-4 text-blue-400" />
            <span>Monthly Subscription</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch}>
        {/* Location Fields */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Pickup Location */}
          <div className="space-y-2">
            <label
              htmlFor="pickup-location"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5"
            >
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span>Pickup Location</span>
            </label>

            <div className="relative">
              <select
                id="pickup-location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
            </div>
          </div>

          {/* Return Location */}
          <div className="space-y-2">
            <label
              htmlFor="return-location"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5"
            >
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>Return Location</span>
            </label>

            <div className="relative">
              <select
                id="return-location"
                value={returnLocation}
                onChange={(e) => setReturnLocation(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
            </div>
          </div>
        </div>

        {/* Date & Time Grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pickup Date */}
          <div className="space-y-2">
            <label
              htmlFor="pickup-date"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1"
            >
              <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
              <span>Pickup Date</span>
            </label>

            <input
              id="pickup-date"
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Pickup Time */}
          <div className="space-y-2">
            <label
              htmlFor="pickup-time"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1"
            >
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Pickup Time</span>
            </label>

            <input
              id="pickup-time"
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Return Date */}
          <div className="space-y-2">
            <label
              htmlFor="return-date"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1"
            >
              <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
              <span>Return Date</span>
            </label>

            <input
              id="return-date"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Return Time */}
          <div className="space-y-2">
            <label
              htmlFor="return-time"
              className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1"
            >
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Return Time</span>
            </label>

            <input
              id="return-time"
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Search CTA */}
        <div className="mt-7">
          <button
            type="submit"
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-slate-950 via-blue-900 to-blue-600 text-base font-extrabold text-white shadow-xl transition-all hover:scale-[1.005] hover:shadow-blue-500/25 active:scale-[0.99]"
          >
            <Search className="h-5 w-5 text-blue-300" />
            <span>Search Available Cars</span>
          </button>
        </div>
      </form>
    </div>
  );
}