"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, CheckCheck, Loader2, AlertCircle } from "lucide-react";
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

interface NotificationBellProps {
  variant?: "customer" | "admin" | "admin-dark";
  className?: string;
}

export default function NotificationBell({
  variant = "customer",
  className = "",
}: NotificationBellProps) {
  const { status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === "authenticated";

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Silent error for background count fetch
    }
  }, [isAuthenticated]);

  // Fetch notifications list
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await fetch("/api/notifications?limit=20&page=1");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        if (typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        }
      } else {
        setHasError(true);
      }
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Handle click outside & escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  // Mark single notification as read
  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await fetch(`/api/notifications/${item.id}/read`, {
          method: "PATCH",
        });
      } catch {
        // Silently handle patch failure
      }
    }

    setIsOpen(false);

    if (isValidInternalLink(item.link)) {
      router.push(item.link!);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
    } catch {
      // Re-fetch to restore state if patch fails
      fetchNotifications();
    } finally {
      setIsMarkingAll(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const badgeText = unreadCount > 99 ? "99+" : unreadCount.toString();

  const buttonStyle =
    variant === "admin-dark"
      ? "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 transition-all hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      : "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20";

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={buttonStyle}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-in zoom-in-50 duration-150">
            {badgeText}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-slate-900/5 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150"
          role="region"
          aria-label="Notification list"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2 pb-2.5 pt-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || isMarkingAll}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-40 disabled:no-underline transition-all"
            >
              {isMarkingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              <span>Mark all read</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="mt-2 max-h-80 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
            {isLoading ? (
              /* Loading Skeletons */
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex flex-col gap-2 rounded-xl bg-slate-50 p-3">
                    <div className="h-3.5 w-1/2 rounded bg-slate-200" />
                    <div className="h-3 w-3/4 rounded bg-slate-200/70" />
                    <div className="h-2.5 w-1/4 rounded bg-slate-200/50" />
                  </div>
                ))}
              </div>
            ) : hasError ? (
              /* Error State */
              <div className="flex flex-col items-center justify-center py-8 text-center px-4 space-y-2">
                <AlertCircle className="h-8 w-8 text-rose-500" />
                <p className="text-xs font-semibold text-slate-700">
                  Unable to load notifications.
                </p>
                <button
                  type="button"
                  onClick={fetchNotifications}
                  className="mt-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-10 text-center px-4 space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Bell className="h-6 w-6 opacity-60" />
                </div>
                <p className="text-sm font-bold text-slate-900">You&apos;re all caught up</p>
                <p className="text-xs text-slate-500">No new notifications right now.</p>
              </div>
            ) : (
              /* Notification List */
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full text-left rounded-xl p-3 transition-all flex items-start gap-3 group border ${
                    !item.isRead
                      ? "bg-blue-50/70 border-blue-100 hover:bg-blue-50"
                      : "bg-white border-transparent hover:bg-slate-50"
                  }`}
                >
                  {/* Type icon */}
                  <div className="pt-0.5 shrink-0 flex items-center justify-center">
                    {renderTypeIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs truncate ${
                          !item.isRead
                            ? "font-extrabold text-slate-900"
                            : "font-semibold text-slate-700"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        {getRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {/* Unread indicator dot */}
                  {!item.isRead && (
                    <div className="pt-1.5 shrink-0">
                      <span className="block h-2 w-2 rounded-full bg-blue-600 shadow-sm" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer - View All Link */}
          <div className="mt-2 pt-2 border-t border-slate-100 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-block w-full rounded-xl py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
