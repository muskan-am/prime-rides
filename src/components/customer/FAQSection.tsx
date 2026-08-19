"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How can I book a self-drive car?",
    answer:
      "Select your pickup and return locations, choose your rental dates and times, select an available car and rental package, then complete the payment to confirm your booking.",
  },
  {
    question: "Which cities are currently available?",
    answer:
      "Prime Rides is initially available in Delhi, Goa and Bangalore. More locations can be added in the future.",
  },
  {
    question: "Can I choose doorstep delivery?",
    answer:
      "Yes. Where doorstep delivery is available, you can select it during the booking process. Delivery charges may vary by location.",
  },
  {
    question: "How do I pay for my booking?",
    answer:
      "Online payments are processed securely through Razorpay. Your booking is confirmed after the payment is successfully verified.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes, bookings can be cancelled according to the applicable Prime Rides cancellation and refund policy.",
  },
  {
    question: "Do you offer monthly rentals?",
    answer:
      "Yes. Prime Rides provides monthly rental plans with different vehicle categories and pricing options.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="border-t px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Heading */}
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            FAQs
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Find answers to common questions about Prime Rides
            self-drive rentals.
          </p>
        </div>

        {/* FAQ List */}
        <div className="mt-10 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border bg-background"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-medium transition-colors hover:bg-muted/50"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t px-5 py-5 text-sm leading-6 text-muted-foreground">
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