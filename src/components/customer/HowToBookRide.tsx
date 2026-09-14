import Link from "next/link";
import { MapPin, Car, CalendarDays, KeyRound, ArrowRight } from "lucide-react";

export default function HowToBookRide() {
  const steps = [
    {
      number: "01",
      title: "Choose Your Location",
      description:
        "Select your pickup location and return location from our available hubs.",
      icon: MapPin,
    },
    {
      number: "02",
      title: "Select Your Car",
      description:
        "Browse available cars and choose the vehicle that fits your journey.",
      icon: Car,
    },
    {
      number: "03",
      title: "Choose Dates & Package",
      description:
        "Select your rental dates and choose the package that works best for you.",
      icon: CalendarDays,
    },
    {
      number: "04",
      title: "Book & Hit the Road",
      description:
        "Complete your booking, make the secure payment, and get ready to drive.",
      icon: KeyRound,
    },
  ];

  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            HOW IT WORKS
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A1128] tracking-tight">
            How to Book a Ride?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium pt-1">
            Book your perfect self-drive car in just four simple steps.
          </p>
        </div>

        {/* Steps Timeline Grid */}
        <div className="relative">
          {/* Connecting Line - Desktop Only */}
          <div
            className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] h-[2px] bg-slate-200 z-0 pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => {
              const IconComponent = step.icon;

              return (
                <div
                  key={step.number}
                  className="group relative flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-slate-50/70 border border-slate-200/70 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:border-blue-200 hover:-translate-y-1"
                >
                  {/* Number Badge with Icon Overlay */}
                  <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-full border-2 border-slate-200 bg-white text-[#0A1128] font-black text-lg flex items-center justify-center shadow-md transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-110">
                      {step.number}
                    </div>

                    {/* Icon Badge */}
                    <div className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:bg-[#0A1128] group-hover:text-white group-hover:border-slate-800">
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2.5 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    {step.description}
                  </p>

                  {/* Vertical separator accent for mobile view */}
                  {idx < steps.length - 1 && (
                    <div
                      className="lg:hidden block h-6 w-[2px] bg-slate-200 my-4 mx-auto"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-14 text-center">
          <Link
            href="/cars"
            className="inline-flex h-13 items-center gap-2.5 rounded-2xl bg-blue-600 px-8 text-sm font-extrabold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/50 hover:scale-[1.02]"
          >
            <span>Start Booking</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
