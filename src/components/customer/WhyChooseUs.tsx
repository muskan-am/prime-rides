import {
  Car,
  Headphones,
  MapPinned,
  ShieldCheck,
} from "lucide-react";

const benefits = [
  {
    icon: Car,
    title: "Wide Car Selection",
    description:
      "Choose from a growing range of well-maintained self-drive cars for different travel needs.",
  },
  {
    icon: MapPinned,
    title: "Multiple Locations",
    description:
      "Pick up your car from convenient locations across Delhi, Goa and Bangalore.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Booking",
    description:
      "Enjoy a simple and secure booking experience with trusted online payments.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "Our team is available to help you with bookings, enquiries and rental assistance.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="border-t bg-muted/20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Why Prime Rides
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose Prime Rides?
          </h2>

          <p className="mt-3 text-muted-foreground">
            Everything you need for a convenient, reliable and
            hassle-free self-drive rental experience.
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="rounded-2xl border bg-background p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-lg font-semibold">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
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