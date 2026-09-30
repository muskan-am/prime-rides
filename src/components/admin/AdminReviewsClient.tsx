"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Star,
  Search,
  CheckCircle2,
  EyeOff,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  AlertTriangle,
  Clock,
  Car,
  User,
  Calendar,
  MessageSquare,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
} from "lucide-react";

type ReviewUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

type ReviewVehicle = {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  primaryImage: string | null;
};

type ReviewBooking = {
  id: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
};

export type AdminReviewItem = {
  id: string;
  userId: string;
  vehicleId: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
  user: ReviewUser | null;
  vehicle: ReviewVehicle | null;
  booking: ReviewBooking | null;
};

type SummaryStats = {
  total: number;
  pending: number;
  approved: number;
  hidden: number;
  averageRating: number;
};

export type AdminVehicleSelectOption = {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  primaryImage: string | null;
};

interface AdminReviewsClientProps {
  initialSummary?: SummaryStats;
  vehicles?: AdminVehicleSelectOption[];
}

export default function AdminReviewsClient({
  initialSummary,
  vehicles = [],
}: AdminReviewsClientProps) {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [summary, setSummary] = useState<SummaryStats>(
    initialSummary || {
      total: 0,
      pending: 0,
      approved: 0,
      hidden: 0,
      averageRating: 0,
    }
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals & Action States
  const [selectedReview, setSelectedReview] = useState<AdminReviewItem | null>(null);
  const [deleteConfirmReview, setDeleteConfirmReview] = useState<AdminReviewItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Add Manual Review Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    vehicleId: vehicles[0]?.id || "",
    rating: 5,
    reviewerName: "",
    reviewerEmail: "",
    comment: "",
    status: "APPROVED" as "APPROVED" | "PENDING" | "HIDDEN",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        status: statusFilter,
        rating: ratingFilter,
        sort: sortOption,
      });

      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setReviews(data.reviews || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load admin reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, ratingFilter, sortOption, searchTerm]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateStatus = async (reviewId: string, newStatus: "APPROVED" | "HIDDEN" | "PENDING") => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("success", `Review status changed to ${newStatus}`);
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        );
        if (selectedReview?.id === reviewId) {
          setSelectedReview((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        // Refresh summary stats
        fetchReviews();
      } else {
        throw new Error(data.error || "Failed to update review status");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to update review status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteConfirmReview) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/reviews/${deleteConfirmReview.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("success", "Review permanently deleted.");
        setDeleteConfirmReview(null);
        if (selectedReview?.id === deleteConfirmReview.id) {
          setSelectedReview(null);
        }
        fetchReviews();
      } else {
        throw new Error(data.error || "Failed to delete review");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete review");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.vehicleId) {
      showToast("error", "Please select a vehicle.");
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("success", "Review created and published successfully!");
        setIsAddModalOpen(false);
        setAddForm({
          vehicleId: vehicles[0]?.id || "",
          rating: 5,
          reviewerName: "",
          reviewerEmail: "",
          comment: "",
          status: "APPROVED",
        });
        fetchReviews();
      } else {
        throw new Error(data.error || "Failed to create review");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to create review");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
              Reviews & Ratings Moderation
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Review customer feedback, approve ratings for public catalog display, and add custom vehicle reviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Manual Review</span>
          </button>

          <button
            type="button"
            onClick={() => fetchReviews()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 shadow-sm ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {/* Total */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Reviews
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {summary.total}
          </p>
        </div>

        {/* Pending */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Pending
            </p>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
            {summary.pending}
          </p>
        </div>

        {/* Approved */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Approved
            </p>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {summary.approved}
          </p>
        </div>

        {/* Hidden */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hidden
            </p>
            <EyeOff className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-600 mt-2">
            {summary.hidden}
          </p>
        </div>

        {/* Average Rating */}
        <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-[#0A1128] text-white shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Platform Rating
            </p>
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
            {summary.averageRating > 0 ? `${summary.averageRating} ★` : "N/A"}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          {/* Search Input */}
          <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
            <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by customer, vehicle, comment, or booking ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 outline-none placeholder-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setPage(1);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Moderation</option>
            <option value="APPROVED">Approved (Public)</option>
            <option value="HIDDEN">Hidden</option>
          </select>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Ratings (1-5★)</option>
            <option value="5">5 Stars (★★★★★)</option>
            <option value="4">4 Stars (★★★★☆)</option>
            <option value="3">3 Stars (★★★☆☆)</option>
            <option value="2">2 Stars (★★☆☆☆)</option>
            <option value="1">1 Star (★☆☆☆☆)</option>
          </select>

          {/* Sort Option */}
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        {/* Quick Filter Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-400 mr-1">Quick Filter:</span>
          {["ALL", "PENDING", "APPROVED", "HIDDEN"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "ALL" && `All (${summary.total})`}
              {st === "PENDING" && `Pending (${summary.pending})`}
              {st === "APPROVED" && `Approved (${summary.approved})`}
              {st === "HIDDEN" && `Hidden (${summary.hidden})`}
            </button>
          ))}
        </div>
      </div>

      {/* Review Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base sm:text-lg">
            Customer Reviews List
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {reviews.length} of {totalCount} records
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs font-semibold">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No reviews found</p>
            <p className="text-xs text-slate-400">
              No reviews match your selected filters or search keyword.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Review</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Customer */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {(rev.user?.name || "C").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {rev.user?.name || "Customer"}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {rev.user?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="py-4 px-4">
                      {rev.vehicle ? (
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                            {rev.vehicle.primaryImage ? (
                              <img
                                src={rev.vehicle.primaryImage}
                                alt={rev.vehicle.model}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Car className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {rev.vehicle.brand} {rev.vehicle.model}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {rev.vehicle.variant || "Standard"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Vehicle Removed</span>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1 font-bold text-amber-500">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </td>

                    {/* Review Snippet */}
                    <td className="py-4 px-4">
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-sm">
                        "{rev.comment || "No comment provided."}"
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                          rev.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : rev.status === "HIDDEN"
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                        }`}
                      >
                        {rev.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                        {rev.status === "PENDING" && <Clock className="h-3 w-3" />}
                        {rev.status === "HIDDEN" && <EyeOff className="h-3 w-3" />}
                        <span>{rev.status}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Modal Trigger */}
                        <button
                          type="button"
                          onClick={() => setSelectedReview(rev)}
                          title="View Full Details"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Quick Approve */}
                        {rev.status !== "APPROVED" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(rev.id, "APPROVED")}
                            disabled={actionLoading}
                            title="Approve Review"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}

                        {/* Quick Hide */}
                        {rev.status !== "HIDDEN" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(rev.id, "HIDDEN")}
                            disabled={actionLoading}
                            title="Hide Review"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete Trigger */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmReview(rev)}
                          disabled={actionLoading}
                          title="Delete Review"
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Detail & Moderation Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setSelectedReview(null)}
          />

          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl z-10 space-y-6">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Review Moderation Details</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0A1128]">
                  Customer Feedback Review
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Vehicle & Customer Info */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Customer
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {selectedReview.user?.name || "Customer"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {selectedReview.user?.email || "No email"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Vehicle
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {selectedReview.vehicle?.brand} {selectedReview.vehicle?.model}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedReview.vehicle?.variant || "Standard"}
                </p>
              </div>
            </div>

            {/* Booking & Date Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-400 font-semibold">Booking ID: </span>
                <span className="font-mono font-bold text-slate-800">
                  #{selectedReview.bookingId}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Submitted: </span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedReview.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Rating & Review Content */}
            <div className="p-4 rounded-2xl border border-slate-100 bg-amber-50/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= selectedReview.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-black text-amber-800 text-sm">
                    {selectedReview.rating}.0 / 5
                  </span>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${
                    selectedReview.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedReview.status === "HIDDEN"
                      ? "bg-slate-200 text-slate-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {selectedReview.status}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1 whitespace-pre-wrap">
                "{selectedReview.comment}"
              </p>
            </div>

            {/* Moderation Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmReview(selectedReview)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Delete Review
              </button>

              <div className="flex items-center gap-2">
                {selectedReview.status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReview.id, "APPROVED")}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve & Publish
                  </button>
                )}

                {selectedReview.status !== "HIDDEN" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReview.id, "HIDDEN")}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <EyeOff className="h-4 w-4" /> Hide From Public
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setDeleteConfirmReview(null)}
          />

          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl z-10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                Permanently Delete Review?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this {deleteConfirmReview.rating}★ review by{" "}
                <strong>{deleteConfirmReview.user?.name || "Customer"}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmReview(null)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteReview}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                {actionLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual / Custom Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => !addLoading && setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl z-10 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Star className="h-5 w-5 fill-blue-600 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Add Review for Vehicle
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add custom customer ratings and testimonials directly to any car.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !addLoading && setIsAddModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateReview} className="space-y-4">
              {/* Vehicle Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Vehicle <span className="text-rose-500">*</span>
                </label>
                <select
                  value={addForm.vehicleId}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, vehicleId: e.target.value }))
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="" disabled>
                    -- Select a vehicle from fleet --
                  </option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} {v.variant ? `(${v.variant})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rating <span className="text-rose-500">*</span> ({addForm.rating} of 5 Stars)
                </label>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAddForm((prev) => ({ ...prev, rating: star }))}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            star <= (hoverRating || addForm.rating)
                              ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                              : "fill-transparent text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="ml-auto text-xs font-black text-amber-800">
                    {addForm.rating === 5
                      ? "★★★★★ Excellent (5.0)"
                      : addForm.rating === 4
                      ? "★★★★☆ Very Good (4.0)"
                      : addForm.rating === 3
                      ? "★★★☆☆ Good (3.0)"
                      : addForm.rating === 2
                      ? "★★☆☆☆ Fair (2.0)"
                      : "★☆☆☆☆ Poor (1.0)"}
                  </span>
                </div>
              </div>

              {/* Reviewer Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Reviewer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={addForm.reviewerName}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, reviewerName: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Reviewer Email <span className="text-slate-400 text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. user@gmail.com"
                    value={addForm.reviewerEmail}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, reviewerEmail: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Review Comment / Feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Review Comment / Testimonial
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. The car was in pristine condition, very clean interior and smooth transmission on the highway!"
                  value={addForm.comment}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none resize-none"
                />
              </div>

              {/* Publication Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  value={addForm.status}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      status: e.target.value as "APPROVED" | "PENDING" | "HIDDEN",
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="APPROVED">APPROVED (Instantly visible & calculates in rating)</option>
                  <option value="PENDING">PENDING (In moderation queue)</option>
                  <option value="HIDDEN">HIDDEN (Private/Hidden from catalog)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => !addLoading && setIsAddModalOpen(false)}
                  disabled={addLoading}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {addLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Publish Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
