"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Zap,
  ShieldCheck,
  HeartHandshake,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Car,
  Sparkles,
  MessageSquare,
} from "lucide-react";

interface ContactSettingsData {
  eyebrow?: string;
  heading?: string;
  description?: string;
  phone?: string;
  email?: string;
  locationsText?: string;
  responseTimeText?: string;
  highlight1Title?: string;
  highlight1Desc?: string;
  highlight1Icon?: string;
  highlight2Title?: string;
  highlight2Desc?: string;
  highlight2Icon?: string;
  highlight3Title?: string;
  highlight3Desc?: string;
  highlight3Icon?: string;
  heroHeading?: string;
  heroDescription?: string;
  heroImage?: string | null;
}

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
}

interface ContactClientProps {
  initialSettings?: ContactSettingsData | null;
  faqs?: FAQItem[];
}

const defaultFaqs: FAQItem[] = [
  {
    question: "How can I book a self-drive car with Prime Rides?",
    answer:
      "Select your pickup location and dates on our homepage or cars catalog, browse available vehicles, select your preferred daily or monthly rental package, and complete reservation with instant online verification.",
  },
  {
    question: "What documents are required to pick up the vehicle?",
    answer:
      "You need a valid Original Driving License (at least 1 year old) and a government-issued ID (Aadhaar/Passport). DigiLocker digital verification is supported at all pickup hubs.",
  },
  {
    question: "Which cities are currently served by Prime Rides?",
    answer:
      "Prime Rides operates dedicated fleet hubs in Delhi NCR, Goa, and Bangalore, offering hub pickup and doorstep delivery.",
  },
  {
    question: "Are security deposits required?",
    answer:
      "We offer Zero Security Deposit deals for verified profiles on standard hatchbacks & sedans. Minimal refundable deposits apply for premium SUVs and luxury vehicles.",
  },
  {
    question: "What is your cancellation and refund policy?",
    answer:
      "Free cancellations are allowed up to 24 hours before pickup time with a 100% full refund returned directly to your original payment method.",
  },
  {
    question: "Do you offer monthly or long-term car subscriptions?",
    answer:
      "Yes! Our monthly plans offer flexible 1 to 12-month rentals with free routine maintenance, comprehensive insurance, and zero long-term commitments.",
  },
];

