"use client";

import ContactSection, { ContactSettingsData } from "./ContactSection";
import FAQSection from "./FAQSection";

interface ContactClientProps {
  initialSettings?: ContactSettingsData | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  faqs?: any[];
}

export default function ContactClient({ initialSettings }: ContactClientProps) {
  return (
    <div className="bg-slate-50 min-h-screen">
      <ContactSection initialSettings={initialSettings} variant="page" />
      <FAQSection />
    </div>
  );
}
