"use client";

import { useState } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  X,
  Phone,
  Mail,
  User as UserIcon,
  Calendar,
  Sparkles,
} from "lucide-react";

interface EnquiryItem {
  id: string;
  name: string | null;
  mobile: string | null;
  email: string | null;
  subject: string | null;
  message: string;
  status: "NEW" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string | Date;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    mobile: string | null;
  } | null;
}

interface Metrics {
  total: number;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
}

interface AdminEnquiriesClientProps {
  initialEnquiries: EnquiryItem[];
  initialMetrics: Metrics;
}

function formatDate(dateInput: string | Date) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateInput));
  } catch {
    return String(dateInput);
  }
}

export default function AdminEnquiriesClient({
  initialEnquiries,
  initialMetrics,
}: AdminEnquiriesClientProps) {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(initialEnquiries);
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected Enquiry for Detail Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch updated list from API
  const refreshData = async (querySearch = search, queryStatus = statusFilter) => {
    try {
      const params = new URLSearchParams();
      if (querySearch) params.set("search", querySearch);
      if (queryStatus && queryStatus !== "ALL") params.set("status", queryStatus);

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setEnquiries(data.enquiries);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Refresh enquiries error:", err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActionSuccess(`Enquiry status updated to ${newStatus.replace("_", " ")}`);
        // Update local state
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus as any } : e))
        );
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus as any });
        }
        refreshData();
      } else {
        setActionError(data.message || "Failed to update enquiry status");
      }
    } catch {
      setActionError("Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    setUpdatingId(id);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActionSuccess("Enquiry deleted successfully");
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry(null);
        }
        refreshData();
      } else {
        setActionError(data.message || "Failed to delete enquiry");
      }
    } catch {
      setActionError("Error deleting enquiry");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refreshData(search, statusFilter);
  };

  const handleTabChange = (status: string) => {
    setStatusFilter(status);
    refreshData(search, status);
  };

  const statusBadgeStyle: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700 border-blue-200",
    OPEN: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <MessageSquare className="h-7 w-7 text-blue-600" /> Customer Enquiries
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              {metrics.total}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Review customer contact form messages, update resolution statuses, and respond to rental queries.
          </p>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" /> {actionError}
          </span>
          <button onClick={() => setActionError(null)} className="text-rose-700 hover:text-rose-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <button
          onClick={() => handleTabChange("ALL")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "ALL"
              ? "bg-[#0A1128] text-white border-[#0A1128] shadow-md"
              : "bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-xs"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Total Enquiries</p>
          <p className="text-2xl font-extrabold mt-1">{metrics.total}</p>
        </button>

        <button
          onClick={() => handleTabChange("NEW")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "NEW"
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white border-blue-200 hover:border-blue-300 text-slate-900 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">🆕 New / Open</p>
            <span className="h-2 w-2 rounded-full bg-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{metrics.newCount}</p>
        </button>

        <button
          onClick={() => handleTabChange("IN_PROGRESS")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "IN_PROGRESS"
              ? "bg-amber-600 text-white border-amber-600 shadow-md"
              : "bg-white border-amber-200 hover:border-amber-300 text-slate-900 shadow-xs"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">⏳ In Progress</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{metrics.inProgressCount}</p>
        </button>

        <button
          onClick={() => handleTabChange("RESOLVED")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "RESOLVED"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : "bg-white border-emerald-200 hover:border-emerald-300 text-slate-900 shadow-xs"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">✅ Resolved</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.resolvedCount}</p>
        </button>

        <button
          onClick={() => handleTabChange("CLOSED")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === "CLOSED"
              ? "bg-slate-700 text-white border-slate-700 shadow-md"
              : "bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-xs"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">🔒 Closed</p>
          <p className="text-2xl font-extrabold text-slate-600 mt-1">{metrics.closedCount}</p>
        </button>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, mobile or message..."
            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </form>

        {/* Status Filter Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span>Showing: <strong className="text-slate-900">{statusFilter}</strong></span>
          {statusFilter !== "ALL" && (
            <button
              onClick={() => handleTabChange("ALL")}
              className="text-blue-600 hover:underline text-[11px] font-bold ml-2"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Enquiries Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {enquiries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-3xl mb-2">📥</div>
            <h3 className="text-base font-bold text-slate-900">No Enquiries Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {search || statusFilter !== "ALL"
                ? "No customer enquiries match your filter parameters."
                : "Customer contact form submissions will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Message Preview</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Received At</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {enquiries.map((enquiry) => {
                  const name = enquiry.name || enquiry.user?.name || "Guest Customer";
                  const email = enquiry.email || enquiry.user?.email || "N/A";
                  const mobile = enquiry.mobile || enquiry.user?.mobile || "N/A";

                  return (
                    <tr
                      key={enquiry.id}
                      id={enquiry.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      {/* Customer Name */}
                      <td className="py-4 px-4 sm:px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{name}</p>
                            {enquiry.user ? (
                              <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 text-[10px] text-slate-600 font-semibold">
                                Registered User
                              </span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.2 rounded bg-amber-50 text-[10px] text-amber-700 font-semibold border border-amber-200">
                                Guest
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 font-medium">
                        <p className="text-slate-800 font-semibold truncate max-w-[160px]">{email}</p>
                        <p className="text-slate-500 font-mono text-[11px] mt-0.5">{mobile}</p>
                      </td>

                      {/* Message Preview */}
                      <td className="py-4 px-4 max-w-[280px]">
                        <p className="text-slate-900 font-medium line-clamp-2">
                          {enquiry.message}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                            statusBadgeStyle[enquiry.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {enquiry.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-500 font-medium text-[11px]">
                        {formatDate(enquiry.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedEnquiry(enquiry)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <select
                            value={enquiry.status}
                            onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                            disabled={updatingId === enquiry.id}
                            className="text-[11px] font-bold h-8 rounded-lg border border-slate-200 bg-white px-2 focus:outline-none focus:border-blue-600"
                          >
                            <option value="NEW">Set NEW</option>
                            <option value="IN_PROGRESS">Set IN_PROGRESS</option>
                            <option value="RESOLVED">Set RESOLVED</option>
                            <option value="CLOSED">Set CLOSED</option>
                          </select>

                          <button
                            onClick={() => handleDelete(enquiry.id)}
                            disabled={updatingId === enquiry.id}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in-50 duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 relative space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Enquiry Details</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedEnquiry.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Contact Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <UserIcon className="h-4 w-4 text-blue-600" />
                <span>{selectedEnquiry.name || selectedEnquiry.user?.name || "Guest Customer"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>{selectedEnquiry.email || selectedEnquiry.user?.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>{selectedEnquiry.mobile || selectedEnquiry.user?.mobile || "No mobile"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 pt-1 border-t border-slate-200/60 font-mono text-[11px]">
                <Calendar className="h-3.5 w-3.5" />
                <span>Submitted on {formatDate(selectedEnquiry.createdAt)}</span>
              </div>
            </div>

            {/* Subject & Message Content */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Subject: {selectedEnquiry.subject || "General Enquiry"}
              </h4>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Quick Status Update Footer Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Status:</span>
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                  className="text-xs font-bold h-9 rounded-xl border border-slate-200 bg-white px-3 focus:outline-none focus:border-blue-600"
                >
                  <option value="NEW">NEW</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedEnquiry.id)}
                  className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
