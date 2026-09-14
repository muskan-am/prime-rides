import {
  Car,
  Headphones,
  MapPinned,
  ShieldCheck,
  Award,
  Sparkles
} from "lucide-react";

const benefits = [
  {
    icon: Car,
    title: "Sanitized & Verified Fleet",
    description: "Every car undergoes 35+ mechanical inspections and thorough deep sanitization before key handover.",
  },
  {
    icon: MapPinned,
    title: "Flexible Airport & Hub Pickups",
    description: "Collect your car directly from Delhi NCR, Goa, or Bangalore airports or schedule doorstep delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent & Zero Hidden Fees",
    description: "What you see is what you pay. Dynamic taxes, insurance, and delivery charges are calculated upfront.",
  },
  {
    icon: Headphones,
    title: "24/7 Roadside Assistance",
    description: "Dedicated assistance hotline and instant breakdown replacement support anytime, anywhere.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            WHY CHOOSE US
          </p>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A1128]">
            Why Drive With Prime Rides?
          </h2>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-500 font-medium pt-1">
            We eliminate traditional rental hassles with digital verification, zero paperwork delays, and transparent pricing.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="group rounded-3xl border border-slate-200/80 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-blue-300"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-slate-900 group-hover:text-blue-400">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="mt-6 text-xl font-extrabold text-slate-900">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}