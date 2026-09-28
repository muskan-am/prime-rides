"use client";

import { useState } from "react";
import { Star, Edit3, CheckCircle, Clock } from "lucide-react";
import ReviewModal, { ReviewTargetInfo } from "@/components/customer/ReviewModal";
import { useRouter } from "next/navigation";

interface BookingReviewButtonProps {
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
}

export default function BookingReviewButton({
  bookingId,
  vehicleId,
  vehicleBrand,
  vehicleModel,
  vehicleImage,
  existingReview,
}: BookingReviewButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const target: ReviewTargetInfo = {
    bookingId,
    vehicleId,
    vehicleBrand,
    vehicleModel,
    vehicleImage,
    existingReview,
  };

  const handleSuccess = () => {
    router.refresh();
  };

  if (existingReview) {
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-800 transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
          >
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>★ {existingReview.rating} Reviewed</span>
            <Edit3 className="h-3 w-3 text-amber-600 ml-0.5" />
          </button>

          {existingReview.status === "PENDING" && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-200">
              <Clock className="h-3 w-3 text-amber-500" />
              <span>Pending Moderation</span>
            </span>
          )}
          {existingReview.status === "APPROVED" && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              <CheckCircle className="h-3 w-3 text-emerald-600" />
              <span>Approved</span>
            </span>
          )}
        </div>

        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          target={target}
          onSuccess={handleSuccess}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Star className="h-3.5 w-3.5 fill-white text-white" />
        <span>Rate & Review</span>
      </button>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        target={target}
        onSuccess={handleSuccess}
      />
    </>
  );
}
