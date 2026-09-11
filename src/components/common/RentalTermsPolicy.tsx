"use client";

import React from "react";
import {
  UserCheck,
  CreditCard,
  Lock,
  Car,
  Clock,
  AlertTriangle,
  Fuel,
  ShieldAlert,
  FileText,
  CheckCircle2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface RentalTermsPolicyProps {
  termsText?: string | null;
  title?: string;
  subtitle?: string;
  className?: string;
}

interface ParsedSection {
  id: string;
  num?: string;
  title: string;
  points: string[];
  icon: LucideIcon;
  accentColor: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconText: string;
  };
}

const UNIFORM_NEUTRAL_COLOR = {
  bg: "bg-slate-50/80",
  text: "text-slate-900",
  border: "border-slate-200",
  badgeBg: "bg-slate-900",
  badgeText: "text-white",
  iconBg: "bg-slate-200/90",
  iconText: "text-slate-800",
};

const ICON_MAP: Array<{
  keywords: string[];
  icon: LucideIcon;
}> = [
  {
    keywords: ["eligibility", "age", "licence", "license", "id", "renter"],
    icon: UserCheck,
  },
  {
    keywords: ["booking", "payment", "price", "charge", "refund", "amount"],
    icon: CreditCard,
  },
  {
    keywords: ["security", "deposit", "deduction"],
    icon: Lock,
  },
  {
    keywords: ["pickup", "handover", "location", "inspection", "vehicle pickup"],
    icon: Car,
  },
  {
    keywords: ["period", "duration", "time", "late", "extension", "rental period"],
    icon: Clock,
  },
  {
    keywords: ["usage", "law", "speed", "racing", "traffic", "prohibited", "vehicle usage"],
    icon: AlertTriangle,
  },
  {
    keywords: ["fuel", "petrol", "diesel"],
    icon: Fuel,
  },
  {
    keywords: ["damage", "responsibility", "negligence", "accident", "insurance"],
    icon: ShieldAlert,
  },
];

export function parseTermsText(text: string): ParsedSection[] {
  if (!text || !text.trim()) return [];

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;

  for (const line of lines) {
    const headerMatch = line.match(/^(\d+)[\.\)\-]\s*(.+)$/i);

    if (headerMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }

      const num = headerMatch[1];
      const title = headerMatch[2];
      const lowerTitle = title.toLowerCase();

      let matchedIcon = FileText;

      for (const item of ICON_MAP) {
        if (item.keywords.some((kw) => lowerTitle.includes(kw))) {
          matchedIcon = item.icon;
          break;
        }
      }

      currentSection = {
        id: `section-${num}`,
        num,
        title,
        points: [],
        icon: matchedIcon,
        accentColor: UNIFORM_NEUTRAL_COLOR,
      };
    } else if (currentSection) {
      currentSection.points.push(line);
    } else {
      const lowerLine = line.toLowerCase();
      let matchedIcon = FileText;

      for (const item of ICON_MAP) {
        if (item.keywords.some((kw) => lowerLine.includes(kw))) {
          matchedIcon = item.icon;
          break;
        }
      }

      currentSection = {
        id: `section-${sections.length + 1}`,
        num: `${sections.length + 1}`,
        title: line,
        points: [],
        icon: matchedIcon,
        accentColor: UNIFORM_NEUTRAL_COLOR,
      };
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

export default function RentalTermsPolicy({
  termsText,
  title = "RENTAL TERMS & POLICIES",
  subtitle = "Please review the key terms, conditions, and vehicle handling policies before booking.",
  className = "",
}: RentalTermsPolicyProps) {
  const defaultTermsFallback = `1. Eligibility
The renter must be at least 21 years old. A valid driving licence and government-issued ID are required at vehicle pickup.

2. Booking & Payment
Bookings are confirmed upon successful payment. Total charges include rent, applicable taxes, and pickup/delivery options.

3. Security Deposit
Refundable security deposit is required prior to handover and will be processed back post vehicle inspection.

4. Vehicle Pickup & Handover
Collect the vehicle from the designated location. Inspect and report any existing condition prior to trip start.

5. Rental Period
Rental times follow the confirmed booking schedule. Late returns without prior authorization incur standard extra hour charges.

6. Vehicle Usage
Vehicle must be driven responsibly for lawful purposes. Speed limits and traffic regulations must be strictly obeyed.

7. Fuel Policy
Return vehicle with the same fuel level as received to avoid fuel service charges.

8. Damage & Responsibility
Renter is responsible for negligent damage, traffic violations, or unauthorized driver operation during the trip.`;

  const textToParse = termsText && termsText.trim() ? termsText : defaultTermsFallback;
  const sections = parseTermsText(textToParse);

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs ${className}`}>
      {/* Header Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-slate-700" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              {title}
            </h3>
          </div>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
          Prime Rides Guidelines
        </span>
      </div>

      {/* Neutral Grid Layout of Policy Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((sec) => {
          const IconComponent = sec.icon;
          return (
            <div
              key={sec.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:bg-white hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Card Header: Badge Number & Section Title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    {sec.num ? (
                      <span className="font-extrabold">{sec.num}</span>
                    ) : (
                      <IconComponent className="h-4 w-4 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-extrabold tracking-tight text-slate-900">
                      {sec.title}
                    </h4>
                  </div>
                </div>

                {/* Card Body: Points */}
                {sec.points.length > 0 ? (
                  <ul className="space-y-2 mt-2">
                    {sec.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Standard terms apply for this category.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
