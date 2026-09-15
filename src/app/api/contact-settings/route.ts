import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.contactSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      settings = await prisma.contactSettings.create({
        data: {
          id: "singleton",
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
          highlight1Icon: "Zap",
          highlight2Title: "Reliable Assistance",
          highlight2Desc: "Your travel partner",
          highlight2Icon: "ShieldCheck",
          highlight3Title: "Customer First",
          highlight3Desc: "Always here for you",
          highlight3Icon: "HeartHandshake",
          heroHeading: "Contact & Support",
          heroDescription:
            "Have a question about our cars, bookings or rental plans? Our team is here to help.",
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Fetch Contact Settings Error:", error);
    // Return sensible fallback defaults if database error occurs
    return NextResponse.json({
      success: true,
      settings: {
        id: "singleton",
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
        highlight1Icon: "Zap",
        highlight2Title: "Reliable Assistance",
        highlight2Desc: "Your travel partner",
        highlight2Icon: "ShieldCheck",
        highlight3Title: "Customer First",
        highlight3Desc: "Always here for you",
        highlight3Icon: "HeartHandshake",
        heroHeading: "Contact & Support",
        heroDescription:
          "Have a question about our cars, bookings or rental plans? Our team is here to help.",
      },
    });
  }
}
