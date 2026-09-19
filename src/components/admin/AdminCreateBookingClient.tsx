"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Car,
  MapPin,
  Calendar,
  CreditCard,
  Tag,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Search,
  UserPlus,
  Loader2,
  PhoneCall,
  MessageSquare,
  Building2,
  ShieldAlert,
} from "lucide-react";

type VehicleItem = {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  registrationNumber: string | null;
  basePrice: number;
  primaryImage: string | null;
};

type LocationItem = {
  id: string;
  name: string;
  address: string | null;
};

type PickupOptionItem = {
  id: string;
  name: string;
  description: string | null;
};

type GlobalPackageItem = {
  id: string;
  name: string;
  duration: number;
  price: number;
  vehicles: { id: string }[];
};

type RentalPackageItem = {
  id: string;
  vehicleId: string;
  name: string;
  duration: number;
  price: number;
};

type MonthlyPlanItem = {
  id: string;
  vehicleId: string;
  name: string;
  months: number;
  price: number;
};

type DeliveryChargeItem = {
  locationId: string;
  charge: number;
};

type AdminCreateBookingClientProps = {
  vehicles: VehicleItem[];
  locations: LocationItem[];
  pickupOptions: PickupOptionItem[];
  packages: GlobalPackageItem[];
  rentalPackages: RentalPackageItem[];
  monthlyPlans: MonthlyPlanItem[];
  deliveryCharges: DeliveryChargeItem[];
  taxRate: number;
};

type CustomerSearchResult = {
  id: string;
  name: string | null;
  email: string;
  mobile: string | null;
};

