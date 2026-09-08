import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
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

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      features: { orderBy: { createdAt: "asc" } },
      specifications: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-400">Vehicle Management</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-semibold text-blue-400">{vehicle.brand} {vehicle.model}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Vehicle Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/vehicles"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            ← Back to Vehicles
          </Link>
          <Link
            href={`/admin/vehicles/${vehicle.id}/edit`}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all"
          >
            Edit Vehicle
          </Link>
        </div>
      </div>

      {/* Main Vehicle Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        {/* Vehicle Header Banner */}
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row gap-6 items-start md:items-center">
          {vehicle.primaryImage ? (
            <div className="relative h-36 w-full md:w-56 shrink-0 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
              <Image
                src={vehicle.primaryImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                sizes="(max-width: 768px) 100vw, 224px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-36 w-full md:w-56 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-500 text-sm">
              No Image Uploaded
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge type="availability" value={vehicle.availabilityStatus} />
              <StatusBadge type="maintenance" value={vehicle.maintenanceStatus} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {vehicle.brand} {vehicle.model}
            </h2>
            {vehicle.variant && (
              <p className="text-sm font-medium text-slate-400 mt-0.5">{vehicle.variant}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                REG: {vehicle.registrationNumber || "N/A"}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                FUEL: {vehicle.fuelType || "Petrol"}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                TRANSMISSION: {vehicle.transmission || "Automatic"}
              </span>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
            <p className="text-xs text-slate-400">Daily Base Rate</p>
            <p className="text-3xl font-extrabold text-white">₹{vehicle.basePrice.toString()}</p>
            <p className="text-xs text-slate-400 mt-1">Deposit: ₹{vehicle.deposit.toString()}</p>
          </div>
        </div>

        {/* Specs Grid */}
        <section className="p-6 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
            Vehicle Specs Matrix
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <InfoTile label="Brand" value={vehicle.brand} />
            <InfoTile label="Model" value={vehicle.model} />
            <InfoTile label="Variant" value={vehicle.variant || "—"} />
            <InfoTile label="Registration Plate" value={vehicle.registrationNumber || "—"} />
            <InfoTile label="Fuel Type" value={vehicle.fuelType || "—"} />
            <InfoTile label="Transmission" value={vehicle.transmission || "—"} />
            <InfoTile label="Seating Capacity" value={vehicle.seatingCapacity ? `${vehicle.seatingCapacity} Seats` : "—"} />
            <InfoTile label="Speed Limit" value={vehicle.speedLimit ? `${vehicle.speedLimit} km/h` : "—"} />
            <InfoTile label="Base Price" value={`₹${vehicle.basePrice.toString()}/day`} />
            <InfoTile label="Security Deposit" value={`₹${vehicle.deposit.toString()}`} />
            <InfoTile label="Search Priority" value={String(vehicle.searchPriority)} />
            <InfoTile label="Created Date" value={new Date(vehicle.createdAt).toLocaleDateString()} />
          </div>
        </section>

        {/* Additional Admin Management Widgets */}
        <div className="divide-y divide-slate-800">
          <VehicleImages vehicleId={vehicle.id} />
          <VehicleFeatures vehicleId={vehicle.id} />
          <VehicleSpecifications vehicleId={vehicle.id} />
          <RentalPackages vehicleId={vehicle.id} />
          <MonthlyPlans vehicleId={vehicle.id} />
        </div>

        {/* Rental Terms Section */}
        <section className="p-6 border-t border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            Rental Terms & Policies
          </h3>
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800/80 text-slate-300 text-sm whitespace-pre-wrap">
            {vehicle.rentalTerms || "No special rental terms specified for this vehicle."}
          </div>
        </section>

        {/* Bottom Actions Bar */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/admin/vehicles"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Vehicles Overview
          </Link>

          <div className="flex items-center gap-3">
            <DeleteVehicleButton
              vehicleId={vehicle.id}
              vehicleName={`${vehicle.brand} ${vehicle.model}`}
            />
            <Link
              href={`/admin/vehicles/${vehicle.id}/edit`}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all"
            >
              Edit Vehicle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-white mt-1 truncate">{value}</p>
    </div>
  );
}

function StatusBadge({ type, value }: { type: "availability" | "maintenance"; value: string }) {
  const isGood = type === "availability" ? value === "AVAILABLE" : value === "GOOD";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        isGood
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isGood ? "bg-emerald-400" : "bg-rose-400"}`} />
      {value}
    </span>
  );
}