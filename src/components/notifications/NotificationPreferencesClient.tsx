"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Bell,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
  Calendar,
  CreditCard,
} from "lucide-react";

interface PreferencesState {
  bookingCreated: boolean;
  paymentPending: boolean;
  paymentSuccess: boolean;
  bookingConfirmed: boolean;
  bookingCancelled: boolean;
  bookingCompleted: boolean;
  adminNewBooking: boolean;
  adminPaymentReceived: boolean;
  adminBookingCancelled: boolean;
}

const DEFAULT_STATE: PreferencesState = {
  bookingCreated: true,
  paymentPending: true,
  paymentSuccess: true,
  bookingConfirmed: true,
  bookingCancelled: true,
  bookingCompleted: true,
  adminNewBooking: true,
  adminPaymentReceived: true,
  adminBookingCancelled: true,
};

interface PreferenceToggleItem {
  key: keyof PreferencesState;
  title: string;
  description: string;
}

const CUSTOMER_BOOKING_ITEMS: PreferenceToggleItem[] = [
  {
    key: "bookingCreated",
    title: "Booking Received",
    description: "Receive in-app notifications when your booking request is received.",
  },
  {
    key: "bookingConfirmed",
    title: "Booking Confirmed",
    description: "Receive in-app notifications when your vehicle booking is confirmed.",
  },
  {
    key: "bookingCancelled",
    title: "Booking Cancelled",
    description: "Receive in-app notifications if your booking is cancelled.",
  },
  {
    key: "bookingCompleted",
    title: "Booking Completed",
    description: "Receive in-app notifications when your vehicle rental is completed.",
  },
];

const CUSTOMER_PAYMENT_ITEMS: PreferenceToggleItem[] = [
  {
    key: "paymentPending",
    title: "Payment Pending",
    description: "Receive in-app notifications when your booking is awaiting payment.",
  },
  {
    key: "paymentSuccess",
    title: "Payment Successful",
    description: "Receive in-app notifications when your payment is verified.",
  },
];

const ADMIN_ITEMS: PreferenceToggleItem[] = [
  {
    key: "adminNewBooking",
    title: "New Booking Received",
    description: "Notify when a customer creates a new rental booking.",
  },
  {
    key: "adminPaymentReceived",
    title: "Payment Received",
    description: "Notify when a customer successfully completes a payment.",
  },
  {
    key: "adminBookingCancelled",
    title: "Booking Cancelled",
    description: "Notify when any customer booking is cancelled.",
  },
];

export default function NotificationPreferencesClient() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [preferences, setPreferences] = useState<PreferencesState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch preferences
  useEffect(() => {
    async function fetchPreferences() {
      setIsLoading(true);
      setHasError(false);
      try {
        const res = await fetch("/api/notification-preferences");
        if (res.ok) {
          const data = await res.json();
          setPreferences({
            bookingCreated: data.bookingCreated ?? true,
            paymentPending: data.paymentPending ?? true,
            paymentSuccess: data.paymentSuccess ?? true,
            bookingConfirmed: data.bookingConfirmed ?? true,
            bookingCancelled: data.bookingCancelled ?? true,
            bookingCompleted: data.bookingCompleted ?? true,
            adminNewBooking: data.adminNewBooking ?? true,
            adminPaymentReceived: data.adminPaymentReceived ?? true,
            adminBookingCancelled: data.adminBookingCancelled ?? true,
          });
        } else {
          setHasError(true);
        }
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPreferences();
  }, []);

  const handleToggle = (key: keyof PreferencesState) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/notification-preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        setSaveSuccess(true);
      } else {
        const errData = await res.json();
        setSaveError(errData.error || "Unable to save preferences. Please try again.");
      }
    } catch {
      setSaveError("Unable to save preferences. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderSection = (
    sectionTitle: string,
    sectionIcon: React.ReactNode,
    items: PreferenceToggleItem[]
  ) => (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {sectionIcon}
        </div>
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
          {sectionTitle}
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const isEnabled = preferences[item.key];

          return (
            <div
              key={item.key}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-0.5 max-w-xl">
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500 font-medium">
                  {item.description}
                </p>
              </div>

              {/* Accessible Switch Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                aria-label={item.title}
                onClick={() => handleToggle(item.key)}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                  isEnabled ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[10px] font-black uppercase ${
                    isEnabled
                      ? "translate-x-6 text-blue-600"
                      : "translate-x-0 text-slate-400"
                  }`}
                >
                  {isEnabled ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-4 w-96 rounded bg-slate-200/70" />
        <div className="space-y-4 pt-4">
          <div className="h-48 rounded-3xl bg-white border border-slate-200 p-6" />
          <div className="h-48 rounded-3xl bg-white border border-slate-200 p-6" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h3 className="text-base font-bold text-slate-900">
          Unable to load notification preferences.
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please check your connection and try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Notification Preferences
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Control which in-app notifications you receive.
            </p>
          </div>
        </div>
      </div>

      {/* Save Toast Alerts */}
      {saveSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center gap-3 animate-in fade-in-50 duration-150">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm font-bold">
            Notification preferences saved successfully.
          </p>
        </div>
      )}

      {saveError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 flex items-center gap-3 animate-in fade-in-50 duration-150">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p className="text-xs sm:text-sm font-bold">{saveError}</p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {/* Customer Sections */}
        {renderSection(
          "Booking Updates",
          <Calendar className="h-5 w-5" />,
          CUSTOMER_BOOKING_ITEMS
        )}

        {renderSection(
          "Payment Updates",
          <CreditCard className="h-5 w-5" />,
          CUSTOMER_PAYMENT_ITEMS
        )}

        {/* Admin Section (Only shown to Admin users) */}
        {isAdmin &&
          renderSection(
            "Admin Operational Activity",
            <Shield className="h-5 w-5" />,
            ADMIN_ITEMS
          )}
      </div>

      {/* Footer Save Action */}
      <div className="flex items-center justify-end border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-8 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving preferences...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
