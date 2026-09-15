import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ContactClient from "@/components/customer/ContactClient";

export const metadata: Metadata = {
  title: "Contact Prime Rides | Car Rental Support",
  description:
    "Contact Prime Rides for car rental bookings, support, rental plans and customer assistance.",
};

export default async function ContactPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let settings: any = null;
  let faqs: { id: string; question: string; answer: string }[] = [];

  try {
    settings = await prisma.contactSettings.findUnique({
      where: { id: "singleton" },
    });
  } catch (err) {
    console.error("ContactPage fetch settings error:", err);
  }

  try {
    faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, question: true, answer: true },
    });
  } catch (err) {
    console.error("ContactPage fetch faqs error:", err);
  }

  return <ContactClient initialSettings={settings} faqs={faqs} />;
}
