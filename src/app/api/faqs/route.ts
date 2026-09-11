import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const defaultFaqs = [
  {
    question: "Who pays for the Fuel and FASTag?",
    answer:
      "Fuel costs are paid by the customer. The car is handed over with a minimum level of fuel, and you should return it with the same fuel level. FASTag is pre-fitted in all our vehicles; toll charges incurred during your trip will be deducted from your security deposit or billed at trip completion.",
    sortOrder: 1,
    isActive: true,
  },
  {
    question: "Can I modify or extend my trip after booking creation?",
    answer:
      "Yes, you can modify or extend your trip duration through your account dashboard or by calling customer support, provided the car is available for the extended timeframe.",
    sortOrder: 2,
    isActive: true,
  },
  {
    question: "How do I cancel my booking?",
    answer:
      "You can cancel your booking anytime from the 'My Bookings' section in your account. Cancellations made 24 hours prior to trip start time are eligible for a 100% full refund.",
    sortOrder: 3,
    isActive: true,
  },
  {
    question: "What is refundable security deposit and why do I pay it?",
    answer:
      "The security deposit is a temporary refundable amount held to cover unexpected tolls, extra hours, or minor damages. It is completely refunded to your original payment method within 3-7 working days after vehicle inspection.",
    sortOrder: 4,
    isActive: true,
  },
  {
    question: "What is the policy around Limited Kms in Subscription?",
    answer:
      "Monthly subscriptions include a specified monthly distance allowance (e.g. 1500 km or 3000 km). Driving beyond the plan's included limit will incur a nominal per-kilometer fee detailed in your plan terms.",
    sortOrder: 5,
    isActive: true,
  },
];

export async function GET() {
  try {
    const faqModel = (prisma as any).faq;
    let faqs = [];

    if (faqModel) {
      faqs = await faqModel.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });

      // If database has 0 FAQs, seed defaults so admin and customers have initial data
      if (faqs.length === 0) {
        await faqModel.createMany({
          data: defaultFaqs,
        });

        faqs = await faqModel.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        });
      }
    }

    if (!faqs || faqs.length === 0) {
      return NextResponse.json(defaultFaqs);
    }

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("GET public FAQs error:", error);
    return NextResponse.json(defaultFaqs);
  }
}
