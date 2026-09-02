import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

import BookingForm from "@/components/booking/BookingForm";

type PageProps = {
  params: Promise<{
    vehicleId: string;
  }>;
};

export default async function BookingPage({
  params,
}: PageProps) {
  /* =========================================
     Authentication
  ========================================= */

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  /* =========================================
     Get Vehicle ID
  ========================================= */

  const { vehicleId } = await params;

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
    },
  });

  if (!vehicle) {
    notFound();
  }

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

  const pickupOptions = await prisma.pickupOption.findMany({
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

  /* =========================================
     SERVER DEBUG
     
     Check terminal when booking page loads.
  ========================================= */

  // console.log(
  //   "BOOKING PAGE - LOCATIONS:",
  //   locations
  // );

  // console.log(
  //   "BOOKING PAGE - PICKUP OPTIONS:",
  //   pickupOptions
  // );

  /* =========================================
     Booking Page
  ========================================= */

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* ================================= */}
        {/* Header */}
        {/* ================================= */}

        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Prime Rides
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Book Your Vehicle
          </h1>
        </div>

        {/* ================================= */}
        {/* Vehicle Card */}
        {/* ================================= */}

        <div className="mb-6 overflow-hidden rounded-2xl border bg-card">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
            {/* Vehicle Image */}

            <div className="flex min-h-[180px] items-center justify-center bg-muted">
              {vehicle.primaryImage ? (
                <img
                  src={vehicle.primaryImage}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="h-full min-h-[180px] w-full object-cover"
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  No Image
                </span>
              )}
            </div>

            {/* Vehicle Information */}

            <div className="p-5 sm:p-6">
              <p className="text-sm text-muted-foreground">
                Vehicle
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {vehicle.brand} {vehicle.model}
              </h2>

              {vehicle.variant && (
                <p className="mt-1 text-muted-foreground">
                  {vehicle.variant}
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {/* Fuel */}

                <div>
                  <p className="text-xs text-muted-foreground">
                    Fuel
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {vehicle.fuelType || "—"}
                  </p>
                </div>

                {/* Transmission */}

                <div>
                  <p className="text-xs text-muted-foreground">
                    Transmission
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {vehicle.transmission || "—"}
                  </p>
                </div>

                {/* Seats */}

                <div>
                  <p className="text-xs text-muted-foreground">
                    Seats
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {vehicle.seatingCapacity || "—"}
                  </p>
                </div>

                {/* Base Price */}

                <div>
                  <p className="text-xs text-muted-foreground">
                    Base Price
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    ₹
                    {Number(
                      vehicle.basePrice
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* Booking Form */}
        {/* ================================= */}

        <div className="rounded-2xl border bg-card p-5 sm:p-6 lg:p-8">
          <BookingForm
            vehicleId={vehicle.id}

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

            /* Pickup Locations */

            locations={locations}

            /* Pickup Options */

            pickupOptions={pickupOptions}
          />
        </div>
      </div>
    </main>
  );
}