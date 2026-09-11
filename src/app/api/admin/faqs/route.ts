import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
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
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const faqModel = (prisma as any).faq;
    let faqs = await faqModel.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    if (faqs.length === 0) {
      await faqModel.createMany({
        data: defaultFaqs,
      });

      faqs = await faqModel.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
    }

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("GET admin FAQs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { question, answer, sortOrder, isActive } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and Answer are required" },
        { status: 400 }
      );
    }

    const faqModel = (prisma as any).faq;
    const newFaq = await faqModel.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return NextResponse.json(newFaq, { status: 201 });
  } catch (error) {
    console.error("POST admin FAQ error:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
