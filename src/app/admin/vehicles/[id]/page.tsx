import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import DeleteVehicleButton from "@/components/admin/DeleteVehicleButton";
import VehicleFeatures from "@/components/admin/VehicleFeatures";
import VehicleSpecifications from "@/components/admin/VehicleSpecifications";
import VehicleImages from "@/components/admin/VehicleImages";
import RentalPackages from "@/components/admin/RentalPackages";
import MonthlyPlans from "@/components/admin/MonthlyPlans";

type VehicleDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VehicleDetailsPage({
  params,
}: VehicleDetailsPageProps) {
  const session = await getServerSession(authOptions);

  // Login check
  if (!session?.user) {
    redirect("/login");
  }

  // Admin check
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  // Fetch vehicle from database
  const vehicle = await prisma.vehicle.findUnique({
  where: {
    id,
  },
  include: {
    features: {
      orderBy: {
        createdAt: "asc",
      },
    },
    specifications: {
      orderBy: {
        createdAt: "asc",
      },
    },
  },
});

  if (!vehicle) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl min-w-0">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Prime Rides Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Vehicle Details
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/vehicles"
              className="rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
            >
              ← Back to Vehicles
            </Link>

            <LogoutButton />
          </div>
        </div>

        {/* Vehicle Card */}
        <div className="mt-8 overflow-hidden rounded-2xl border bg-card">

          {/* Vehicle Header */}
          <div className="flex flex-col gap-5 border-b p-5 sm:flex-row sm:items-center sm:p-6">

            {/* Image */}
            {vehicle.primaryImage ? (
              <img
                src={vehicle.primaryImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="h-48 w-full rounded-xl border object-cover sm:h-36 sm:w-52"
              />
            ) : (
              <div className="flex h-48 w-full items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground sm:h-36 sm:w-52">
                No Image
              </div>
            )}

            {/* Name */}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">
                Vehicle
              </p>

              <h2 className="mt-1 break-words text-2xl font-bold">
                {vehicle.brand} {vehicle.model}
              </h2>

              {vehicle.variant && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {vehicle.variant}
                </p>
              )}

              {vehicle.registrationNumber && (
                <p className="mt-4 break-all text-sm font-medium">
                  Registration: {vehicle.registrationNumber}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-wrap gap-2 border-b p-5 sm:p-6">
            <StatusBadge
              type="availability"
              value={vehicle.availabilityStatus}
            />

            <StatusBadge
              type="maintenance"
              value={vehicle.maintenanceStatus}
            />
          </div>

          {/* Basic Information */}
          <section className="border-b p-5 sm:p-6">
            <h3 className="text-lg font-semibold">
              Basic Information
            </h3>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                label="Brand"
                value={vehicle.brand}
              />

              <InfoItem
                label="Model"
                value={vehicle.model}
              />

              <InfoItem
                label="Variant"
                value={vehicle.variant || "—"}
              />

              <InfoItem
                label="Registration Number"
                value={vehicle.registrationNumber || "—"}
              />

              <InfoItem
                label="Fuel Type"
                value={vehicle.fuelType || "—"}
              />

              <InfoItem
                label="Transmission"
                value={vehicle.transmission || "—"}
              />

              <InfoItem
                label="Seating Capacity"
                value={
                  vehicle.seatingCapacity
                    ? `${vehicle.seatingCapacity} seats`
                    : "—"
                }
              />

              <InfoItem
                label="Base Price"
                value={`₹${vehicle.basePrice.toString()}`}
              />

              <InfoItem
                label="Security Deposit"
                value={`₹${vehicle.deposit.toString()}`}
              />

              <InfoItem
                label="Speed Limit"
                value={
                  vehicle.speedLimit
                    ? `${vehicle.speedLimit} km/h`
                    : "—"
                }
              />

              <InfoItem
                label="Search Priority"
                value={String(vehicle.searchPriority)}
              />
            </div>
          </section>

        <VehicleImages vehicleId={vehicle.id} />

        <VehicleFeatures vehicleId={vehicle.id} />
          
        <VehicleSpecifications vehicleId={vehicle.id} />

        <RentalPackages vehicleId={vehicle.id} />

        <MonthlyPlans vehicleId={vehicle.id} />
          {/* Rental Terms */}
          <section className="p-5 sm:p-6">
            <h3 className="text-lg font-semibold">
              Rental Terms
            </h3>

            <div className="mt-4 rounded-xl border bg-muted/20 p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-6">
                {vehicle.rentalTerms || "No rental terms added."}
              </p>
            </div>
          </section>

          {/* Actions */}
        <div className="flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">
          <Link
            href="/admin/vehicles"
            className="inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            Back to Vehicles
          </Link>

          <Link
            href={`/admin/vehicles/${vehicle.id}/edit`}
            className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Edit Vehicle
          </Link>

          <DeleteVehicleButton
            vehicleId={vehicle.id}
            vehicleName={`${vehicle.brand} ${vehicle.model}`}
          />
        </div>
        </div>
      </div>
    </main>
  );
}

/* ============================= */
/* INFO ITEM */
/* ============================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

/* ============================= */
/* STATUS BADGE */
/* ============================= */

function StatusBadge({
  type,
  value,
}: {
  type: "availability" | "maintenance";
  value: string;
}) {
  const isGood =
    type === "availability"
      ? value === "AVAILABLE"
      : value === "GOOD";

  return (
    <span
      className={`inline-flex max-w-full rounded-full px-3 py-1 text-xs font-medium ${
        isGood
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {value}
    </span>
  );
}