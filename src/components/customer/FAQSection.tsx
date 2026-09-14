"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How can I book a self-drive car with Prime Rides?",
    answer:
      "Select your pickup location and dates on our homepage, browse available vehicles, choose your preferred daily or monthly package, and complete the reservation with instant verification.",
  },
  {
    question: "What documents are required to pick up the car?",
    answer:
      "You need a valid Original Driving License (min 1 year old) and a government-issued ID (Aadhaar/Passport). Digilocker digital verification is supported at hub pickup.",
  },
  {
    question: "Which cities are currently covered by Prime Rides?",
    answer:
      "Prime Rides operates dedicated fleet hubs in Delhi NCR, Goa, and Bangalore, offering airport pickup and doorstep delivery.",
  },
  {
    question: "Are security deposits required?",
    answer:
      "We offer Zero Security Deposit deals for verified profile holders on standard hatchbacks & sedans. Minimal refundable deposits apply for premium SUVs and luxury vehicles.",
  },
  {
    question: "What is your cancellation and modification policy?",
    answer:
      "Free cancellations are allowed up to 24 hours before pickup time with a 100% full refund to your original payment method.",
  },
  {
    question: "Do you offer monthly car subscriptions?",
    answer:
      "Yes! Our monthly plans offer flexible 1 to 12-month rentals with free maintenance, comprehensive insurance, and zero long-term commitments.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            GOT QUESTIONS?
          </p>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1128]">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-500 font-medium pt-1">
            Everything you need to know about Prime Rides self-drive booking, documents, deposits, and delivery.
          </p>
        </div>

        {/* FAQ List */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-blue-300 bg-slate-50/80 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-bold text-slate-900 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>

                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200/80 px-6 py-5 text-sm leading-relaxed text-slate-600 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}