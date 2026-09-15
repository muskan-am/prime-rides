import {
  Bell,
  Calendar,
  CreditCard,
  XCircle,
  Clock,
  CheckCircle2,
  Car,
} from "lucide-react";

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return "Just now";
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes === 1) return "1 min ago";
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) return "1 hr ago";
  if (diffInHours < 24) return `${diffInHours} hrs ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function renderTypeIcon(type: string) {
  switch (type) {
    case "ADMIN_NEW_BOOKING":
    case "BOOKING_CREATED":
      return <Calendar className="h-5 w-5 text-blue-600 shrink-0" />;
    case "BOOKING_CONFIRMED":
      return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
    case "ADMIN_PAYMENT_RECEIVED":
    case "PAYMENT_SUCCESS":
      return <CreditCard className="h-5 w-5 text-emerald-600 shrink-0" />;
    case "PAYMENT_PENDING":
      return <Clock className="h-5 w-5 text-amber-500 shrink-0" />;
    case "ADMIN_BOOKING_CANCELLED":
    case "BOOKING_CANCELLED":
      return <XCircle className="h-5 w-5 text-rose-500 shrink-0" />;
    case "BOOKING_COMPLETED":
      return <Car className="h-5 w-5 text-blue-600 shrink-0" />;
    default:
      return <Bell className="h-5 w-5 text-blue-600 shrink-0" />;
  }
}

export function isValidInternalLink(link?: string | null): boolean {
  if (!link || typeof link !== "string") return false;
  const trimmed = link.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//");
}
