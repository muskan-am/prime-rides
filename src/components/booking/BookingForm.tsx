"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

type GlobalPackage = {
  id: string;
  name: string;
  type: string;
  duration: number;
  price: string | number;
  description?: string | null;
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
  isBookable?: boolean;
  unbookableReason?: string;
  initialSearchParams?: {
    location?: string;
    startDate?: string;
    endDate?: string;
    rentalPackageId?: string;
    monthlyPlanId?: string;
    packageId?: string;
    type?: string;
  };
  basePrice: string | number;
  taxRate: string | number;
  rentalPackages: RentalPackage[];
  monthlyPlans: MonthlyPlan[];
  globalPackages?: GlobalPackage[];
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
  isBookable = true,
  unbookableReason,
  initialSearchParams,
  basePrice,
  taxRate,
  rentalPackages,
  monthlyPlans,
  globalPackages = [],
  locations,
  pickupOptions,
}: BookingFormProps) {
  const router = useRouter();

  /* =========================================
     Initial Search Params Processing
  ========================================= */

  const formatDatetimeLocal = (input?: string) => {
    if (!input) return "";
    if (input.includes("T")) {
      return input.slice(0, 16);
    }
    return `${input}T10:00`;
  };

  const paramPackageId = initialSearchParams?.rentalPackageId;
  const paramGlobalPackageId = initialSearchParams?.packageId;
  const paramPlanId = initialSearchParams?.monthlyPlanId;
  const paramType = initialSearchParams?.type?.toUpperCase();

  const validRentalPackage = rentalPackages.find((p) => p.id === paramPackageId);
  const validGlobalPackage = globalPackages.find((p) => p.id === paramGlobalPackageId || p.id === paramPackageId);
  const validPlan = monthlyPlans.find((p) => p.id === paramPlanId);

  let initialBookingType: "PACKAGE" | "NORMAL" | "MONTHLY" = "PACKAGE";
  if (validGlobalPackage || validRentalPackage || paramType === "PACKAGE") {
    initialBookingType = "PACKAGE";
  } else if (validPlan || paramType === "MONTHLY") {
    initialBookingType = "MONTHLY";
  } else if (
    paramType === "NORMAL" ||
    paramType === "DAILY" ||
    (initialSearchParams?.startDate && !paramPackageId && !paramGlobalPackageId && !paramPlanId)
  ) {
    initialBookingType = "NORMAL";
  } else if (rentalPackages.length > 0 || globalPackages.length > 0) {
    initialBookingType = "PACKAGE";
  } else if (monthlyPlans.length > 0) {
    initialBookingType = "MONTHLY";
  } else {
    initialBookingType = "NORMAL";
  }

  const initialPackage = validGlobalPackage
    ? validGlobalPackage.id
    : validRentalPackage
    ? validRentalPackage.id
    : globalPackages[0]?.id ?? rentalPackages[0]?.id ?? "";

  const initialPlan = validPlan
    ? validPlan.id
    : monthlyPlans[0]?.id ?? "";

  const paramLocation = initialSearchParams?.location;
  const matchedLocation = locations.find(
    (l) =>
      l.id === paramLocation ||
      l.name.toLowerCase() === paramLocation?.toLowerCase()
  );
  const initialLocationId = matchedLocation?.id ?? locations[0]?.id ?? "";

  const initialStartDate = formatDatetimeLocal(initialSearchParams?.startDate);
  let initialEndDate = formatDatetimeLocal(initialSearchParams?.endDate);

  if (initialBookingType === "PACKAGE" && initialStartDate && initialPackage) {
    const pkg = globalPackages.find((p) => p.id === initialPackage) || rentalPackages.find((p) => p.id === initialPackage);
    if (pkg) {
      initialEndDate = calculateEndDate(initialStartDate, pkg.duration, false);
    }
  } else if (
    initialBookingType === "MONTHLY" &&
    initialStartDate &&
    initialPlan
  ) {
    const pln = monthlyPlans.find((p) => p.id === initialPlan);
    if (pln) {
      initialEndDate = calculateEndDate(initialStartDate, pln.months, true);
    }
  }

  /* =========================================
     Booking Type
  ========================================= */

  const [bookingType, setBookingType] =
    useState<"PACKAGE" | "NORMAL" | "MONTHLY">(initialBookingType);

  /* =========================================
     Selected Package / Plan
  ========================================= */

  const [selectedPackage, setSelectedPackage] =
    useState<string>(initialPackage);

  const [selectedPlan, setSelectedPlan] =
    useState<string>(initialPlan);

  /* =========================================
     Pickup Location
  ========================================= */

  const [locationId, setLocationId] =
    useState<string>(initialLocationId);

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
    useState<string>(pickupOptions[0]?.id ?? "");

  useEffect(() => {
    if (pickupOptions.length > 0 && !pickupOptionId) {
      setPickupOptionId(pickupOptions[0].id);
    }
  }, [pickupOptions, pickupOptionId]);

  /* =========================================
     Dates
  ========================================= */

  const [startDate, setStartDate] =
    useState<string>(initialStartDate);

  const [endDate, setEndDate] =
    useState<string>(initialEndDate);

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
    ) ||
    globalPackages.find(
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
     Coupon State & Handlers
  ========================================= */

  const [couponCodeInput, setCouponCodeInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string>("");
  const [couponSuccess, setCouponSuccess] = useState<string>("");

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");

    const codeToApply = couponCodeInput.trim().toUpperCase();
    if (!codeToApply) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (rentalAmount <= 0) {
      setCouponError("Please select rental dates or package first.");
      return;
    }

    setCouponLoading(true);

    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToApply,
          bookingValue: rentalAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to apply coupon.");
      }

      setAppliedCoupon({
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: data.discountAmount,
      });
      setCouponSuccess(data.message || `Coupon "${data.code}" applied successfully!`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Failed to apply coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponError("");
    setCouponSuccess("");
  };

  /* =========================================
     Discount
  ========================================= */

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;

  /* =========================================
     Tax
  ========================================= */

  const taxAmount =
    rentalAmount *
    (Number(taxRate) / 100);

  /* =========================================
     Total Amount
  ========================================= */

  const totalAmount = Math.max(
    0,
    rentalAmount +
      deliveryCharge +
      taxAmount -
      discountAmount
  );

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

    if (!isBookable) {
      setError(
        unbookableReason ||
          "This vehicle is currently marked as unavailable for booking."
      );
      return;
    }

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
      const isGlobalPkg = globalPackages.some((g) => g.id === selectedPackage);
      const isRentalPkg = rentalPackages.some((r) => r.id === selectedPackage);

      const requestBody = {
        vehicleId,

        packageId:
          bookingType === "PACKAGE" && (isGlobalPkg || (!isRentalPkg && Boolean(selectedPackage)))
            ? selectedPackage
            : undefined,

        rentalPackageId:
          bookingType === "PACKAGE" && isRentalPkg
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
        couponCode: appliedCoupon?.code || undefined,
      };

      /* 1. Create Booking (PENDING) */
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create booking.");
      }

      if (!data?.booking?.id) {
        throw new Error("Booking was created but no booking ID was returned.");
      }

      const bookingId = data.booking.id;

      /* 2. Create Razorpay Order */
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData?.error || "Failed to create payment order.");
      }

      /* 3. Load Razorpay SDK Script */
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      /* 4. Open Razorpay Standard Checkout */
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Prime Rides",
        description: "Self-Drive Vehicle Rental Booking",
        order_id: orderData.orderId,
        handler: async function (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            setLoading(true);

            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                bookingId,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                couponCode: appliedCoupon?.code || undefined,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData?.error || "Payment verification failed.");
            }

            router.push(`/dashboard?booking=${bookingId}&payment=success`);
            router.refresh();
          } catch (verifyErr) {
            console.error("Verification Error:", verifyErr);
            setError(
              verifyErr instanceof Error
                ? verifyErr.message
                : "Something went wrong while verifying payment."
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError("Payment checkout was closed. Your booking remains pending in your dashboard.");
          },
        },
        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
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
        <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
          1. Choose Rental Type
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
            className={`rounded-2xl border p-4 text-left transition-all ${
              bookingType === "PACKAGE"
                ? "border-blue-600 bg-blue-50/90 text-blue-900 ring-2 ring-blue-600/30 shadow-sm"
                : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm">
                Rental Package
              </p>
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${bookingType === "PACKAGE" ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`}>
                {bookingType === "PACKAGE" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
            </div>

            <p
              className={`mt-1 text-xs ${
                bookingType === "PACKAGE"
                  ? "text-blue-700/80 font-medium"
                  : "text-slate-500"
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
            className={`rounded-2xl border p-4 text-left transition-all ${
              bookingType === "NORMAL"
                ? "border-blue-600 bg-blue-50/90 text-blue-900 ring-2 ring-blue-600/30 shadow-sm"
                : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm">
                Normal Days
              </p>
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${bookingType === "NORMAL" ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`}>
                {bookingType === "NORMAL" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
            </div>

            <p
              className={`mt-1 text-xs ${
                bookingType === "NORMAL"
                  ? "text-blue-700/80 font-medium"
                  : "text-slate-500"
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
            className={`rounded-2xl border p-4 text-left transition-all ${
              bookingType === "MONTHLY"
                ? "border-blue-600 bg-blue-50/90 text-blue-900 ring-2 ring-blue-600/30 shadow-sm"
                : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm">
                Monthly Plan
              </p>
              <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${bookingType === "MONTHLY" ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`}>
                {bookingType === "MONTHLY" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
            </div>

            <p
              className={`mt-1 text-xs ${
                bookingType === "MONTHLY"
                  ? "text-blue-700/80 font-medium"
                  : "text-slate-500"
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
        <div className="pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Select Rental Package Option
          </label>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

            {rentalPackages.length === 0 ? (
              <p className="text-sm text-slate-500">
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
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/90 ring-2 ring-blue-600/30 text-slate-900 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900">
                          {item.name}
                        </p>

                        <p
                          className={`mt-0.5 text-xs font-medium ${
                            isSelected
                              ? "text-blue-700"
                              : "text-slate-500"
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

                      <p className="shrink-0 font-extrabold text-blue-600 text-sm">
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
                        className={`mt-2 text-xs leading-relaxed ${
                          isSelected
                            ? "text-slate-700 font-medium"
                            : "text-slate-500"
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
        <div className="pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Select Monthly Plan Option
          </label>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

            {monthlyPlans.length === 0 ? (
              <p className="text-sm text-slate-500">
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
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/90 ring-2 ring-blue-600/30 text-slate-900 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900">
                          {item.name}
                        </p>

                        <p
                          className={`mt-0.5 text-xs font-medium ${
                            isSelected
                              ? "text-blue-700"
                              : "text-slate-500"
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

                      <p className="shrink-0 font-extrabold text-blue-600 text-sm">
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

      <div className="pt-2">
        <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
          2. Select Schedule
        </h2>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Start Date */}

          <div>
            <label
              htmlFor="startDate"
              className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Start Date & Time
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
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-sm transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* End Date */}

          <div>
            <label
              htmlFor="endDate"
              className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              End Date & Time
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
              className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-sm font-medium text-slate-800 shadow-sm transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                bookingType === "NORMAL"
                  ? "border-slate-300 bg-white"
                  : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
            />

            <p className="mt-1 text-xs text-slate-500 font-medium">
              {bookingType === "NORMAL"
                ? "Select your preferred start and end dates."
                : "End date is automatically calculated based on your package choice."}
            </p>
          </div>

        </div>
      </div>

      {/* =====================================
          Pickup Location
      ===================================== */}

      <div className="pt-2">
        <label
          htmlFor="pickupLocation"
          className="text-xs font-bold uppercase tracking-wider text-slate-900 block"
        >
          3. Pickup Location
        </label>

        {locations.length === 0 ? (
          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
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
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-sm transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="pt-2">
          <label
            htmlFor="pickupOption"
            className="text-xs font-bold uppercase tracking-wider text-slate-900 block"
          >
            4. Pickup Option
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
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-800 shadow-sm transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
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
          Apply Coupon Code
      ===================================== */}

      <div className="pt-2">
        <label
          htmlFor="couponCode"
          className="text-xs font-bold uppercase tracking-wider text-slate-900 block"
        >
          5. Apply Discount Coupon
        </label>

        {appliedCoupon ? (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded text-xs tracking-wider">
                {appliedCoupon.code}
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                ({appliedCoupon.discountType === "PERCENTAGE" ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`} — Saving ₹{appliedCoupon.discountAmount.toLocaleString("en-IN")})
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              disabled={loading}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <input
                id="couponCode"
                type="text"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter promo code (e.g. PRIME10)"
                disabled={loading || couponLoading}
                className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-bold uppercase tracking-wider text-slate-800 shadow-sm transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 placeholder:normal-case placeholder:font-normal"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={loading || couponLoading || !couponCodeInput.trim()}
                className="h-11 px-5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                {couponLoading ? "Applying..." : "Apply Code"}
              </button>
            </div>

            {couponError && (
              <p className="text-xs font-semibold text-rose-600">
                {couponError}
              </p>
            )}
            {couponSuccess && (
              <p className="text-xs font-semibold text-emerald-600">
                {couponSuccess}
              </p>
            )}
          </div>
        )}
      </div>

      {/* =====================================
          Error State
      ===================================== */}

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium flex items-center gap-2"
        >
          <span className="font-bold text-red-800">Error:</span> {error}
        </div>
      )}

      {/* =====================================
          Booking Summary
      ===================================== */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7 text-white shadow-xl bg-navy-gradient">

        <h2 className="text-base font-extrabold tracking-wide uppercase text-blue-400">
          Booking Cost Summary
        </h2>

        <div className="mt-4 space-y-3 divide-y divide-slate-800/80">
          {/* Rental Amount */}

          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-sm text-slate-300 font-medium">
              Rental Base Amount
            </span>

            <span className="font-bold text-white text-base">
              {rentalAmount > 0
                ? `₹${rentalAmount.toLocaleString(
                    "en-IN"
                  )}`
                : "—"}
            </span>
          </div>

          {/* Normal Days Breakdown */}

          {bookingType === "NORMAL" &&
            normalRentalDays > 0 && (
              <div className="flex items-center justify-between gap-4 pt-2">
                <span className="text-xs text-slate-400 font-medium">
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

          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-sm text-slate-300 font-medium">
              Delivery Charge
            </span>

            <span className="font-semibold text-slate-200">
              ₹
              {deliveryCharge.toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          {/* Tax */}

          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-sm text-slate-300 font-medium">
              Applicable Tax ({Number(taxRate)}%)
            </span>

            <span className="font-semibold text-slate-200">
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

          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-sm text-slate-300 font-medium">
              Discount Applied
            </span>

            <span className="font-semibold text-emerald-400">
              ₹
              {discountAmount.toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          {/* Total Payable */}

          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between gap-4">

              <span className="font-bold text-white text-lg">
                Total Amount Payable
              </span>

              <span className="text-2xl font-black text-blue-400">
                {rentalAmount > 0
                  ? `₹${totalAmount.toLocaleString(
                      "en-IN"
                    )}`
                  : "—"}
              </span>

            </div>
          </div>
        </div>

      </div>

      {/* =====================================
          Confirm Booking Button
      ===================================== */}

      <button
        type="submit"
        disabled={
          loading ||
          locations.length === 0 ||
          !isBookable
        }
        className="h-13 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 font-extrabold text-white text-base shadow-lg shadow-blue-600/25 transition-all hover:brightness-110 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
      >
        {loading
          ? "Processing Order..."
          : !isBookable
          ? "Vehicle Currently Unavailable"
          : "Proceed to Payment"}
      </button>

    </form>
  );
}