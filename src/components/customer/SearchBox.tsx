"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  X,
} from "lucide-react";
import { buildDateTime } from "@/lib/datetime";

export type SearchLocationItem = {
  id: string;
  name: string;
};

export type SearchBoxInitialValues = {
  pickupLocation?: string;
  returnLocation?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  rentalType?: "self-drive" | "monthly" | "long-term";
};

type SearchBoxProps = {
  locations?: SearchLocationItem[];
  initialValues?: SearchBoxInitialValues;
  onSearch?: (params: URLSearchParams) => void;
  onClose?: () => void;
  isCompact?: boolean;
  className?: string;
  title?: string;
  submitButtonText?: string;
};

export default function SearchBox({
  locations = [],
  initialValues,
  onSearch,
  onClose,
  isCompact = false,
  className = "",
  title,
  submitButtonText = "Search Available Cars",
}: SearchBoxProps) {
  const router = useRouter();
  const [rentalType, setRentalType] = useState<"self-drive" | "monthly" | "long-term">(
    initialValues?.rentalType || "self-drive"
  );
  const [pickupLocation, setPickupLocation] = useState(initialValues?.pickupLocation || "");
  const [returnLocation, setReturnLocation] = useState(initialValues?.returnLocation || "");
  const [pickupDate, setPickupDate] = useState(initialValues?.startDate || "");
  const [pickupTime, setPickupTime] = useState(initialValues?.startTime || "");
  const [returnDate, setReturnDate] = useState(initialValues?.endDate || "");
  const [returnTime, setReturnTime] = useState(initialValues?.endTime || "");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state if initialValues change
  useEffect(() => {
    if (initialValues) {
      if (initialValues.pickupLocation !== undefined) setPickupLocation(initialValues.pickupLocation);
      if (initialValues.returnLocation !== undefined) setReturnLocation(initialValues.returnLocation);
      if (initialValues.startDate !== undefined) setPickupDate(initialValues.startDate);
      if (initialValues.startTime !== undefined) setPickupTime(initialValues.startTime);
      if (initialValues.endDate !== undefined) setReturnDate(initialValues.endDate);
      if (initialValues.endTime !== undefined) setReturnTime(initialValues.endTime);
      if (initialValues.rentalType !== undefined) setRentalType(initialValues.rentalType);
    }
  }, [initialValues]);

  // Today's date string YYYY-MM-DD for min attribute
  const todayStr = new Date().toISOString().split("T")[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Handle package redirects
    if (rentalType === "monthly") {
      router.push(`/packages/monthly`);
      return;
    }

    if (rentalType === "long-term") {
      router.push(`/packages/yearly`);
      return;
    }

    // Validation for self-drive search
    if (!pickupLocation || pickupLocation.trim() === "") {
      setValidationError("Please select a pickup location.");
      return;
    }

    if (!pickupDate || pickupDate.trim() === "") {
      setValidationError("Please select a pickup date.");
      return;
    }

    if (!pickupTime || pickupTime.trim() === "") {
      setValidationError("Please select a pickup time.");
      return;
    }

    if (!returnDate || returnDate.trim() === "") {
      setValidationError("Please select a return date.");
      return;
    }

    if (!returnTime || returnTime.trim() === "") {
      setValidationError("Please select a return time.");
      return;
    }

    const startDateTime = buildDateTime(pickupDate, pickupTime);
    const endDateTime = buildDateTime(returnDate, returnTime);

    if (!startDateTime || !endDateTime || isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setValidationError("Please enter valid dates and times.");
      return;
    }

    // 5-minute grace period buffer for past date checks
    const nowWithBuffer = new Date(Date.now() - 5 * 60 * 1000);
    if (startDateTime < nowWithBuffer) {
      setValidationError("Pickup date and time cannot be in the past.");
      return;
    }

    if (endDateTime.getTime() <= startDateTime.getTime()) {
      setValidationError("Return date and time must be after pickup date and time.");
      return;
    }

    const effectiveReturnLocation = returnLocation || pickupLocation;

    const params = new URLSearchParams();
    params.set("location", pickupLocation);
    params.set("returnLocation", effectiveReturnLocation);
    params.set("startDate", pickupDate);
    params.set("startTime", pickupTime);
    params.set("endDate", returnDate);
    params.set("endTime", returnTime);

    if (onSearch) {
      onSearch(params);
    } else {
      router.push(`/cars?${params.toString()}`);
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`mx-auto w-full rounded-[2rem] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] ${
        isCompact ? "max-w-5xl" : "max-w-6xl"
      } ${className}`}
    >
      {/* Header / Title if provided */}
      {title && (
        <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close search box"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {/* Rental Type Switcher & Tagline */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Self-Drive Daily Tab */}
          <button
            type="button"
            onClick={() => {
              setRentalType("self-drive");
              setValidationError(null);
            }}
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
            onClick={() => {
              setRentalType("monthly");
              setValidationError(null);
            }}
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
            onClick={() => {
              setRentalType("long-term");
              setValidationError(null);
            }}
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

      {/* Validation Error Alert */}
      {validationError && (
        <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200/80 p-3.5 flex items-center gap-2.5 text-rose-800 text-xs sm:text-sm font-bold animate-shake">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Location Fields (Row 1) */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pickup Location */}
          <div className="space-y-1.5">
            <label
              htmlFor="pickup-location"
              className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"
            >
              <MapPin className="h-3 w-3 text-slate-400" />
              <span>Pickup Location *</span>
            </label>

            <div className="relative flex items-center rounded-2xl border border-blue-100/90 bg-[#F0F7FF] px-4 h-13 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0 mr-2.5" />
              <select
                id="pickup-location"
                value={pickupLocation}
                onChange={(e) => {
                  setPickupLocation(e.target.value);
                  setValidationError(null);
                }}
                className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="">Select Pickup Location (Required)</option>
                {locations.length > 0
                  ? locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))
                  : [
                      <option key="delhi" value="Delhi NCR Hub">
                        Delhi NCR Hub
                      </option>,
                      <option key="goa" value="Goa Main Hub">
                        Goa Main Hub
                      </option>,
                      <option key="bangalore" value="Bangalore Airport Hub">
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
                onChange={(e) => {
                  setReturnLocation(e.target.value);
                  setValidationError(null);
                }}
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
                      <option key="delhi" value="Delhi NCR Hub">
                        Delhi NCR Hub
                      </option>,
                      <option key="goa" value="Goa Main Hub">
                        Goa Main Hub
                      </option>,
                      <option key="bangalore" value="Bangalore Airport Hub">
                        Bangalore Airport Hub
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
              <span>Pickup Date *</span>
            </label>

            <div className="relative flex items-center rounded-2xl border border-blue-100/90 bg-[#F0F7FF] px-3.5 h-13 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <Calendar className="h-4 w-4 text-blue-600 shrink-0 mr-2 pointer-events-none" />
              <input
                id="pickup-date"
                type="date"
                min={todayStr}
                value={pickupDate}
                onChange={(e) => {
                  setPickupDate(e.target.value);
                  setValidationError(null);
                  if (!pickupTime) setPickupTime("10:00");
                  if (!returnDate) setReturnDate(e.target.value);
                  if (!returnTime) setReturnTime("18:00");
                }}
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
              <span>Pickup Time *</span>
            </label>

            <div className="relative flex items-center rounded-2xl border border-blue-100/90 bg-[#F0F7FF] px-3.5 h-13 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <Clock className="h-4 w-4 text-blue-600 shrink-0 mr-2 pointer-events-none" />
              <input
                id="pickup-time"
                type="time"
                value={pickupTime}
                onChange={(e) => {
                  setPickupTime(e.target.value);
                  setValidationError(null);
                }}
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
              <span>Return Date *</span>
            </label>

            <div className="relative flex items-center rounded-2xl border border-blue-100/90 bg-[#F0F7FF] px-3.5 h-13 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <Calendar className="h-4 w-4 text-blue-600 shrink-0 mr-2 pointer-events-none" />
              <input
                id="return-date"
                type="date"
                min={pickupDate || todayStr}
                value={returnDate}
                onChange={(e) => {
                  setReturnDate(e.target.value);
                  setValidationError(null);
                  if (!returnTime) setReturnTime("18:00");
                }}
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
              <span>Return Time *</span>
            </label>

            <div className="relative flex items-center rounded-2xl border border-blue-100/90 bg-[#F0F7FF] px-3.5 h-13 transition-all focus-within:border-blue-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
              <Clock className="h-4 w-4 text-blue-600 shrink-0 mr-2 pointer-events-none" />
              <input
                id="return-time"
                type="time"
                value={returnTime}
                onChange={(e) => {
                  setReturnTime(e.target.value);
                  setValidationError(null);
                }}
                className="h-full w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Search CTA Button */}
          <div>
            <button
              type="submit"
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 text-sm font-bold text-white shadow-md shadow-black/15 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span>{submitButtonText}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}