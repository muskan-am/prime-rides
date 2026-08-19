"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitted(true);
  };

  return (
    <section className="border-t px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Contact Us
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Let&apos;s Talk
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Have a question about our cars, bookings or rental plans?
            Our team is here to help.
          </p>
        </div>

        {/* Content */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">

          {/* Contact Information */}
          <div className="rounded-2xl border p-8">

            <h3 className="text-2xl font-semibold">
              Get in touch
            </h3>

            <p className="mt-3 leading-7 text-muted-foreground">
              Contact Prime Rides for booking assistance, rental
              enquiries or any other information.
            </p>

            <div className="mt-8 space-y-6">

              {/* Location */}
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h4 className="font-medium">Locations</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Delhi · Goa · Bangalore
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Phone className="h-5 w-5" />
                </div>

                <div>
                  <h4 className="font-medium">Phone</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    +91 XXXXX XXXXX
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Mail className="h-5 w-5" />
                </div>

                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    support@primerides.com
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border p-8">

            <h3 className="text-2xl font-semibold">
              Send us a message
            </h3>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  required
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Mobile */}
              <div>
                <label
                  htmlFor="mobile"
                  className="mb-2 block text-sm font-medium"
                >
                  Mobile Number
                </label>

                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  required
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="How can we help you?"
                  required
                  className="w-full resize-none rounded-lg border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
              >
                Send Enquiry
              </Button>

              {submitted && (
                <p className="text-center text-sm text-muted-foreground">
                  Thank you! Your enquiry has been received.
                </p>
              )}

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}