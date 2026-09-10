import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, Calendar, ShieldCheck, Clock, MapPin, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import LogoutButton from "@/components/auth/LogoutButton";
import PayNowButton from "@/components/booking/PayNowButton";
import { prisma } from "@/lib/prisma";

type DashboardPageProps = {
  searchParams?: Promise<{
    booking?: string;
    payment?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions);
  const search = searchParams ? await searchParams : {};

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user.email
    ? await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
        select: {
          id: true,
        },
      })
    : null;

  const bookings = user
    ? await prisma.booking.findMany({
        where: {
          userId: user.id,
        },
        include: {
          vehicle: {
            select: {
              id: true,
              brand: true,
              model: true,
              variant: true,
              primaryImage: true,
            },
          },
          rentalPackage: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
          monthlyPlan: {
            select: {
              id: true,
              name: true,
              months: true,
              price: true,
            },
          },
          pickupOption: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  const activeCount = bookings.filter(b => b.status === "CONFIRMED" || b.status === "PENDING").length;
  const completedCount = bookings.filter(b => b.status === "COMPLETED").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pb-24">
        {/* Banner Header */}
        <section className="bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Customer Portal</p>
              <h1 className="text-3xl font-black text-white mt-1">
                Welcome, {session.user.name || "Valued Customer"}
              </h1>
              <p className="text-xs text-slate-400 mt-1">{session.user.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/cars"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-500"
              >
                <Car className="h-4 w-4" />
                <span>Book New Car</span>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 space-y-10">

          {/* Payment Success Alert */}
          {search.payment === "success" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Payment Successful & Booking Confirmed!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Your Razorpay payment was verified. Your booking is now CONFIRMED.
                </p>
              </div>
            </div>
          )}

          {/* Metric Stats Overview */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bookings</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{bookings.length}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active / Pending</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{activeCount}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Rentals</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{completedCount}</p>
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">Your Vehicle Rentals</h2>
                <p className="text-xs text-slate-500 mt-1">Track booking history, pickup dates, and pricing details</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700">
                {bookings.length} {bookings.length === 1 ? "Booking" : "Bookings"}
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center my-6">
                <Car className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                <p className="text-base font-bold text-slate-800">No active car bookings found.</p>
                <p className="text-xs text-slate-500 mt-1">Your upcoming self-drive rentals will be listed here after booking.</p>
                <Link
                  href="/cars"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-600"
                >
                  Explore Cars Catalog →
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => {
                  const rentalAmount = Number(booking.rentalAmount);
                  const taxAmount = Number(booking.taxAmount);
                  const taxRate = rentalAmount > 0 ? (taxAmount / rentalAmount) * 100 : 0;
                  const formattedTaxRate = Number.isInteger(taxRate) ? taxRate.toString() : taxRate.toFixed(2);

                  return (
                    <div
                      key={booking.id}
                      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:border-blue-300"
                    >
                      {/* Booking Bar Header */}
                      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-950 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Booking ID</p>
                          <p className="mt-0.5 font-mono text-sm font-bold text-white">{booking.id}</p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3.5 py-1 text-xs font-black tracking-wide uppercase ${
                            booking.status === "CONFIRMED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : booking.status === "CANCELLED"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : booking.status === "COMPLETED"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="grid gap-6 md:grid-cols-[180px_1fr] items-center">
                          <div className="h-32 overflow-hidden rounded-2xl bg-slate-900">
                            {booking.vehicle.primaryImage ? (
                              <img
                                src={booking.vehicle.primaryImage}
                                alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-slate-400">No Image</div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{booking.vehicle.brand}</p>
                            <h3 className="text-xl font-bold text-slate-900">{booking.vehicle.model} {booking.vehicle.variant}</h3>
                            <p className="text-xs font-semibold text-slate-500">
                              Mode: {booking.rentalPackage ? booking.rentalPackage.name : booking.monthlyPlan ? booking.monthlyPlan.name : "Self-Drive Days"}
                            </p>
                          </div>
                        </div>

                        {/* Dates & Location Matrix */}
                        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4 text-xs">
                          <div>
                            <p className="text-slate-500 font-semibold">Start Date</p>
                            <p className="mt-1 font-bold text-slate-900">{new Date(booking.startDate).toLocaleString("en-IN")}</p>
                          </div>

                          <div>
                            <p className="text-slate-500 font-semibold">End Date</p>
                            <p className="mt-1 font-bold text-slate-900">{new Date(booking.endDate).toLocaleString("en-IN")}</p>
                          </div>

                          <div>
                            <p className="text-slate-500 font-semibold">Pickup Location</p>
                            <p className="mt-1 font-bold text-slate-900">{booking.location.name}</p>
                          </div>

                          <div>
                            <p className="text-slate-500 font-semibold">Pickup Option</p>
                            <p className="mt-1 font-bold text-slate-900">{booking.pickupOption?.name || "Standard Hub Pickup"}</p>
                          </div>
                        </div>

                        {/* Financial summary */}
                        <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                          <div>
                            <span className="text-slate-500">Rental Amount: </span>
                            <span className="font-bold text-slate-800">₹{rentalAmount.toLocaleString("en-IN")}</span>
                            <span className="text-slate-400 mx-2">|</span>
                            <span className="text-slate-500">Tax ({formattedTaxRate}%): </span>
                            <span className="font-bold text-slate-800">₹{taxAmount.toLocaleString("en-IN")}</span>
                            {booking.paymentStatus && (
                              <>
                                <span className="text-slate-400 mx-2">|</span>
                                <span className="text-slate-500">Payment: </span>
                                <span className={`font-bold ${booking.paymentStatus === "SUCCESS" ? "text-emerald-600" : "text-amber-600"}`}>
                                  {booking.paymentStatus === "SUCCESS" ? "PAID" : booking.paymentStatus}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-slate-500">Total Amount: </span>
                              <span className="text-base font-black text-slate-900">₹{Number(booking.totalAmount).toLocaleString("en-IN")}</span>
                            </div>

                            {(booking.status === "PENDING" || booking.paymentStatus !== "SUCCESS") && (
                              <PayNowButton
                                bookingId={booking.id}
                                totalAmount={Number(booking.totalAmount)}
                                vehicleBrand={booking.vehicle.brand}
                                vehicleModel={booking.vehicle.model}
                                userName={session.user.name || undefined}
                                userEmail={session.user.email || undefined}
                              />
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}