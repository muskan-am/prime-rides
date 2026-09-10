import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import BookingForm from "@/components/booking/BookingForm";

type PageProps = {
  params: Promise<{
    vehicleId: string;
  }>;
  searchParams?: Promise<{
    location?: string;
    startDate?: string;
    endDate?: string;
    rentalPackageId?: string;
    monthlyPlanId?: string;
    packageId?: string;
    type?: string;
  }>;
};

export default async function BookingPage({
  params,
  searchParams,
}: PageProps) {
  /* =========================================
     Authentication
  ========================================= */

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  /* =========================================
     Get Parameters & Search Context
  ========================================= */

  const { vehicleId } = await params;
  const search = searchParams ? await searchParams : {};

  /* =========================================
     Get Vehicle
  ========================================= */

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: vehicleId,
    },

    include: {
      rentalPackages: {
        where: {
          isActive: true,
        },

        orderBy: {
          duration: "asc",
        },
      },

      monthlyPlans: {
        where: {
          isActive: true,
        },

        orderBy: {
          months: "asc",
        },
      },

      packages: {
        where: {
          isActive: true,
        },

        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!vehicle) {
    notFound();
  }

  const isBookable =
    vehicle.availabilityStatus === "AVAILABLE" &&
    vehicle.maintenanceStatus === "GOOD";

  const unbookableReason =
    vehicle.availabilityStatus !== "AVAILABLE"
      ? "This vehicle is currently marked as unavailable for booking."
      : vehicle.maintenanceStatus !== "GOOD"
      ? "This vehicle is currently undergoing maintenance and cannot be booked."
      : "";

  /* =========================================
     Get Pickup Locations
  ========================================= */

  const locations = await prisma.location.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
      address: true,

      deliveryCharges: {
        where: {
          isActive: true,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 1,

        select: {
          charge: true,
        },
      },
    },
  });

  /* =========================================
     Get Pickup Options
  ========================================= */

  const pickupOptions =
    await prisma.pickupOption.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        description: true,
      },
    });

  const taxConfiguration =
    await prisma.taxConfiguration.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  /* =========================================
     Booking Page
  ========================================= */

  return (
    <main className="min-h-screen bg-slate-50/60 pb-16 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* =================================
            Header Banner
        ================================= */}

        <div className="mb-8 rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl bg-navy-gradient border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/30">
                Prime Rides Checkout
              </span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Book Your Vehicle
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Complete your trip details to confirm instant reservation.
              </p>
            </div>
            <div className="shrink-0 text-right sm:text-right hidden sm:block">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Need Help?</span>
              <span className="text-sm font-semibold text-blue-400">24/7 Roadside & Support</span>
            </div>
          </div>
        </div>

        {/* =================================
            Unbookable Notice Banner
        ================================= */}

        {!isBookable && (
          <div className="mb-6 rounded-2xl border border-amber-300/80 bg-amber-50 p-5 text-amber-900 shadow-sm flex items-start gap-3">
            <div className="rounded-full bg-amber-200 p-1 mt-0.5">
              <svg className="h-5 w-5 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-base text-amber-900">Vehicle Currently Unavailable</p>
              <p className="mt-0.5 text-sm text-amber-800">{unbookableReason}</p>
            </div>
          </div>
        )}

        {/* =================================
            Vehicle Card
        ================================= */}

        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">

            {/* Vehicle Image */}

            <div className="relative flex min-h-[200px] items-center justify-center bg-slate-900/5 p-4 border-b md:border-b-0 md:border-r border-slate-200">
              {vehicle.primaryImage ? (
                <img
                  src={vehicle.primaryImage}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="h-full max-h-[220px] w-full object-contain rounded-xl"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-400">
                  No Image Available
                </span>
              )}
            </div>

            {/* Vehicle Information */}

            <div className="p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Selected Vehicle
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    Verified Deal
                  </span>
                </div>

                <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {vehicle.brand} {vehicle.model}
                </h2>

                {vehicle.variant && (
                  <p className="mt-0.5 text-sm text-slate-500 font-medium">
                    {vehicle.variant}
                  </p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">

                  {/* Fuel */}

                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Fuel Type
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                      {vehicle.fuelType || "—"}
                    </p>
                  </div>

                  {/* Transmission */}

                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Transmission
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                      {vehicle.transmission || "—"}
                    </p>
                  </div>

                  {/* Seats */}

                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Seating
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                      {vehicle.seatingCapacity ? `${vehicle.seatingCapacity} Seats` : "—"}
                    </p>
                  </div>

                  {/* Base Price */}

                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Base Rate
                    </p>

                    <p className="mt-0.5 text-sm font-extrabold text-blue-600">
                      ₹{Number(vehicle.basePrice).toLocaleString("en-IN")}
                      <span className="text-xs text-slate-400 font-normal"> / day</span>
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================
            Booking Form Wrapper
        ================================= */}

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
          <BookingForm
            vehicleId={vehicle.id}
            isBookable={isBookable}
            unbookableReason={unbookableReason}
            initialSearchParams={search}
            basePrice={vehicle.basePrice.toString()}
            taxRate={
              taxConfiguration?.rate?.toString() ?? "0"
            }
            /* Rental Packages */

            rentalPackages={vehicle.rentalPackages.map(
              (item) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                duration: item.duration,
                price: item.price.toString(),
              })
            )}

            /* Monthly Plans */

            monthlyPlans={vehicle.monthlyPlans.map(
              (item) => ({
                id: item.id,
                name: item.name,
                months: item.months,
                price: item.price.toString(),
              })
            )}

            /* Global Packages */

            globalPackages={vehicle.packages.map(
              (item) => ({
                id: item.id,
                name: item.name,
                type: item.type,
                duration: item.duration,
                price: item.price.toString(),
                description: item.shortDescription || item.description,
              })
            )}

            /* Pickup Locations */

            locations={locations.map(
              (location) => ({
                id: location.id,
                name: location.name,
                address: location.address,

                deliveryCharge:
                  location
                    .deliveryCharges[0]
                    ?.charge?.toString() ?? "0",
              })
            )}

            /* Pickup Options */

            pickupOptions={pickupOptions}
          />
        </div>
      </div>
    </main>
  );
}