"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface EmailLogUser {
  id: string;
  name?: string | null;
  email: string;
}

interface EmailLogBooking {
  id: string;
}

interface EmailLogItem {
  id: string;
  userId?: string | null;
  user?: EmailLogUser | null;
  bookingId?: string | null;
  booking?: EmailLogBooking | null;
  recipient: string;
  type: string;
  subject: string;
  status: string;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MetricsMeta {
  total: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
}

const EMAIL_TYPES = [
  { value: "ALL", label: "All Email Types" },
  { value: "BOOKING_CREATED", label: "Booking Created (Customer)" },
  { value: "ADMIN_BOOKING_CREATED", label: "Booking Created (Admin)" },
  { value: "PAYMENT_PENDING", label: "Payment Pending" },
  { value: "PAYMENT_SUCCESS", label: "Payment Success" },
  { value: "BOOKING_CONFIRMED", label: "Booking Confirmed" },
  { value: "BOOKING_CANCELLED", label: "Booking Cancelled" },
  { value: "BOOKING_COMPLETED", label: "Booking Completed" },
  { value: "NEW_ENQUIRY", label: "New Enquiry (Admin)" },
];

export default function AdminEmailLogsClient() {
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [metrics, setMetrics] = useState<MetricsMeta>({
    total: 0,
    sentCount: 0,
    failedCount: 0,
    pendingCount: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLog, setSelectedLog] = useState<EmailLogItem | null>(null);

  const fetchEmailLogs = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const query = new URLSearchParams();
        query.set("page", page.toString());
        query.set("limit", limit.toString());

        if (search.trim()) query.set("search", search.trim());
        if (statusFilter && statusFilter !== "ALL") query.set("status", statusFilter);
        if (typeFilter && typeFilter !== "ALL") query.set("type", typeFilter);
        if (startDate) query.set("startDate", startDate);
        if (endDate) query.set("endDate", endDate);

        const res = await fetch(`/api/admin/email-logs?${query.toString()}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setLogs(data.data || []);
          setPagination(
            data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 }
          );
          setMetrics(
            data.metrics || { total: 0, sentCount: 0, failedCount: 0, pendingCount: 0 }
          );
        } else {
          setError(data.message || "Failed to load email logs");
        }
      } catch (err) {
        console.error("Fetch email logs error:", err);
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, limit, search, statusFilter, typeFilter, startDate, endDate]
  );

  useEffect(() => {
    fetchEmailLogs();
  }, [fetchEmailLogs]);

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const formatDateString = (dateStr?: string | null) => {
    if (!dateStr) return "Not available";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Not available";
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            SENT
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            FAILED
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            PENDING
          </span>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    const formatted = type.replace(/_/g, " ");
    let colorClasses = "bg-blue-50 text-blue-700 border-blue-200";

    if (type.includes("ADMIN")) {
      colorClasses = "bg-purple-50 text-purple-700 border-purple-200";
    } else if (type.includes("CANCEL")) {
      colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
    } else if (type.includes("CONFIRM") || type.includes("SUCCESS")) {
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    return (
      <span
        className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${colorClasses}`}
      >
        {formatted}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Email Delivery Logs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Resend Sync
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Monitor, filter, and inspect transactional email activity in real-time.
          </p>
        </div>

        <button
          onClick={() => fetchEmailLogs(true)}
          disabled={isRefreshing || isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-all disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : "text-slate-500"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Logs
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {metrics.total.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Delivered (SENT)
          </p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {metrics.sentCount.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
            Failed (FAILED)
          </p>
          <p className="text-2xl font-extrabold text-rose-700 mt-1">
            {metrics.failedCount.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Pending (PENDING)
          </p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">
            {metrics.pendingCount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search recipient, subject, provider ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-3 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="SENT">SENT (Delivered)</option>
              <option value="FAILED">FAILED (Delivery Failed)</option>
              <option value="PENDING">PENDING (In Progress)</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 text-slate-700 font-medium"
            >
              {EMAIL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              aria-label="Start Date"
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              aria-label="End Date"
              className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-700"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(search || statusFilter !== "ALL" || typeFilter !== "ALL" || startDate || endDate) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              Filters applied
            </span>
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-500">
              Loading email logs...
            </p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            <button
              onClick={() => fetchEmailLogs()}
              className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No email logs found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no email delivery attempts matching your current search or filter criteria.
            </p>
            {(search || statusFilter !== "ALL" || typeFilter !== "ALL" || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Email Type</th>
                    <th className="py-3.5 px-4">Recipient</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Provider ID</th>
                    <th className="py-3.5 px-4">Sent At</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-xs">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {getTypeBadge(log.type)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[200px] truncate">
                        {log.recipient}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[220px] truncate">
                        {log.subject}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.providerMessageId ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {log.providerMessageId.slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatDateString(log.sentAt || log.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} logs
                </span>

                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="ml-2 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  Previous
                </button>

                <span className="text-xs font-bold px-3 py-1.5 text-slate-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Email Log Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  {getTypeBadge(selectedLog.type)}
                  {getStatusBadge(selectedLog.status)}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Email Delivery Details
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  ID: {selectedLog.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Recipient
                </span>
                <span className="font-semibold text-slate-900 break-all block">
                  {selectedLog.recipient}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Subject
                </span>
                <span className="font-semibold text-slate-900 block">
                  {selectedLog.subject}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Provider Message ID (Resend)
                </span>
                <span className="font-mono font-semibold text-slate-800 break-all block">
                  {selectedLog.providerMessageId || "Not available"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Customer / User
                </span>
                {selectedLog.user ? (
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {selectedLog.user.name || "Customer"}
                    </span>
                    <span className="text-slate-500 block">
                      {selectedLog.user.email}
                    </span>
                  </div>
                ) : (
                  <span className="font-medium text-slate-600 block">
                    System / Guest
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Associated Booking ID
                </span>
                {selectedLog.bookingId ? (
                  <Link
                    href={`/admin/bookings?search=${selectedLog.bookingId}`}
                    target="_blank"
                    className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {selectedLog.bookingId}
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                ) : (
                  <span className="text-slate-400 font-medium block">
                    Not available
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sent Timestamp
                </span>
                <span className="font-medium text-slate-800 block">
                  {formatDateString(selectedLog.sentAt)}
                </span>
              </div>
            </div>

            {/* Error Message Panel if status is FAILED */}
            {selectedLog.status === "FAILED" && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold uppercase tracking-wider text-[11px]">
                  <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Delivery Failure Error Message
                </div>
                <p className="font-mono text-rose-900 leading-relaxed bg-white/70 p-3 rounded-lg border border-rose-200/60 break-all">
                  {selectedLog.errorMessage || "Delivery failed without detailed message."}
                </p>
              </div>
            )}

            {/* Timestamps Row */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <span>Created At: {formatDateString(selectedLog.createdAt)}</span>
              <span>Updated At: {formatDateString(selectedLog.updatedAt)}</span>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