export default function AdminCreateBookingClient({
  vehicles,
  locations,
  pickupOptions,
  packages,
  rentalPackages,
  monthlyPlans,
  deliveryCharges,
  taxRate,
}: AdminCreateBookingClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Mode: "SEARCH" (existing customer) vs "NEW" (create new customer)
  const [customerMode, setCustomerMode] = useState<"SEARCH" | "NEW">("SEARCH");

  // Customer state
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);

  // New customer form state
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerMobile, setNewCustomerMobile] = useState("");

  // Booking details form state
  const [vehicleId, setVehicleId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupOptionId, setPickupOptionId] = useState("");
  const [selectedPlanType, setSelectedPlanType] = useState<"NONE" | "RENTAL" | "MONTHLY" | "GLOBAL">("NONE");
  const [selectedPlanId, setSelectedPlanId] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Channel & Payment settings
  const [bookingSource, setBookingSource] = useState<"ADMIN" | "PHONE" | "WHATSAPP" | "WALK_IN" | "ONLINE">("ADMIN");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "ONLINE">("CASH");
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "SUCCESS">("SUCCESS");
  const [bookingStatus, setBookingStatus] = useState<"CONFIRMED" | "PENDING">("CONFIRMED");
  const [paymentReference, setPaymentReference] = useState("");

  // Feedback & Validation states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected vehicle object
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  // Filtered packages for selected vehicle
  const availableRentalPackages = rentalPackages.filter((rp) => rp.vehicleId === vehicleId);
  const availableMonthlyPlans = monthlyPlans.filter((mp) => mp.vehicleId === vehicleId);
  const availableGlobalPackages = packages.filter((gp) =>
    gp.vehicles.some((v) => v.id === vehicleId)
  );

  // Calculate rental duration in days
  const calculateDays = (): number => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return 0;
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  };

  const rentalDays = calculateDays();

  // Price Calculations
  const calculateRentalAmount = (): number => {
    if (!selectedVehicle || rentalDays <= 0) return 0;

    if (selectedPlanType === "GLOBAL" && selectedPlanId) {
      const gp = packages.find((p) => p.id === selectedPlanId);
      return gp ? Number(gp.price) : Number(selectedVehicle.basePrice) * rentalDays;
    }

    if (selectedPlanType === "RENTAL" && selectedPlanId) {
      const rp = rentalPackages.find((p) => p.id === selectedPlanId);
      return rp ? Number(rp.price) : Number(selectedVehicle.basePrice) * rentalDays;
    }

    if (selectedPlanType === "MONTHLY" && selectedPlanId) {
      const mp = monthlyPlans.find((p) => p.id === selectedPlanId);
      return mp ? Number(mp.price) : Number(selectedVehicle.basePrice) * rentalDays;
    }

    return Number(selectedVehicle.basePrice) * rentalDays;
  };

  const rentalAmount = calculateRentalAmount();

  // Delivery charge
  const deliveryChargeObj = deliveryCharges.find((dc) => dc.locationId === locationId);
  const deliveryCharge = deliveryChargeObj ? Number(deliveryChargeObj.charge) : 0;

  // Tax calculation
  const taxAmount = (rentalAmount * taxRate) / 100;

  // Discount calculation
  const discountAmount = couponDiscount || 0;

  // Total amount
  const totalAmount = Math.max(0, rentalAmount + deliveryCharge + taxAmount - discountAmount);

  // Search customer handler
  const handleCustomerSearch = async (query: string) => {
    setCustomerSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data.customers) {
        setSearchResults(data.customers);
      }
    } catch (err) {
      console.error("Customer Search Error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Validate coupon handler
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponDiscount(null);

    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          rentalAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setCouponError(data.error || "Invalid coupon code.");
      } else {
        setCouponDiscount(Number(data.discountAmount));
      }
    } catch (err) {
      setCouponError("Failed to apply coupon.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (customerMode === "SEARCH" && !selectedCustomer) {
      setErrorMessage("Please select a customer or switch to create a new customer account.");
      return;
    }

    if (customerMode === "NEW") {
      if (!newCustomerName.trim() || !newCustomerEmail.trim()) {
        setErrorMessage("Please fill in customer name and email.");
        return;
      }
    }

    if (!vehicleId) {
      setErrorMessage("Please select a vehicle.");
      return;
    }

    if (!locationId) {
      setErrorMessage("Please select a pickup location.");
      return;
    }

    if (!startDate || !endDate || rentalDays <= 0) {
      setErrorMessage("Please select valid start and end dates (end date must be after start date).");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: Record<string, any> = {
        vehicleId,
        locationId,
        startDate,
        endDate,
        pickupOptionId: pickupOptionId || undefined,
        bookingSource,
        paymentMethod,
        paymentStatus,
        bookingStatus,
        paymentReference: paymentReference.trim() || undefined,
        couponCode: couponDiscount ? couponCode.trim() : undefined,
      };

      if (customerMode === "SEARCH" && selectedCustomer) {
        payload.userId = selectedCustomer.id;
      } else {
        payload.newCustomer = {
          name: newCustomerName.trim(),
          email: newCustomerEmail.trim(),
          mobile: newCustomerMobile.trim() || undefined,
        };
      }

      if (selectedPlanType === "GLOBAL" && selectedPlanId) {
        payload.packageId = selectedPlanId;
      } else if (selectedPlanType === "RENTAL" && selectedPlanId) {
        payload.rentalPackageId = selectedPlanId;
      } else if (selectedPlanType === "MONTHLY" && selectedPlanId) {
        payload.monthlyPlanId = selectedPlanId;
      }

      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to create booking.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("Booking created successfully! Redirecting to bookings list...");
      setTimeout(() => {
        router.push("/admin/bookings");
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error("Submit Error:", err);
      setErrorMessage("An unexpected error occurred while creating the booking.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bookings
            </Link>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
              Assisted Booking
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Create Assisted / Offline Booking
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create an online, phone, WhatsApp, or walk-in booking on behalf of a customer.
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold">{successMessage}</div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column (8 cols) - Customer, Vehicle, Dates, Channel */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. CUSTOMER SECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <h2 className="font-extrabold text-slate-900 text-base">Customer Details</h2>
                </div>
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode("SEARCH");
                      setErrorMessage(null);
                    }}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      customerMode === "SEARCH"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode("NEW");
                      setSelectedCustomer(null);
                      setErrorMessage(null);
                    }}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      customerMode === "NEW"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    + Create New
                  </button>
                </div>
              </div>

              {customerMode === "SEARCH" ? (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Search Customer (by Name, Email, or Mobile)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Type customer name, email or phone number..."
                      value={customerSearchQuery}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                    {isSearching && (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute right-3.5 top-3" />
                    )}
                  </div>

                  {/* Selected Customer Pill */}
                  {selectedCustomer && (
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {(selectedCustomer.name?.charAt(0) || "C").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {selectedCustomer.name || "Customer User"}
                          </p>
                          <p className="text-xs text-slate-500">{selectedCustomer.email}</p>
                          {selectedCustomer.mobile && (
                            <p className="text-xs font-mono text-slate-500">{selectedCustomer.mobile}</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(null)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 px-2 py-1 bg-white rounded-lg border border-rose-200"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {/* Search Dropdown Results */}
                  {!selectedCustomer && searchResults.length > 0 && (
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto bg-white shadow-lg">
                      {searchResults.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setSearchResults([]);
                          }}
                          className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{cust.name || "Customer User"}</p>
                            <p className="text-xs text-slate-500">{cust.email}</p>
                          </div>
                          <span className="text-xs font-mono font-semibold text-slate-600">
                            {cust.mobile || "No Mobile"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Customer Name"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="customer@example.com"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={newCustomerMobile}
                      onChange={(e) => setNewCustomerMobile(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. BOOKING SOURCE CHANNEL */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="font-extrabold text-slate-900 text-base">Booking Channel / Source</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { key: "ADMIN", label: "Admin Direct", icon: Building2 },
                  { key: "PHONE", label: "Phone Call", icon: PhoneCall },
                  { key: "WHATSAPP", label: "WhatsApp", icon: MessageSquare },
                  { key: "WALK_IN", label: "Walk-in / Office", icon: User },
                  { key: "ONLINE", label: "Online Site", icon: Car },
                ].map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = bookingSource === channel.key;
                  return (
                    <button
                      key={channel.key}
                      type="button"
                      onClick={() => setBookingSource(channel.key as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-md font-bold"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 font-medium text-xs"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                      <span className="text-xs">{channel.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. VEHICLE & RENTAL SELECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Car className="w-5 h-5 text-blue-600" />
                <h2 className="font-extrabold text-slate-900 text-base">Vehicle & Location Selection</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Select Vehicle *
                  </label>
                  <select
                    required
                    value={vehicleId}
                    onChange={(e) => {
                      setVehicleId(e.target.value);
                      setSelectedPlanType("NONE");
                      setSelectedPlanId("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    <option value="">-- Choose Available Vehicle --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} {v.variant ? `(${v.variant})` : ""} - ₹{v.basePrice}/day
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pickup Location *
                  </label>
                  <select
                    required
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    <option value="">-- Choose Location Hub --</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.address ? `(${loc.address})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DATES */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {rentalDays > 0 && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs font-bold text-blue-900 flex items-center justify-between">
                  <span>Selected Rental Duration:</span>
                  <span className="text-sm font-extrabold">{rentalDays} Day(s)</span>
                </div>
              )}

              {/* PICKUP OPTION & PACKAGES */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pickup Option (Optional)
                  </label>
                  <select
                    value={pickupOptionId}
                    onChange={(e) => setPickupOptionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    <option value="">Standard Self-Pickup</option>
                    {pickupOptions.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Apply Package / Plan (Optional)
                  </label>
                  <select
                    value={`${selectedPlanType}:${selectedPlanId}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val || val === "NONE:") {
                        setSelectedPlanType("NONE");
                        setSelectedPlanId("");
                      } else {
                        const [type, id] = val.split(":");
                        setSelectedPlanType(type as any);
                        setSelectedPlanId(id);
                      }
                    }}
                    disabled={!vehicleId}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white disabled:bg-slate-100"
                  >
                    <option value="NONE:">Standard Daily Rate (No Package)</option>

                    {availableGlobalPackages.length > 0 && (
                      <optgroup label="Global Packages">
                        {availableGlobalPackages.map((gp) => (
                          <option key={gp.id} value={`GLOBAL:${gp.id}`}>
                            {gp.name} ({gp.duration} days) - ₹{gp.price}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {availableRentalPackages.length > 0 && (
                      <optgroup label="Rental Packages">
                        {availableRentalPackages.map((rp) => (
                          <option key={rp.id} value={`RENTAL:${rp.id}`}>
                            {rp.name} ({rp.duration} days) - ₹{rp.price}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {availableMonthlyPlans.length > 0 && (
                      <optgroup label="Monthly Plans">
                        {availableMonthlyPlans.map((mp) => (
                          <option key={mp.id} value={`MONTHLY:${mp.id}`}>
                            {mp.name} ({mp.months} months) - ₹{mp.price}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* 4. PAYMENT & CONFIRMATION SETTINGS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="font-extrabold text-slate-900 text-base">Payment & Booking Status</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
                  >
                    <option value="CASH">💵 Cash (Offline)</option>
                    <option value="UPI">📱 UPI Direct / Scanner</option>
                    <option value="CARD">💳 POS Card Swiped</option>
                    <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                    <option value="ONLINE">🌐 Online / Razorpay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
                  >
                    <option value="SUCCESS">✅ PAID (Success)</option>
                    <option value="PENDING">⏳ UNPAID (Pending)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Booking Status
                  </label>
                  <select
                    value={bookingStatus}
                    onChange={(e) => setBookingStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
                  >
                    <option value="CONFIRMED">🟢 CONFIRMED</option>
                    <option value="PENDING">🟡 PENDING REVIEW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Offline Payment Reference / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Receipt #, UTR Number, or Staff Note"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) - Live Pricing Calculation Card & Submit */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-6 border border-slate-800 sticky top-6">
              <h3 className="font-extrabold text-lg text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Price Calculation</span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-blue-600/30 text-blue-400 font-mono font-bold border border-blue-500/30">
                  INR (₹)
                </span>
              </h3>

              {/* Vehicle Preview */}
              {selectedVehicle ? (
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-3">
                  <Car className="w-8 h-8 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-white">{selectedVehicle.brand} {selectedVehicle.model}</p>
                    <p className="text-xs text-slate-400">Base: ₹{Number(selectedVehicle.basePrice).toLocaleString("en-IN")}/day</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-center text-xs text-slate-400">
                  Select a vehicle to view price breakdown
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm text-slate-300 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Rental Amount ({rentalDays} days)</span>
                  <span className="font-bold text-white">₹{rentalAmount.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Delivery Charge</span>
                  <span className="font-bold text-white">₹{deliveryCharge.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">GST / Tax ({taxRate}%)</span>
                  <span className="font-bold text-white">₹{taxAmount.toLocaleString("en-IN")}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-400 font-bold">
                    <span>Discount Coupon</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                  <span className="font-extrabold text-base text-white">Total Amount</span>
                  <span className="text-2xl font-black text-blue-400">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Coupon Application Box */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Apply Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="COUPON20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors disabled:opacity-50"
                  >
                    {isValidatingCoupon ? "Validating..." : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-xs text-rose-400 font-medium">{couponError}</p>}
                {couponDiscount !== null && (
                  <p className="text-xs text-emerald-400 font-bold">Coupon applied! ₹{couponDiscount} discount.</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Create Assisted Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
