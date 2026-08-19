import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Economy",
    vehicle: "Hatchback",
    price: 24999,
    description: "Affordable monthly mobility for everyday travel.",
    features: [
      "Unlimited city usage",
      "Basic maintenance included",
      "24/7 customer support",
    ],
  },
  {
    name: "Comfort",
    vehicle: "Sedan",
    price: 32999,
    description: "A comfortable monthly rental for work and travel.",
    features: [
      "Unlimited city usage",
      "Maintenance included",
      "24/7 customer support",
    ],
  },
  {
    name: "Premium",
    vehicle: "SUV",
    price: 44999,
    description: "Premium SUV experience for longer-term requirements.",
    features: [
      "Unlimited city usage",
      "Premium maintenance support",
      "Priority customer support",
    ],
  },
];

export default function MonthlyRentalPlans() {
  return (
    <section className="border-t bg-muted/20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Monthly Rentals
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Monthly Rental Plans
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Need a car for a longer period? Choose a monthly plan
            that fits your requirements.
          </p>
        </div>

        {/* Plans */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">

          {plans.map((plan) => (
            <div
              key={plan.name}
              className="flex h-full flex-col rounded-2xl border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Plan Header */}
              <div>
                <p className="text-sm text-muted-foreground">
                  {plan.vehicle}
                </p>

                <h3 className="mt-2 text-2xl font-semibold">
                  {plan.name}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mt-6">
                <span className="text-3xl font-bold">
                  ₹{plan.price.toLocaleString("en-IN")}
                </span>

                <span className="ml-1 text-sm text-muted-foreground">
                  / month
                </span>
              </div>

              {/* Features */}
              <div className="mt-6 flex-1 border-t pt-6">
                <p className="text-sm font-medium">
                  Plan includes:
                </p>

                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Button */}
              <Link href="/monthly-rentals">
                <Button className="mt-6 w-full">
                  View Plan
                </Button>
              </Link>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}