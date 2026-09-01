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
};

type PickupOption = {
  id: string;
  name: string;
  description: string | null;
};

type BookingFormProps = {
  vehicleId: string;
  rentalPackages: RentalPackage[];
  monthlyPlans: MonthlyPlan[];
  locations: Location[];
  pickupOptions: PickupOption[];
};

export default function BookingForm({
  vehicleId,
  rentalPackages,
  monthlyPlans,
  locations,
  pickupOptions,
}: BookingFormProps) {
  const router = useRouter();

  /* =========================================
     Booking Type
  ========================================= */

  const [bookingType, setBookingType] = useState<
    "PACKAGE" | "MONTHLY"
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

  /*
   * Start with the first available location.
   */
  const [locationId, setLocationId] = useState<string>(
    locations[0]?.id ?? ""
  );

  /*
   * Keep location valid if locations are loaded/updated
   * after the component has mounted.
   *
   * IMPORTANT:
   * This does NOT depend on pickupOptionId,
   * so changing Pickup Option will NOT reset location.
   */
  useEffect(() => {
    // console.log("BookingForm Mounted/Updated - Locations received:", locations);
    // console.log("Current locationId state:", locationId);

    if (locations.length === 0) {
      setLocationId("");
      return;
    }

    setLocationId((currentLocationId) => {
      const currentLocationStillExists =
        locations.some(
          (location) =>
            location.id && location.id === currentLocationId
        );

      if (currentLocationStillExists) {
        return currentLocationId;
      }

      return locations[0]?.id ?? "";
    });
  }, [locations]);

  /*
   * Fallback location.
   *
   * This guarantees that if state temporarily becomes empty
   * while locations are available, the first location is still
   * used.
   */
  const effectiveLocationId =
    locations.some(
      (location) => location.id && location.id === locationId
    )
      ? locationId
      : locations[0]?.id ?? "";

  console.log("BookingForm Render - Effective locationId:", effectiveLocationId);

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
      : selectedPlanData?.price;

  /* =========================================
     Booking Type Change
  ========================================= */

  const handleBookingTypeChange = (
    type: "PACKAGE" | "MONTHLY"
  ) => {
    if (loading) return;

    setBookingType(type);
    setError("");

    if (type === "PACKAGE") {
      setSelectedPlan("");
    } else {
      setSelectedPackage("");
    }
  };

  /* =========================================
     Package Change
  ========================================= */

  const handlePackageChange = (
    packageId: string
  ) => {
    if (loading) return;

    setSelectedPackage(packageId);
    setError("");
  };

  /* =========================================
     Monthly Plan Change
  ========================================= */

  const handlePlanChange = (
    planId: string
  ) => {
    if (loading) return;

    setSelectedPlan(planId);
    setError("");
  };

  /* =========================================
     Pickup Location Change
  ========================================= */

  const handleLocationChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    if (loading) return;

    const value = event.target.value;

    // console.log(
    //   "Pickup Location Selected:",
    //   value
    // );

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

    const value = event.target.value;

    // console.log(
    //   "Pickup Option Selected:",
    //   value
    // );

    /*
     * IMPORTANT:
     * We only change pickupOptionId here.
     *
     * locationId is NOT touched.
     */
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

    const value = event.target.value;

    setStartDate(value);
    setError("");

    /*
     * If selected end date is before the new start date,
     * clear it so the user can select a valid date.
     */
    if (
      endDate &&
      new Date(endDate).getTime() <=
        new Date(value).getTime()
    ) {
      setEndDate("");
    }
  };

  /* =========================================
     End Date Change
  ========================================= */

  const handleEndDateChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (loading) return;

    setEndDate(event.target.value);
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

    /* -----------------------------------------
       Validate Location
    ----------------------------------------- */

    if (!effectiveLocationId) {
      setError(
        "Please select a pickup location."
      );
      return;
    }

    /* -----------------------------------------
       Validate Dates
    ----------------------------------------- */

    if (!startDate || !endDate) {
      setError(
        "Please select start and end dates."
      );
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

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

    /* -----------------------------------------
       Validate Rental Package
    ----------------------------------------- */

    if (
      bookingType === "PACKAGE" &&
      !selectedPackage
    ) {
      setError(
        "Please select a rental package."
      );
      return;
    }

    /* -----------------------------------------
       Validate Monthly Plan
    ----------------------------------------- */

    if (
      bookingType === "MONTHLY" &&
      !selectedPlan
    ) {
      setError(
        "Please select a monthly plan."
      );
      return;
    }

    /* -----------------------------------------
       Validate Pickup Option
    ----------------------------------------- */

    if (
      pickupOptions.length > 0 &&
      !pickupOptionId
    ) {
      setError(
        "Please select a pickup option."
      );
      return;
    }

    /* -----------------------------------------
       Start Loading
    ----------------------------------------- */

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

        /*
         * IMPORTANT:
         * Always send the effective location.
         */
        locationId: effectiveLocationId,

        pickupOptionId:
          pickupOptionId || undefined,

        startDate,
        endDate,
      };

      console.log(
        "Booking Request:",
        requestBody
      );

      const response = await fetch(
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

      /*
       * Go to customer dashboard after
       * successful booking.
       */
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

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Rental Package */}

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
              Daily rental package
            </p>
          </button>

          {/* Monthly Plan */}

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
              disabled={loading}
              required
              className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            />
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

            {locations.map((location) => (
              <option
                key={location.id}
                value={location.id}
              >
                {location.name}
                {location.address
                  ? ` — ${location.address}`
                  : ""}
              </option>
            ))}
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

        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Rental Amount
          </span>

          <span className="font-semibold">
            {selectedPrice !==
            undefined
              ? `₹${Number(
                  selectedPrice
                ).toLocaleString(
                  "en-IN"
                )}`
              : "—"}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Delivery Charge
          </span>

          <span>₹0</span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Discount
          </span>

          <span>₹0</span>
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold">
              Total
            </span>

            <span className="text-xl font-bold">
              {selectedPrice !==
              undefined
                ? `₹${Number(
                    selectedPrice
                  ).toLocaleString(
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