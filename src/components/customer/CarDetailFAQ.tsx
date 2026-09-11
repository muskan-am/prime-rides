"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
}

const defaultCarFaqs: FAQItem[] = [
  {
    question: "Who pays for the Fuel and FASTag?",
    answer:
      "Fuel costs are paid by the customer. The car is handed over with a minimum level of fuel, and you should return it with the same fuel level. FASTag is pre-fitted in all our vehicles; toll charges incurred during your trip will be deducted from your security deposit or billed at trip completion.",
  },
  {
    question: "Can I modify or extend my trip after booking creation?",
    answer:
      "Yes, you can modify or extend your trip duration through your account dashboard or by calling customer support, provided the car is available for the extended timeframe.",
  },
  {
    question: "How do I cancel my booking?",
    answer:
      "You can cancel your booking anytime from the 'My Bookings' section in your account. Cancellations made 24 hours prior to trip start time are eligible for a 100% full refund.",
  },
  {
    question: "What is refundable security deposit and why do I pay it?",
    answer:
      "The security deposit is a temporary refundable amount held to cover unexpected tolls, extra hours, or minor damages. It is completely refunded to your original payment method within 3-7 working days after vehicle inspection.",
  },
  {
    question: "What is the policy around Limited Kms in Subscription?",
    answer:
      "Monthly subscriptions include a specified monthly distance allowance (e.g. 1500 km or 3000 km). Driving beyond the plan's included limit will incur a nominal per-kilometer fee detailed in your plan terms.",
  },
];

export default function CarDetailFAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>(defaultCarFaqs);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await fetch("/api/faqs");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setFaqs(data);
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic FAQs:", err);
      }
    }
    loadFaqs();
  }, []);

  const toggleItem = (index: number) => {
    if (allOpen) setAllOpen(false);
    setOpenIndex(openIndex === index ? null : index);
  };

  const toggleAll = () => {
    setAllOpen(!allOpen);
    setOpenIndex(null);
  };

  return (
    <section className="mt-14 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          FAQs
        </h2>
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
        >
          {allOpen ? "Collapse all" : "View all"}
          <span className="ml-1 text-xs">›</span>
        </button>
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5">
        {faqs.map((faq, index) => {
          const isOpen = allOpen || openIndex === index;

          return (
            <div
              key={faq.id || index}
              className="overflow-hidden rounded-xl border border-slate-200/90 bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm sm:text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50/60 cursor-pointer"
              >
                <span className="pr-4 leading-snug">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-600 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-emerald-600" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-5 py-4 text-xs sm:text-sm leading-relaxed text-slate-600 bg-slate-50/40">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
