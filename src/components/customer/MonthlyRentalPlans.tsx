import { Check, CalendarCheck, Sparkles } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Economy Commuter",
    vehicle: "Compact Hatchback",
    price: 24999,
    description: "Affordable, hassle-free monthly mobility designed for everyday office commutes.",
    features: [
      "2,500 km per month included",
      "Full maintenance & insurance covered",
      "Doorstep delivery & doorstep swap",
      "24/7 roadside assistance",
    ],
    popular: false,
  },
  {
    name: "Executive Comfort",
    vehicle: "Mid-size Sedan / SUV",
    price: 32999,
    description: "Superior comfort and highway performance for executive travel and long stays.",
    features: [
      "3,500 km per month included",
      "Priority maintenance & valet service",
      "Zero security deposit options",
      "24/7 dedicated support manager",
      "Flexible monthly cancellation",
    ],
    popular: true,
  },
  {
    name: "Luxury & Fleet",
    vehicle: "Executive Luxury SUV",
    price: 49999,
    description: "First-class luxury vehicles with white-glove concierge and unlimited flexibility.",
    features: [
      "Unlimited monthly kilometers",
      "Comprehensive zero-dep coverage",
      "VIP airport pickup concierge",
      "Instant vehicle swap anytime",
    ],
    popular: false,
  },
];

export default function MonthlyRentalPlans() {
  return (
    <section id="monthly-plans" className="bg-slate-900 px-4 py-24 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-950/60 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
            <CalendarCheck className="h-3.5 w-3.5 text-blue-400" />
            <span>Long Term Mobility</span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Monthly Subscription Plans
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300">
            Enjoy your own car without down payments, EMI lock-ins, or maintenance hassles. Scale or pause anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">

          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? "bg-slate-950 border-2 border-blue-500 shadow-2xl shadow-blue-500/20"
                  : "bg-slate-950/70 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Most Popular</span>
                  </span>
                </div>
              )}

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  {plan.vehicle}
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  {plan.name}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {plan.description}
                </p>

                <div className="my-6 border-b border-slate-800/80 pb-6">
                  <span className="text-4xl font-black text-white">
                    ₹{plan.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-semibold text-slate-400"> / month</span>
                </div>

                {/* Feature checklist */}
                <ul className="space-y-3.5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-slate-300">
                      <div className="rounded-full bg-blue-600/20 p-1 text-blue-400 shrink-0">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href="/cars?type=monthly"
                  className={`flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold transition-all shadow-md ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/30"
                      : "bg-slate-800 text-white hover:bg-slate-700"
                  }`}
                >
                  Select Subscription Plan
                </Link>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}