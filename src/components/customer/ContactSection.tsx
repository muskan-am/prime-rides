"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  MessageSquare,
} from "lucide-react";

interface ContactSettingsData {
  phone?: string;
  email?: string;
  locationsText?: string;
  responseTimeText?: string;
}

export default function ContactSection() {
  const [settings, setSettings] = useState<ContactSettingsData>({
    phone: "+91 98765 43210",
    email: "support@primerides.com",
    locationsText: "Delhi · Goa · Bangalore",
    responseTimeText: "We usually respond within 24 hours",
  });

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contact-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("Please enter your name (at least 2 characters).");
      return;
    }

    if (!formData.mobile.trim() || !/^[0-9+\s\-()]{7,20}$/.test(formData.mobile.trim())) {
      setError("Please enter a valid mobile number.");
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setError("Message must be at least 10 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(data.message || "Your enquiry has been submitted successfully!");
        setFormData({ name: "", mobile: "", email: "", message: "" });
      } else {
        setError(data.message || "Failed to submit enquiry. Please check your details and try again.");
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="border-t border-slate-200/80 bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            CONTACT US
          </p>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1128]">
            Contact & Support
          </h2>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-500 font-medium pt-1">
            Have a question about our cars, bookings or rental plans? Our team is here to help.
          </p>
        </div>

        {/* Content */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2 items-start">
          {/* Contact Information */}
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-8 shadow-sm">
            <h3 className="text-2xl font-extrabold text-[#0A1128]">
              Get in touch
            </h3>

            <p className="mt-3 text-sm text-slate-500 leading-relaxed font-medium">
              Contact Prime Rides for booking assistance, rental enquiries or any other information.
            </p>

            <div className="mt-8 space-y-4">
              {/* Location */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 font-bold">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Locations</h4>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {settings.locationsText || "Delhi · Goa · Bangalore"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <a
                href={`tel:${(settings.phone || "").replace(/\s+/g, "")}`}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 transition-all shadow-xs group"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</h4>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {settings.phone || "+91 98765 43210"}
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${settings.email || "support@primerides.com"}`}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 transition-all shadow-xs group"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-600 font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</h4>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {settings.email || "support@primerides.com"}
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <h3 className="text-2xl font-extrabold text-[#0A1128] flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-blue-600" /> Send us a message
              </h3>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3 text-blue-600" /> 24h Response
              </span>
            </div>

            {success && (
              <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mt-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="hp-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="hp-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                  maxLength={100}
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50"
                />
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="hp-mobile" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="hp-mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="Enter your mobile number"
                  required
                  maxLength={20}
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="hp-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="hp-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  maxLength={150}
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="hp-message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="hp-message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  required
                  minLength={10}
                  maxLength={2000}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.99] disabled:bg-slate-400 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Enquiry...</span>
                  </>
                ) : (
                  <>
                    <span>Send Enquiry</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}