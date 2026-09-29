"use client";

import { useState } from "react";
import {
  Car,
  Headphones,
  MapPinned,
  ShieldCheck,
  Gauge,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Check,
} from "lucide-react";

const benefits = [
  {
    icon: Car,
    title: "Verified Fleet",
    fullTitle: "Sanitized & Verified Fleet",
    subtitle: "35-Point Inspection",
    badge: "100% Sanitized",
    description:
      "Every car undergoes 35+ mechanical inspections and complete sanitization before key handover.",
    perks: ["35+ checkpoint check", "Deep interior & AC sanitization", "GPS & Fastag pre-installed"],
  },
  {
    icon: MapPinned,
    title: "Hub & Airport Delivery",
    fullTitle: "Flexible Airport & Hub Pickups",
    subtitle: "Fast Handover",
    badge: "Terminal Pickup",
    description:
      "Collect directly from Delhi NCR, Goa, Bangalore airport terminals or get doorstep drop-off.",
    perks: ["Direct terminal curbside handover", "Zero waiting at counters", "Doorstep drop & pickup"],
  },
  {
    icon: ShieldCheck,
    title: "Zero Hidden Fees",
    fullTitle: "Transparent & Zero Hidden Fees",
    subtitle: "Fair Upfront Pricing",
    badge: "100% Upfront",
    description:
      "What you see is what you pay. Dynamic taxes, insurance, and delivery charges calculated transparently.",
    perks: ["No surprise checkout charges", "Instant refundable security deposit", "Clear insurance policies"],
  },
  {
    icon: Gauge,
    title: "Unlimited KMs",
    fullTitle: "Unlimited KMs & Flexible Plans",
    subtitle: "No Limits Drive",
    badge: "Zero Restrictions",
    description:
      "Drive freely with unlimited kilometers on select rentals and seamless interstate travel support.",
    perks: ["Unlimited mileage packages", "Interstate state tax assist", "Flexible hourly & daily rates"],
  },
  {
    icon: Headphones,
    title: "24/7 Roadside Help",
    fullTitle: "24/7 Roadside Assistance",
    subtitle: "Instant Replacement",
    badge: "Always Covered",
    description:
      "Round-the-clock roadside emergency support and rapid on-road replacement vehicle anywhere.",
    perks: ["Immediate breakdown replacement", "Pan-India towing network", "24/7 priority support line"],
  },
];

export default function WhyChooseUs() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="why-us" className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50 px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[350px] w-[650px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/90 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-600 shadow-xs">
            {/* <Sparkles className="h-3.5 w-3.5 text-blue-600" /> */}
            Why Choose Us
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0A1128]">
            Why Drive With Prime Rides?
          </h2>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-600 font-medium pt-0.5 leading-relaxed">
            We eliminate traditional rental hassles with digital verification, zero paperwork delays, and transparent pricing.
          </p>
        </div>

        {/* Responsive Cards: Responsive grid on mobile/tablet, BoxStack flex row on desktop */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-stretch gap-3.5 lg:gap-3 w-full">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const isHovered = hoveredIndex === index;
            const isAnyHovered = hoveredIndex !== null;
            const isLastCardOnTablet = index === benefits.length - 1;

            return (
              <div
                key={benefit.title}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                tabIndex={0}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 sm:p-6 text-center outline-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer select-none lg:min-h-[300px] ${
                  isLastCardOnTablet ? "sm:col-span-2 sm:max-w-md sm:mx-auto lg:col-auto lg:max-w-none lg:mx-0 w-full" : ""
                } ${
                  isHovered
                    ? "lg:flex-[2.8] bg-gradient-to-br from-blue-50/95 via-white to-blue-50/50 border-blue-400 shadow-xl shadow-blue-500/12 lg:-translate-y-1.5 ring-2 ring-blue-400/30"
                    : isAnyHovered
                    ? "lg:flex-[0.8] bg-white/90 border-blue-100/60 shadow-xs opacity-85 hover:opacity-100"
                    : "lg:flex-1 bg-gradient-to-b from-white to-blue-50/35 border-blue-100/80 shadow-xs hover:border-blue-300 hover:shadow-md hover:bg-white"
                }`}
              >
                {/* Subtle radial blue background glow */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-radial from-blue-500/10 via-transparent to-transparent transition-opacity duration-500 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Top Section: Centered Icon & Badge */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex h-13 w-13 sm:h-14 sm:w-14 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 ${
                      isHovered
                        ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/30 lg:scale-110"
                        : "bg-blue-50/90 border-blue-100/80 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-md"
                    }`}
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 transition-transform duration-500 group-hover:scale-105" />
                  </div>

                  {/* Badge */}
                  <div
                    className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 transition-all duration-500 ${
                      isHovered
                        ? "opacity-100 translate-y-0 scale-100"
                        : "lg:opacity-0 lg:-translate-y-1.5 lg:scale-95 lg:pointer-events-none lg:hidden"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3 text-blue-600" />
                    <span>{benefit.badge}</span>
                  </div>
                </div>

                {/* Content Section: Title, Description & Highlights */}
                <div className="relative z-10 mt-4 sm:mt-5 flex flex-col justify-end space-y-2">
                  <h3
                    className={`text-base sm:text-lg font-bold text-[#0A1128] transition-colors duration-300 leading-snug ${
                      isHovered ? "text-blue-900 font-extrabold lg:text-lg" : ""
                    }`}
                  >
                    <span className="lg:hidden">{benefit.fullTitle}</span>
                    <span className="hidden lg:inline">{isHovered ? benefit.fullTitle : benefit.title}</span>
                  </h3>

                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 transition-all duration-300 px-1">
                    {benefit.description}
                  </p>

                  {/* Highlights List */}
                  <div
                    className={`pt-2 space-y-1.5 transition-all duration-500 ${
                      isHovered
                        ? "opacity-100 max-h-48 translate-y-0 mt-2 text-left"
                        : "hidden lg:block lg:opacity-0 lg:max-h-0 lg:pointer-events-none lg:overflow-hidden"
                    }`}
                  >
                    <div className="border-t border-blue-100/90 pt-2 grid gap-1 text-left">
                      {benefit.perks.map((perk) => (
                        <div
                          key={perk}
                          className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-blue-50/60 rounded-lg py-1 px-2.5 border border-blue-100/60"
                        >
                          <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                            <Check className="h-2 w-2" />
                          </div>
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center justify-center gap-1 text-xs font-bold text-blue-600">
                      <span>Prime Assured Benefit</span>
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}