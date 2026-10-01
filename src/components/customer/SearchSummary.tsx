"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  RotateCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CalendarSearch,
  CheckCircle2,
} from "lucide-react";
import SearchBox, { SearchLocationItem, SearchBoxInitialValues } from "@/components/customer/SearchBox";
import { ParsedSearchContext, buildSearchQuery } from "@/lib/datetime";

type SearchSummaryProps = {
  searchContext: ParsedSearchContext;
  locations: SearchLocationItem[];
};

export default function SearchSummary({ searchContext, locations }: SearchSummaryProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const {
    hasSearchContext,
    location,
    returnLocation,
    startDate,
    startTime,
    endDate,
    endTime,
    startFormatted,
    endFormatted,
    isValid,
    validationError,
  } = searchContext;

  const isCompleteAndValid = hasSearchContext && isValid && startFormatted && endFormatted;

  const initialSearchValues: SearchBoxInitialValues = {
    pickupLocation: location || "",
    returnLocation: returnLocation || location || "",
    startDate: startDate || "",
    startTime: startTime || "10:00",
    endDate: endDate || "",
    endTime: endTime || "18:00",
    rentalType: "self-drive",
  };

  const handleUpdateSearch = (params: URLSearchParams) => {
    setIsEditing(false);
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Compact Search Summary Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Summary Details or Prompt */}
            {isCompleteAndValid ? (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Your Rental Search
                  </span>
                  <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                    Showing vehicles available for your exact dates & times
                  </span>
                </div>

                {/* 4 Key Details: Pickup Location, Return Location, Pickup DateTime, Return DateTime */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Pickup Location */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <MapPin className="h-3 w-3 text-blue-600 shrink-0" />
                      <span>Pickup Location</span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {location || "All Hubs"}
                    </p>
                  </div>

                  {/* Return Location */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <RotateCw className="h-3 w-3 text-blue-600 shrink-0" />
                      <span>Return Location</span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {returnLocation || location || "Same as Pickup"}
                    </p>
                  </div>

                  {/* Pickup DateTime */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar className="h-3 w-3 text-blue-600 shrink-0" />
                      <span>Pickup</span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {startFormatted}
                    </p>
                  </div>

                  {/* Return DateTime */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <Clock className="h-3 w-3 text-sky-600 shrink-0" />
                      <span>Return</span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {endFormatted}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    Fleet Catalog
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Showing all vehicles in our fleet
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">
                  {validationError
                    ? validationError
                    : "Select your exact pickup & return dates and times to filter available cars with real-time inventory."}
                </p>
              </div>
            )}

            {/* Right Action: Edit Search / Select Dates Button */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0A1128] hover:bg-slate-800 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {isCompleteAndValid ? (
                  <>
                    <SlidersHorizontal className="h-4 w-4 text-blue-400" />
                    <span>Edit Search</span>
                    {isEditing ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </>
                ) : (
                  <>
                    <CalendarSearch className="h-4 w-4 text-blue-400" />
                    <span>Search by Date & Time</span>
                    {isEditing ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Edit Search Box */}
        {isEditing && (
          <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6 animate-fadeIn">
            <SearchBox
              locations={locations}
              initialValues={initialSearchValues}
              onSearch={handleUpdateSearch}
              onClose={() => setIsEditing(false)}
              isCompact={true}
              title="Modify Your Rental Search"
              submitButtonText="Search Available Cars"
            />
          </div>
        )}
      </div>
    </div>
  );
}
