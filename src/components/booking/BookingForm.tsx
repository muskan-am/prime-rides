"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

type RentalPackage = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: string | number;
};

type MonthlyPlan = {
  id: string;
  name: string;
  months: number;
  price: string | number;
};

type Location = {
  id: string;
  name: string;
  address: string | null;
  deliveryCharge: string | number;
};

type PickupOption = {
  id: string;
  name: string;
  description: string | null;
};

type BookingFormProps = {
  vehicleId: string;
  basePrice: string | number;
  taxRate: string | number;
  rentalPackages: RentalPackage[];
  monthlyPlans: MonthlyPlan[];
  locations: Location[];
  pickupOptions: PickupOption[];
};

/* =========================================
   Calculate End Date
========================================= */

const calculateEndDate = (
  startDateTime: string,
  duration: number,
  isMonthly: boolean
) => {
  if (!startDateTime || !duration) {
    return "";
  }

  const [datePart, timePart = "00:00"] =
    startDateTime.split("T");

  const [year, month, day] = datePart
    .split("-")
    .map(Number);

  const [hours, minutes] = timePart
    .split(":")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes
  );

  if (isMonthly) {
    date.setMonth(
      date.getMonth() + duration
    );
  } else {
    date.setDate(
      date.getDate() + duration
    );
  }

  const formattedYear =
    date.getFullYear();

  const formattedMonth = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const formattedDay = String(
    date.getDate()
  ).padStart(2, "0");

  const formattedHours = String(
    date.getHours()
  ).padStart(2, "0");

  const formattedMinutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${formattedYear}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}`;
};

/* =========================================
   Main Component
========================================= */

export default function BookingForm({
  vehicleId,
  basePrice,
  taxRate,
  rentalPackages,
  monthlyPlans,
  locations,
  pickupOptions,
}: BookingFormProps) {
  const router = useRouter();

  /* =========================================
     Booking Type
  ========================================= */

  const [bookingType, setBookingType] =
    useState<
      "PACKAGE" | "NORMAL" | "MONTHLY"
    >("PACKAGE");

  /* =========================================
     Selected Package / Plan
  ========================================= */

  const [selectedPackage, setSelectedPackage] =
    useState<string>("");

  const [selectedPlan, setSelectedPlan] =
    useState<string>("");

  /* =========================================
     Pickup Location
  ========================================= */

  const [locationId, setLocationId] =
    useState<string>(
      locations[0]?.id ?? ""
    );

  useEffect(() => {
    if (locations.length === 0) {
      setLocationId("");
      return;
    }

    setLocationId((currentLocationId) => {
      const currentLocationStillExists =
        locations.some(
          (location) =>
            location.id &&
            location.id === currentLocationId
        );

      if (currentLocationStillExists) {
        return currentLocationId;
      }

      return locations[0]?.id ?? "";
    });
  }, [locations]);

  const effectiveLocationId =
    locations.some(
      (location) =>
        location.id &&
        location.id === locationId
    )
      ? locationId
      : locations[0]?.id ?? "";

  /* =========================================
     Selected Location
  ========================================= */

  const selectedLocation =
    locations.find(
      (location) =>
        location.id === effectiveLocationId
    );

  /* =========================================
     Delivery Charge
  ========================================= */

  const deliveryCharge = Number(
    selectedLocation?.deliveryCharge ?? 0
  );

  /* =========================================
     Pickup Option
  ========================================= */

  const [pickupOptionId, setPickupOptionId] =
    useState<string>("");

  /* =========================================
     Dates
  ========================================= */

  const [startDate, setStartDate] =
    useState<string>("");

  const [endDate, setEndDate] =
    useState<string>("");

  /* =========================================
     UI State
  ========================================= */

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  /* =========================================
     Selected Package Data
  ========================================= */

  const selectedPackageData =
    rentalPackages.find(
      (item) =>
        item.id === selectedPackage
    );

  /* =========================================
     Selected Monthly Plan Data
  ========================================= */

  const selectedPlanData =
    monthlyPlans.find(
      (item) =>
        item.id === selectedPlan
    );

  /* =========================================
     Selected Price
  ========================================= */

  const selectedPrice =
    bookingType === "PACKAGE"
      ? selectedPackageData?.price
      : bookingType === "MONTHLY"
        ? selectedPlanData?.price
        : undefined;

  /* =========================================
     Normal Rental Days
  ========================================= */

  const normalRentalDays =
    bookingType === "NORMAL" &&
    startDate &&
    endDate
      ? Math.ceil(
          (new Date(endDate).getTime() -
            new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  /* =========================================
     Rental Amount
  ========================================= */

  const rentalAmount =
    bookingType === "NORMAL"
      ? normalRentalDays > 0
        ? Number(basePrice) *
          normalRentalDays
        : 0
      : selectedPrice !== undefined
        ? Number(selectedPrice)
        : 0;

  /* =========================================
     Discount
  ========================================= */

  const discountAmount = 0;

   /* =========================================
   Tax
========================================= */

  const taxAmount =
  rentalAmount *
  (Number(taxRate) / 100);
  /* =========================================
     Total Amount
  ========================================= */

  const totalAmount =
    rentalAmount +
    deliveryCharge +
    taxAmount -
    discountAmount;

  /* =========================================
     Booking Type Change
  ========================================= */

  const handleBookingTypeChange = (
    type:
      | "PACKAGE"
      | "NORMAL"
      | "MONTHLY"
  ) => {
    if (loading) return;

    setBookingType(type);
    setError("");
    setEndDate("");

    if (type === "PACKAGE") {
      setSelectedPlan("");

      if (
        selectedPackageData &&
        startDate
      ) {
        setEndDate(
          calculateEndDate(
            startDate,
            selectedPackageData.duration,
            false
          )
        );
      }

      return;
    }

    if (type === "MONTHLY") {
      setSelectedPackage("");

      if (
        selectedPlanData &&
        startDate
      ) {
        setEndDate(
          calculateEndDate(
            startDate,
            selectedPlanData.months,
            true
          )
        );
      }

      return;
    }

    setSelectedPackage("");
    setSelectedPlan("");
  };

  /* =========================================
     Package Change
  ========================================= */

  const handlePackageChange = (
    packageId: string
  ) => {
    if (loading) return;

    setSelectedPackage(packageId);
    setSelectedPlan("");
    setError("");

    const packageData =
      rentalPackages.find(
        (item) =>
          item.id === packageId
      );

    if (
      packageData &&
      startDate
    ) {
      setEndDate(
        calculateEndDate(
          startDate,
          packageData.duration,
          false
        )
      );
    } else {
      setEndDate("");
    }
  };

  /* =========================================
     Monthly Plan Change
  ========================================= */

  const handlePlanChange = (
    planId: string
  ) => {
    if (loading) return;

    setSelectedPlan(planId);
    setSelectedPackage("");
    setError("");

    const planData =
      monthlyPlans.find(
        (item) =>
          item.id === planId
      );

    if (
      planData &&
      startDate
    ) {
      setEndDate(
        calculateEndDate(
          startDate,
          planData.months,
          true
        )
      );
    } else {
      setEndDate("");
    }
  };

  /* =========================================
     Pickup Location Change
  ========================================= */

  const handleLocationChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    if (loading) return;

    const value =
      event.target.value;

    setLocationId(value);
    setError("");
  };

  /* =========================================
     Pickup Option Change
  ========================================= */

  const handlePickupOptionChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    if (loading) return;

    const value =
      event.target.value;

    setPickupOptionId(value);
    setError("");
  };

  /* =========================================
     Start Date Change
  ========================================= */

  const handleStartDateChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (loading) return;

    const value =
      event.target.value;

    setStartDate(value);
    setError("");

    if (
      bookingType === "PACKAGE" &&
      selectedPackageData
    ) {
      setEndDate(
        calculateEndDate(
          value,
          selectedPackageData.duration,
          false
        )
      );

      return;
    }

    if (
      bookingType === "MONTHLY" &&
      selectedPlanData
    ) {
      setEndDate(
        calculateEndDate(
          value,
          selectedPlanData.months,
          true
        )
      );

      return;
    }

    if (bookingType === "NORMAL") {
      if (
        endDate &&
        new Date(endDate).getTime() <=
          new Date(value).getTime()
      ) {
        setEndDate("");
      }
    }
  };

  /* =========================================
     End Date Change
  ========================================= */

  const handleEndDateChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (loading) return;

    if (bookingType !== "NORMAL") {
      return;
    }

    setEndDate(
      event.target.value
    );

    setError("");
  };

  /* =========================================
     Submit Booking
  ========================================= */

  const handleBooking = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!effectiveLocationId) {
      setError(
        "Please select a pickup location."
      );
      return;
    }

    if (!startDate || !endDate) {
      setError(
        "Please select valid booking dates."
      );
      return;
    }

    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setError(
        "Please select valid booking dates."
      );
      return;
    }

    if (end <= start) {
      setError(
        "End date must be after the start date."
      );
      return;
    }

    if (
      bookingType === "PACKAGE" &&
      !selectedPackage
    ) {
      setError(
        "Please select a rental package."
      );
      return;
    }

    if (
      bookingType === "MONTHLY" &&
      !selectedPlan
    ) {
      setError(
        "Please select a monthly plan."
      );
      return;
    }

    if (
      pickupOptions.length > 0 &&
      !pickupOptionId
    ) {
      setError(
        "Please select a pickup option."
      );
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        vehicleId,

        rentalPackageId:
          bookingType === "PACKAGE"
            ? selectedPackage
            : undefined,

        monthlyPlanId:
          bookingType === "MONTHLY"
            ? selectedPlan
            : undefined,

        locationId:
          effectiveLocationId,

        pickupOptionId:
          pickupOptionId || undefined,

        startDate,
        endDate,
      };

      console.log(
        "Booking Request:",
        requestBody
      );

      const response =
        await fetch(
          "/api/bookings",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              requestBody
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to create booking."
        );
      }

      if (!data?.booking?.id) {
        throw new Error(
          "Booking was created but no booking ID was returned."
        );
      }

      router.push(
        `/dashboard?booking=${data.booking.id}`
      );

      router.refresh();
    } catch (err) {
      console.error(
        "Booking Error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the booking."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     Render
  ========================================= */

  return (
    <form
      onSubmit={handleBooking}
      className="space-y-6"
    >

      {/* =====================================
          Choose Rental Type
      ===================================== */}

      <div>
        <h2 className="text-lg font-semibold">
          Choose Rental Type
        </h2>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">

          {/* Package */}

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              handleBookingTypeChange(
                "PACKAGE"
              )
            }
            className={`rounded-xl border p-4 text-left transition ${
              bookingType === "PACKAGE"
                ? "border-black bg-black text-white"
                : "bg-background hover:bg-muted"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <p className="font-semibold">
              Rental Package
            </p>

            <p
              className={`mt-1 text-sm ${
                bookingType === "PACKAGE"
                  ? "text-white/70"
                  : "text-muted-foreground"
              }`}
            >
              Fixed duration package
            </p>
          </button>

          {/* Normal */}

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              handleBookingTypeChange(
                "NORMAL"
              )
            }
            className={`rounded-xl border p-4 text-left transition ${
              bookingType === "NORMAL"
                ? "border-black bg-black text-white"
                : "bg-background hover:bg-muted"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <p className="font-semibold">
              Normal Days
            </p>

            <p
              className={`mt-1 text-sm ${
                bookingType === "NORMAL"
                  ? "text-white/70"
                  : "text-muted-foreground"
              }`}
            >
              Choose your own dates
            </p>
          </button>

          {/* Monthly */}

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              handleBookingTypeChange(
                "MONTHLY"
              )
            }
            className={`rounded-xl border p-4 text-left transition ${
              bookingType === "MONTHLY"
                ? "border-black bg-black text-white"
                : "bg-background hover:bg-muted"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <p className="font-semibold">
              Monthly Plan
            </p>

            <p
              className={`mt-1 text-sm ${
                bookingType === "MONTHLY"
                  ? "text-white/70"
                  : "text-muted-foreground"
              }`}
            >
              Long-term monthly rental
            </p>
          </button>

        </div>
      </div>

      {/* =====================================
          Rental Packages
      ===================================== */}

      {bookingType === "PACKAGE" && (
        <div>
          <label className="text-sm font-medium">
            Rental Package
          </label>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">

            {rentalPackages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No rental packages available.
              </p>
            ) : (
              rentalPackages.map((item) => {
                const isSelected =
                  selectedPackage ===
                  item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      handlePackageChange(
                        item.id
                      )
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-black bg-black text-white ring-1 ring-black"
                        : "bg-background hover:bg-muted"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">
                        <p className="font-semibold">
                          {item.name}
                        </p>

                        <p
                          className={`mt-1 text-sm ${
                            isSelected
                              ? "text-white/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item.duration}{" "}
                          day
                          {item.duration !==
                          1
                            ? "s"
                            : ""}
                        </p>
                      </div>

                      <p className="shrink-0 font-bold">
                        ₹
                        {Number(
                          item.price
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                    {item.description && (
                      <p
                        className={`mt-3 text-sm ${
                          isSelected
                            ? "text-white/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.description}
                      </p>
                    )}

                  </button>
                );
              })
            )}

          </div>
        </div>
      )}

      {/* =====================================
          Monthly Plans
      ===================================== */}

      {bookingType === "MONTHLY" && (
        <div>
          <label className="text-sm font-medium">
            Monthly Plan
          </label>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">

            {monthlyPlans.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No monthly plans available.
              </p>
            ) : (
              monthlyPlans.map((item) => {
                const isSelected =
                  selectedPlan ===
                  item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      handlePlanChange(
                        item.id
                      )
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-black bg-black text-white ring-1 ring-black"
                        : "bg-background hover:bg-muted"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">
                        <p className="font-semibold">
                          {item.name}
                        </p>

                        <p
                          className={`mt-1 text-sm ${
                            isSelected
                              ? "text-white/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item.months}{" "}
                          month
                          {item.months !==
                          1
                            ? "s"
                            : ""}
                        </p>
                      </div>

                      <p className="shrink-0 font-bold">
                        ₹
                        {Number(
                          item.price
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>
                  </button>
                );
              })
            )}

          </div>
        </div>
      )}

      {/* =====================================
          Rental Dates
      ===================================== */}

      <div>
        <h2 className="text-lg font-semibold">
          Rental Dates
        </h2>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Start Date */}

          <div>
            <label
              htmlFor="startDate"
              className="text-sm font-medium"
            >
              Start Date
            </label>

            <input
              id="startDate"
              type="datetime-local"
              value={startDate}
              min={new Date()
                .toISOString()
                .slice(0, 16)}
              onChange={
                handleStartDateChange
              }
              disabled={loading}
              required
              className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* End Date */}

          <div>
            <label
              htmlFor="endDate"
              className="text-sm font-medium"
            >
              End Date
            </label>

            <input
              id="endDate"
              type="datetime-local"
              value={endDate}
              min={
                startDate ||
                new Date()
                  .toISOString()
                  .slice(0, 16)
              }
              onChange={
                handleEndDateChange
              }
              readOnly={
                bookingType !== "NORMAL"
              }
              disabled={loading}
              required
              placeholder={
                bookingType === "NORMAL"
                  ? "Select end date"
                  : "Automatically calculated"
              }
              className={`mt-2 h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${
                bookingType === "NORMAL"
                  ? "bg-background"
                  : "bg-muted"
              }`}
            />

            <p className="mt-1 text-xs text-muted-foreground">
              {bookingType === "NORMAL"
                ? "Select your preferred start and end dates."
                : "End date is automatically calculated based on your selected package or plan."}
            </p>
          </div>

        </div>
      </div>

      {/* =====================================
          Pickup Location
      ===================================== */}

      <div>
        <label
          htmlFor="pickupLocation"
          className="text-sm font-medium"
        >
          Pickup Location
        </label>

        {locations.length === 0 ? (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            No pickup locations available.
          </div>
        ) : (
          <select
            id="pickupLocation"
            name="locationId"
            value={effectiveLocationId}
            onChange={
              handleLocationChange
            }
            disabled={loading}
            required
            className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="" disabled>
              Select location
            </option>

            {locations.map(
              (location) => (
                <option
                  key={location.id}
                  value={location.id}
                >
                  {location.name}
                  {location.address
                    ? ` — ${location.address}`
                    : ""}
                </option>
              )
            )}
          </select>
        )}
      </div>

      {/* =====================================
          Pickup Option
      ===================================== */}

      {pickupOptions.length > 0 && (
        <div>
          <label
            htmlFor="pickupOption"
            className="text-sm font-medium"
          >
            Pickup Option
          </label>

          <select
            id="pickupOption"
            name="pickupOptionId"
            value={pickupOptionId}
            onChange={
              handlePickupOptionChange
            }
            disabled={loading}
            required
            className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              Select pickup option
            </option>

            {pickupOptions.map(
              (option) => (
                <option
                  key={option.id}
                  value={option.id}
                >
                  {option.name}
                </option>
              )
            )}
          </select>
        </div>
      )}

      {/* =====================================
          Error
      ===================================== */}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* =====================================
          Booking Summary
      ===================================== */}

      <div className="rounded-xl border bg-muted/30 p-5">

        <h2 className="font-semibold">
          Booking Summary
        </h2>

        {/* Rental Amount */}

        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Rental Amount
          </span>

          <span className="font-semibold">
            {rentalAmount > 0
              ? `₹${rentalAmount.toLocaleString(
                  "en-IN"
                )}`
              : "—"}
          </span>
        </div>

        {/* Normal Days */}

        {bookingType === "NORMAL" &&
          normalRentalDays > 0 && (
            <div className="mt-1 flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">
                {normalRentalDays} rental day
                {normalRentalDays !== 1
                  ? "s"
                  : ""}{" "}
                × ₹
                {Number(
                  basePrice
                ).toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          )}

        {/* Delivery Charge */}

        <div className="mt-2 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Delivery Charge
          </span>

          <span>
            ₹
            {deliveryCharge.toLocaleString(
              "en-IN"
            )}
          </span>
        </div>

        {/* Tax */}

      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          Tax ({Number(taxRate)}%)
        </span>

        <span>
          ₹
          {taxAmount.toLocaleString(
            "en-IN",
            {
              maximumFractionDigits: 2,
            }
          )}
        </span>
      </div>

        {/* Discount */}

        <div className="mt-2 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Discount
          </span>

          <span>
            ₹
            {discountAmount.toLocaleString(
              "en-IN"
            )}
          </span>
        </div>

        {/* Total */}

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between gap-4">

            <span className="font-semibold">
              Total
            </span>

            <span className="text-xl font-bold">
              {rentalAmount > 0
                ? `₹${totalAmount.toLocaleString(
                    "en-IN"
                  )}`
                : "—"}
            </span>

          </div>
        </div>

      </div>

      {/* =====================================
          Confirm Booking
      ===================================== */}

      <button
        type="submit"
        disabled={
          loading ||
          locations.length === 0
        }
        className="h-12 w-full rounded-xl bg-black px-6 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Creating Booking..."
          : "Confirm Booking"}
      </button>

    </form>
  );
}