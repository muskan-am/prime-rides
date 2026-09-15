import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      eyebrow,
      heading,
      description,
      phone,
      email,
      locationsText,
      responseTimeText,
      highlight1Title,
      highlight1Desc,
      highlight1Icon,
      highlight2Title,
      highlight2Desc,
      highlight2Icon,
      highlight3Title,
      highlight3Desc,
      highlight3Icon,
      heroHeading,
      heroDescription,
      heroImage,
    } = body;

    const settings = await prisma.contactSettings.upsert({
      where: { id: "singleton" },
      update: {
        eyebrow: eyebrow ?? undefined,
        heading: heading ?? undefined,
        description: description ?? undefined,
        phone: phone ?? undefined,
        email: email ?? undefined,
        locationsText: locationsText ?? undefined,
        responseTimeText: responseTimeText ?? undefined,
        highlight1Title: highlight1Title ?? undefined,
        highlight1Desc: highlight1Desc ?? undefined,
        highlight1Icon: highlight1Icon ?? undefined,
        highlight2Title: highlight2Title ?? undefined,
        highlight2Desc: highlight2Desc ?? undefined,
        highlight2Icon: highlight2Icon ?? undefined,
        highlight3Title: highlight3Title ?? undefined,
        highlight3Desc: highlight3Desc ?? undefined,
        highlight3Icon: highlight3Icon ?? undefined,
        heroHeading: heroHeading ?? undefined,
        heroDescription: heroDescription ?? undefined,
        heroImage: heroImage ?? undefined,
      },
      create: {
        id: "singleton",
        eyebrow: eyebrow || "WE'RE HERE TO HELP",
        heading: heading || "Contact & Support",
        description:
          description ||
          "Have a question about our cars, bookings or rental plans? Our team is here to help. Get in touch with us through any of the options below or send us a message.",
        phone: phone || "+91 98765 43210",
        email: email || "support@primerides.com",
        locationsText: locationsText || "Delhi · Goa · Bangalore",
        responseTimeText: responseTimeText || "We usually respond within 24 hours",
        highlight1Title: highlight1Title || "Quick Support",
        highlight1Desc: highlight1Desc || "We respond fast",
        highlight1Icon: highlight1Icon || "Zap",
        highlight2Title: highlight2Title || "Reliable Assistance",
        highlight2Desc: highlight2Desc || "Your travel partner",
        highlight2Icon: highlight2Icon || "ShieldCheck",
        highlight3Title: highlight3Title || "Customer First",
        highlight3Desc: highlight3Desc || "Always here for you",
        highlight3Icon: highlight3Icon || "HeartHandshake",
        heroHeading: heroHeading || "Contact & Support",
        heroDescription:
          heroDescription ||
          "Have a question about our cars, bookings or rental plans? Our team is here to help.",
        heroImage: heroImage || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contact settings saved successfully",
      settings,
    });
  } catch (error) {
    console.error("Update Contact Settings Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update contact settings" },
      { status: 500 }
    );
  }
}
