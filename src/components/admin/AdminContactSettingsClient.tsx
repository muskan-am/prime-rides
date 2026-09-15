"use client";

import { useState } from "react";
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";

interface ContactSettingsData {
  eyebrow: string;
  heading: string;
  description: string;
  phone: string;
  email: string;
  locationsText: string;
  responseTimeText: string;
  highlight1Title: string;
  highlight1Desc: string;
  highlight1Icon: string;
  highlight2Title: string;
  highlight2Desc: string;
  highlight2Icon: string;
  highlight3Title: string;
  highlight3Desc: string;
  highlight3Icon: string;
  heroHeading: string;
  heroDescription: string;
  heroImage: string | null;
}

interface AdminContactSettingsClientProps {
  initialSettings: ContactSettingsData;
}

export default function AdminContactSettingsClient({
  initialSettings,
}: AdminContactSettingsClientProps) {
  const [formData, setFormData] = useState<ContactSettingsData>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/contact-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaveSuccess("Contact Settings saved successfully! The Customer Contact page has been updated.");
        if (data.settings) setFormData(data.settings);
      } else {
        setSaveError(data.message || "Failed to save Contact Settings.");
      }
    } catch {
      setSaveError("An error occurred while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(initialSettings);
    setSaveSuccess(null);
    setSaveError(null);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="h-7 w-7 text-blue-600" /> Contact Page CMS & Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Manage contact information, support highlight badges, hero text, and operating locations shown on the Customer Contact page.
          </p>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-in fade-in-50 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Save Error Alert */}
      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-3 animate-in fade-in-50 duration-200">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: GENERAL CONTACT INFORMATION */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-[#0A1128] flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" /> General Contact Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These details update the contact cards and contact form badges on the `/contact` page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="support@primerides.com"
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Operating Locations Display Text
              </label>
              <input
                type="text"
                value={formData.locationsText}
                onChange={(e) => setFormData({ ...formData, locationsText: e.target.value })}
                placeholder="Delhi · Goa · Bangalore"
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Response Time Indicator
              </label>
              <input
                type="text"
                value={formData.responseTimeText}
                onChange={(e) => setFormData({ ...formData, responseTimeText: e.target.value })}
                placeholder="We usually respond within 24 hours"
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: HERO CONTENT & TEXT */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-[#0A1128] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" /> Hero Section Content
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the top hero banner eyebrow, main heading, and supporting intro paragraph.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Hero Eyebrow Badge
              </label>
              <input
                type="text"
                value={formData.eyebrow}
                onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                placeholder="WE'RE HERE TO HELP"
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Main Hero Heading
              </label>
              <input
                type="text"
                value={formData.heading}
                onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                placeholder="Contact & Support"
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Hero Supporting Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Have a question about our cars, bookings or rental plans? Our team is here to help..."
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SUPPORT HIGHLIGHT BADGES */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-[#0A1128] flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" /> Support Highlight Badges
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit the 3 feature highlight cards displayed in the Contact Page hero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Highlight 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Zap className="h-4 w-4" /> Highlight 1
              </h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.highlight1Title}
                  onChange={(e) => setFormData({ ...formData, highlight1Title: e.target.value })}
                  placeholder="Quick Support"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.highlight1Desc}
                  onChange={(e) => setFormData({ ...formData, highlight1Desc: e.target.value })}
                  placeholder="We respond fast"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Highlight 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Highlight 2
              </h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.highlight2Title}
                  onChange={(e) => setFormData({ ...formData, highlight2Title: e.target.value })}
                  placeholder="Reliable Assistance"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.highlight2Desc}
                  onChange={(e) => setFormData({ ...formData, highlight2Desc: e.target.value })}
                  placeholder="Your travel partner"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Highlight 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4" /> Highlight 3
              </h3>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.highlight3Title}
                  onChange={(e) => setFormData({ ...formData, highlight3Title: e.target.value })}
                  placeholder="Customer First"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.highlight3Desc}
                  onChange={(e) => setFormData({ ...formData, highlight3Desc: e.target.value })}
                  placeholder="Always here for you"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="sticky bottom-6 z-30 p-4 rounded-2xl bg-[#0A1128] text-white shadow-2xl border border-slate-800 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-300 font-medium hidden sm:block">
            Save changes to update the live Customer Contact page immediately.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:bg-slate-500"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
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
      </form>
    </div>
  );
}
