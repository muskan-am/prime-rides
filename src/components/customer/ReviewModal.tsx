"use client";

import { useState } from "react";
import { Star, X, CheckCircle2, AlertCircle, Car, Sparkles, Loader2 } from "lucide-react";

export type ReviewTargetInfo = {
  bookingId: string;
  vehicleId: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleImage?: string | null;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
    status: string;
  } | null;
};

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ReviewTargetInfo | null;
  onSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  target,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(
    target?.existingReview?.rating || 5
  );
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(
    target?.existingReview?.comment || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !target) return null;

  const MAX_CHARS = 1000;
  const currentChars = comment.length;
  const isEdit = Boolean(target.existingReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (rating < 1 || rating > 5) {
      setErrorMessage("Please select a star rating between 1 and 5.");
      return;
    }

    const trimmed = comment.trim();
    if (!trimmed) {
      setErrorMessage("Please write a short review describing your experience.");
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setErrorMessage(`Review cannot exceed ${MAX_CHARS} characters.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: target.bookingId,
          rating,
          comment: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setSuccessMessage(
        data.message || "Thank you for sharing your experience!"
      );

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl transition-all z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isEdit ? "Edit Your Review" : "Customer Experience Review"}</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#0A1128] tracking-tight">
              Rate Your Ride Experience
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Vehicle Preview Card */}
        <div className="my-5 flex items-center gap-4 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
          <div className="h-16 w-24 rounded-xl bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
            {target.vehicleImage ? (
              <img
                src={target.vehicleImage}
                alt={`${target.vehicleBrand} ${target.vehicleModel}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <Car className="h-7 w-7 text-slate-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {target.vehicleBrand}
            </p>
            <h4 className="text-base font-extrabold text-slate-900 truncate">
              {target.vehicleModel}
            </h4>
            <p className="text-[11px] font-medium text-slate-400 font-mono">
              Booking: #{target.bookingId.slice(-8)}
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-black text-slate-900">
              {successMessage}
            </h4>
            <p className="text-xs text-slate-500">
              Your feedback helps fellow travelers make informed self-drive choices.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star Rating Selector */}
            <div className="space-y-2 text-center py-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                How was your ride overall?
              </label>

              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled =
                    (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors ${
                          isFilled
                            ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                            : "text-slate-200 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-bold text-amber-600">
                {rating === 5 && "⭐ Excellent Experience"}
                {rating === 4 && "⭐ Very Good Ride"}
                {rating === 3 && "⭐ Good / Satisfactory"}
                {rating === 2 && "⭐ Needs Improvement"}
                {rating === 1 && "⭐ Poor / Disappointed"}
              </p>
            </div>

            {/* Review Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="review-comment"
                  className="text-xs font-bold text-slate-700"
                >
                  Write Your Review <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-[11px] font-semibold ${
                    currentChars > MAX_CHARS
                      ? "text-rose-600"
                      : "text-slate-400"
                  }`}
                >
                  {currentChars} / {MAX_CHARS}
                </span>
              </div>

              <textarea
                id="review-comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this car... (e.g. driving comfort, car cleanliness, pickup experience, air conditioning, fuel economy)"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                maxLength={MAX_CHARS}
                required
              />
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>{isEdit ? "Update Review" : "Submit Review"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