export default function ContactClient({ initialSettings, faqs }: ContactClientProps) {
  const settings = initialSettings || {
    eyebrow: "WE'RE HERE TO HELP",
    heading: "Contact & Support",
    description:
      "Have a question about our cars, bookings or rental plans? Our team is here to help. Get in touch with us through any of the options below or send us a message.",
    phone: "+91 98765 43210",
    email: "support@primerides.com",
    locationsText: "Delhi · Goa · Bangalore",
    responseTimeText: "We usually respond within 24 hours",
    highlight1Title: "Quick Support",
    highlight1Desc: "We respond fast",
    highlight2Title: "Reliable Assistance",
    highlight2Desc: "Your travel partner",
    highlight3Title: "Customer First",
    highlight3Desc: "Always here for you",
  };

  const faqList = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    // Client validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError("Please enter a valid name (at least 2 characters).");
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
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 pb-20">
      {/* ------------------------------------------
          SECTION 1 — HERO / SUPPORT INTRO
      ------------------------------------------ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A1128] via-[#0F1C3F] to-slate-900 text-white pt-16 pb-24 sm:pt-20 sm:pb-28">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>{settings.eyebrow || "WE'RE HERE TO HELP"}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                {settings.heading || "Contact & Support"}{" "}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Prime Rides
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl leading-relaxed">
                {settings.description ||
                  "Have a question about our cars, bookings or rental plans? Our team is here to help. Get in touch with us through any of the options below or send us a message."}
              </p>

              {/* 3 Support Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                      {settings.highlight1Title || "Quick Support"}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {settings.highlight1Desc || "We respond fast"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                      {settings.highlight2Title || "Reliable Assistance"}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {settings.highlight2Desc || "Your travel partner"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                      {settings.highlight3Title || "Customer First"}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {settings.highlight3Desc || "Always here for you"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Automotive Visual Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md overflow-hidden group">
                <div className="absolute top-0 right-0 h-32 w-32 bg-blue-600/20 blur-3xl rounded-full" />
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Support Desk Active
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-400 font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    24/7 Rental Care
                  </span>
                </div>

                <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                  <Image
                    src="/prime-rides-logo.png"
                    alt="Prime Rides Fleet Support"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-slate-900/90 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                    <span className="font-bold flex items-center gap-1.5">
                      <Car className="h-4 w-4 text-blue-400" /> Self-Drive Support Hub
                    </span>
                    <span className="text-emerald-400 font-semibold text-[11px]">Instant Help</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 font-medium">Support Line</span>
                    <span className="font-bold text-white">{settings.phone || "+91 98765 43210"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 font-medium">Email Desk</span>
                    <span className="font-bold text-blue-400">{settings.email || "support@primerides.com"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 font-medium">Operating Hubs</span>
                    <span className="font-bold text-slate-200">{settings.locationsText || "Delhi · Goa · Bangalore"}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------
          SECTION 2 — CONTACT + ENQUIRY AREA
      ------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: GET IN TOUCH & 3 CARDS (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
              <h2 className="text-2xl font-extrabold text-[#0A1128] tracking-tight">
                Get in touch
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium">
                Contact Prime Rides for booking assistance, rental enquiries or any other information.
              </p>

              {/* 3 Premium Contact Cards */}
              <div className="mt-8 space-y-4">
                
                {/* LOCATION CARD */}
                <div className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Locations
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate">
                      {settings.locationsText || "Delhi · Goa · Bangalore"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hub pickup & doorstep delivery
                    </p>
                  </div>
                </div>

                {/* PHONE CARD */}
                <a
                  href={`tel:${(settings.phone || "").replace(/\s+/g, "")}`}
                  className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Phone
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate">
                      {settings.phone || "+91 98765 43210"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct hotline support
                    </p>
                  </div>
                  <span className="text-slate-300 group-hover:text-blue-600 transition-colors text-sm font-bold">→</span>
                </a>

                {/* EMAIL CARD */}
                <a
                  href={`mailto:${settings.email || "support@primerides.com"}`}
                  className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Email
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate">
                      {settings.email || "support@primerides.com"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Official help & support inbox
                    </p>
                  </div>
                  <span className="text-slate-300 group-hover:text-blue-600 transition-colors text-sm font-bold">→</span>
                </a>

              </div>
            </div>
          </div>

          {/* RIGHT SIDE: ENQUIRY FORM (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0A1128] tracking-tight flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-blue-600" /> Send us a message
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Fill out the details below and our rental team will contact you promptly.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold shrink-0">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  <span>{settings.responseTimeText || "We usually respond within 24 hours"}</span>
                </div>
              </div>

              {/* SUCCESS MESSAGE */}
              {success && (
                <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 animate-in fade-in-50 duration-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">Enquiry Submitted!</h3>
                    <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">{success}</p>
                  </div>
                </div>
              )}

              {/* ERROR MESSAGE */}
              {error && (
                <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 animate-in fade-in-50 duration-200">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-rose-900">Submission Error</h3>
                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* NAME & MOBILE (2 COLS ON SM+) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      required
                      maxLength={100}
                      disabled={loading}
                      className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label htmlFor="mobile" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="Enter your mobile number"
                      required
                      maxLength={20}
                      disabled={loading}
                      className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                    maxLength={150}
                    disabled={loading}
                    className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 disabled:opacity-60"
                  />
                </div>

                {/* MESSAGE */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formData.message.length}/2000
                    </span>
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    required
                    minLength={10}
                    maxLength={2000}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-50 disabled:opacity-60 resize-none"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-600/25 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-xl active:scale-[0.99] disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
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

      {/* ------------------------------------------
          SECTION 3 — FAQ SECTION
      ------------------------------------------ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-24">
        {/* HEADING */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-extrabold uppercase tracking-[0.2em]">
            QUICK HELP
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1128] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl mx-auto">
            Find quick answers to common questions or reach out to our support team.
          </p>
        </div>

        {/* ACCORDION LIST */}
        <div className="mt-10 space-y-4">
          {faqList.map((faq, index) => {
            const isOpen = openFaqIndex === index;

            return (
              <div
                key={faq.id || faq.question}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-blue-300 bg-white shadow-md ring-1 ring-blue-600/10"
                    : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-bold text-slate-900 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg text-slate-900">{faq.question}</span>

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-6 py-5 text-sm leading-relaxed text-slate-600 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
