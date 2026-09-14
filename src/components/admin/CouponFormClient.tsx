"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DiscountType } from "@prisma/client";

export type CouponFormData = {
  id?: string;
  code: string;
  title?: string | null;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number | string;
  minBookingValue?: number | string | null;
  maxDiscount?: number | string | null;
  validFrom: string;
  validUntil: string;
  usageLimit?: number | string | null;
  isActive: boolean;
};

type CouponFormClientProps = {
  initialData?: CouponFormData;
  isEdit?: boolean;
};

export default function CouponFormClient({
  initialData,
  isEdit = false,
}: CouponFormClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [code, setCode] = useState(initialData?.code || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [discountType, setDiscountType] = useState<DiscountType>(
    initialData?.discountType || "PERCENTAGE"
  );
  const [discountValue, setDiscountValue] = useState(
    initialData?.discountValue !== undefined ? initialData.discountValue.toString() : ""
  );
  const [minBookingValue, setMinBookingValue] = useState(
    initialData?.minBookingValue !== undefined && initialData?.minBookingValue !== null
      ? initialData.minBookingValue.toString()
      : ""
  );
  const [maxDiscount, setMaxDiscount] = useState(
    initialData?.maxDiscount !== undefined && initialData?.maxDiscount !== null
      ? initialData.maxDiscount.toString()
      : ""
  );

  /* Helper to format ISO or datetime string for <input type="datetime-local" /> */
  const formatDatetimeForInput = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return d.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const defaultValidFrom = initialData?.validFrom
    ? formatDatetimeForInput(initialData.validFrom)
    : new Date().toISOString().slice(0, 16);

  const defaultValidUntil = initialData?.validUntil
    ? formatDatetimeForInput(initialData.validUntil)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [validFrom, setValidFrom] = useState(defaultValidFrom);
  const [validUntil, setValidUntil] = useState(defaultValidUntil);

  const [usageLimit, setUsageLimit] = useState(
    initialData?.usageLimit !== undefined && initialData?.usageLimit !== null
      ? initialData.usageLimit.toString()
      : ""
  );
  const [isActive, setIsActive] = useState(
    initialData?.isActive !== undefined ? initialData.isActive : true
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const uppercaseCode = code.trim().toUpperCase();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const parsedDiscountValue = Number(discountValue);

    if (!uppercaseCode) {
      setErrorMsg("Coupon code is required.");
      return;
    }

    if (!trimmedTitle) {
      setErrorMsg("Coupon title is required.");
      return;
    }

    if (trimmedTitle.length > 100) {
      setErrorMsg("Coupon title cannot exceed 100 characters.");
      return;
    }

    if (trimmedDescription.length > 300) {
      setErrorMsg("Coupon description cannot exceed 300 characters.");
      return;
    }

    if (isNaN(parsedDiscountValue) || parsedDiscountValue <= 0) {
      setErrorMsg("Discount value must be greater than 0.");
      return;
    }

    if (discountType === "PERCENTAGE" && parsedDiscountValue > 100) {
      setErrorMsg("Percentage discount cannot exceed 100%.");
      return;
    }

    if (!validFrom || !validUntil) {
      setErrorMsg("Valid From and Valid Until dates are required.");
      return;
    }

    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);

    if (untilDate <= fromDate) {
      setErrorMsg("Valid Until date must be strictly after Valid From date.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isEdit
        ? `/api/admin/coupons/${initialData?.id}`
        : "/api/admin/coupons";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: uppercaseCode,
          title: trimmedTitle || null,
          description: trimmedDescription || null,
          discountType,
          discountValue: parsedDiscountValue,
          minBookingValue: minBookingValue ? Number(minBookingValue) : null,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          validFrom,
          validUntil,
          usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
          isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save coupon.");
      }

      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save coupon.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
          {isEdit ? "Edit Coupon Settings" : "New Coupon Details"}
        </h2>

        {/* Coupon Code */}
        <div>
          <label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
            Coupon Code <span className="text-rose-500">*</span>
          </label>
          <input
            id="code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SUMMER10 or FESTIVE500"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 uppercase tracking-wider outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Codes will automatically format as uppercase without spaces.
          </p>
        </div>

        {/* Coupon Title */}
        <div>
          <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
            Coupon Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekend Getaway"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Headline displayed on the public Deals & Coupons card (Max 100 characters).
          </p>
        </div>

        {/* Coupon Description */}
        <div>
          <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
            Coupon Description <span className="text-slate-400 font-normal">(Recommended)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Save 15% on your next Prime Rides weekend booking."
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Detailed text or terms displayed on the offer card (Max 300 characters).
          </p>
        </div>

        {/* Discount Type & Value */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="discountType" className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Discount Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="discountType"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (₹)</option>
            </select>
          </div>

          <div>
            <label htmlFor="discountValue" className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Discount Value <span className="text-rose-500">*</span>
            </label>
            <input
              id="discountValue"
              type="number"
              step="any"
              required
              min="0.01"
              max={discountType === "PERCENTAGE" ? "100" : undefined}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "PERCENTAGE" ? "e.g. 10 (for 10%)" : "e.g. 500 (for ₹500)"}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {/* Minimum Booking Value & Maximum Discount */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="minBookingValue" className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Minimum Booking Value (₹) <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="minBookingValue"
              type="number"
              step="any"
              min="0"
              value={minBookingValue}
              onChange={(e) => setMinBookingValue(e.target.value)}
              placeholder="e.g. 5000"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
            <p className="mt-1 text-xs text-slate-500">Minimum rental total required to apply code.</p>
          </div>

          <div>
            <label htmlFor="maxDiscount" className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Maximum Discount (₹) <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="maxDiscount"
              type="number"
              step="any"
              min="0"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              placeholder="e.g. 2000"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
            <p className="mt-1 text-xs text-slate-500">Caps percentage discounts at this ceiling amount.</p>
          </div>
        </div>

        {/* Validity Range */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="validFrom" className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Valid From Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              id="validFrom"
              type="datetime-local"
              required
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label htmlFor="validUntil" className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Valid Until Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              id="validUntil"
              type="datetime-local"
              required
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {/* Usage Limit & Status */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="usageLimit" className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Total Usage Limit <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="usageLimit"
              type="number"
              min="1"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="e.g. 100 (Leave blank for unlimited)"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 rounded text-blue-600 focus:ring-blue-600 accent-blue-600"
              />
              <div>
                <span className="text-sm font-bold text-slate-900 block">Coupon Active Status</span>
                <span className="text-xs text-slate-500 font-medium">Enable code for customer checkout</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/admin/coupons"
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update Coupon" : "Create Coupon"}
        </button>
      </div>
    </form>
  );
}
