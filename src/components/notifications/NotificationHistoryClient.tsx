"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Loader2,
  AlertCircle,
  Trash2,
  Inbox,
  Settings,
} from "lucide-react";
import {
  getRelativeTime,
  renderTypeIcon,
  isValidInternalLink,
} from "@/lib/notification-helpers";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationHistoryClient() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (pageToFetch: number, resetList = false) => {
      if (pageToFetch === 1 && resetList) {
        setIsLoading(true);
      } else if (pageToFetch > 1) {
        setIsLoadingMore(true);
      }
      setHasError(false);

      try {
        const res = await fetch(`/api/notifications?page=${pageToFetch}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          const newItems: NotificationItem[] = data.notifications || [];

          setNotifications((prev) =>
            resetList ? newItems : [...prev, ...newItems]
          );

          if (typeof data.unreadCount === "number") {
            setUnreadCount(data.unreadCount);
          }

          if (data.pagination) {
            setHasMore(data.pagination.page < data.pagination.totalPages);
          } else {
            setHasMore(newItems.length === 20);
          }
        } else {
          setHasError(true);
        }
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  // Load More
  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, false);
  };

  // Mark single as read
  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await fetch(`/api/notifications/${item.id}/read`, {
          method: "PATCH",
        });
      } catch {
        // Silently handle
      }
    }

    if (isValidInternalLink(item.link)) {
      router.push(item.link!);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
    } catch {
      fetchNotifications(1, true);
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Delete notification
  const handleDelete = async (
    item: NotificationItem,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(item.id);

    // Optimistic removal
    setNotifications((prev) => prev.filter((n) => n.id !== item.id));
    if (!item.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      const res = await fetch(`/api/notifications/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        fetchNotifications(1, true);
      }
    } catch {
      fetchNotifications(1, true);
    } finally {
      setDeletingId(null);
    }
  };

  const displayedNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 shadow-xs">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Stay updated with your Prime Rides activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || isMarkingAll}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-800"
          >
            {isMarkingAll ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <CheckCheck className="h-4 w-4 text-blue-600" />
            )}
            <span>Mark all as read</span>
          </button>

          <Link
            href="/notification-preferences"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-blue-600 shrink-0"
            title="Notification Preferences"
            aria-label="Notification Preferences"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            aria-pressed={filter === "unread"}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              filter === "unread"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            Unread
          </button>
        </div>

        <span className="text-xs font-semibold text-slate-400">
          Showing {displayedNotifications.length} notification
          {displayedNotifications.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                  <div className="h-3.5 w-2/3 rounded bg-slate-200/70" />
                </div>
              </div>
              <div className="h-3 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : hasError ? (
        /* Error State */
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h3 className="text-base font-bold text-slate-900">
            Unable to load notifications.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Something went wrong while retrieving your notifications. Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => fetchNotifications(1, true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
          >
            Try again
          </button>
        </div>
      ) : displayedNotifications.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
            <Inbox className="h-8 w-8 opacity-70" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              You&apos;re all caught up
            </h3>
            <p className="text-xs text-slate-500">
              {filter === "unread"
                ? "You have no unread notifications."
                : "No notifications yet."}
            </p>
          </div>
        </div>
      ) : (
        /* Notification Items List */
        <div className="space-y-3">
          {displayedNotifications.map((item) => {
            const hasLink = isValidInternalLink(item.link);

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative flex items-start gap-4 rounded-2xl border p-4 transition-all ${
                  hasLink ? "cursor-pointer" : "cursor-default"
                } ${
                  !item.isRead
                    ? "bg-blue-50/60 border-blue-200/80 shadow-xs hover:bg-blue-50 hover:border-blue-300"
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                {/* Type Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-200/60 shrink-0">
                  {renderTypeIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-8 sm:pr-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4
                        className={`text-sm truncate ${
                          !item.isRead
                            ? "font-extrabold text-slate-900"
                            : "font-semibold text-slate-800"
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-400 shrink-0">
                      {getRelativeTime(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {/* Delete Action Button */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(item, e)}
                  disabled={deletingId === item.id}
                  className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
                  aria-label="Delete notification"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 text-xs font-extrabold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span>Loading more...</span>
                  </>
                ) : (
                  <span>Load more notifications</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
