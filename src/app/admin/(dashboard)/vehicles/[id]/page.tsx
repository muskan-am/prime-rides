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
            <span className="text-xs text-slate-500">Vehicle Management</span>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-semibold text-blue-600">{vehicle.brand} {vehicle.model}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1128] tracking-tight">
            Vehicle Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/vehicles"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition-colors"
          >
            ← Back to Vehicles
          </Link>
          <Link
            href={`/admin/vehicles/${vehicle.id}/edit`}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
          >
            Edit Vehicle
          </Link>
        </div>
      </div>

      {/* Main Vehicle Card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Vehicle Header Banner */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-center bg-slate-50/50">
          {vehicle.primaryImage ? (
            <div className="relative h-36 w-full md:w-56 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
              <Image
                src={vehicle.primaryImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                sizes="(max-width: 768px) 100vw, 224px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-36 w-full md:w-56 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-sm">
              No Image Uploaded
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge type="availability" value={vehicle.availabilityStatus} />
              <StatusBadge type="maintenance" value={vehicle.maintenanceStatus} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1128]">
              {vehicle.brand} {vehicle.model}
            </h2>
            {vehicle.variant && (
              <p className="text-sm font-medium text-slate-500 mt-0.5">{vehicle.variant}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-700">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono shadow-xs">
                REG: {vehicle.registrationNumber || "N/A"}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs">
                FUEL: {vehicle.fuelType || "Petrol"}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs">
                TRANSMISSION: {vehicle.transmission || "Automatic"}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs">
                AIR CONDITIONING: {vehicle.hasAirConditioning !== false ? "AC" : "NON-AC"}
              </span>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
            <p className="text-xs text-slate-500 font-medium">Daily Base Rate</p>
            <p className="text-3xl font-extrabold text-[#0A1128]">₹{vehicle.basePrice.toString()}</p>
            <p className="text-xs text-slate-500 mt-1">Deposit: ₹{vehicle.deposit.toString()}</p>
          </div>
        </div>

        {/* Specs Grid */}
        <section className="p-6 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
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
            <InfoTile label="Air Conditioning" value={vehicle.hasAirConditioning !== false ? "Air Conditioned (AC)" : "Non-AC"} />
            <InfoTile label="Speed Limit" value={vehicle.speedLimit ? `${vehicle.speedLimit} km/h` : "—"} />
            <InfoTile label="Base Price" value={`₹${vehicle.basePrice.toString()}/day`} />
            <InfoTile label="Security Deposit" value={`₹${vehicle.deposit.toString()}`} />
            <InfoTile label="Search Priority" value={String(vehicle.searchPriority)} />
            <InfoTile label="Created Date" value={new Date(vehicle.createdAt).toLocaleDateString()} />
          </div>
        </section>

        {/* Additional Admin Management Widgets */}
        <div className="divide-y divide-slate-200">
          <VehicleImages vehicleId={vehicle.id} />
          <VehicleFeatures vehicleId={vehicle.id} />
          <VehicleSpecifications vehicleId={vehicle.id} />
          <RentalPackages vehicleId={vehicle.id} />
          <MonthlyPlans vehicleId={vehicle.id} />
        </div>



        {/* Bottom Actions Bar */}
        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/admin/vehicles"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
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
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-[#0A1128] mt-1 truncate">{value}</p>
    </div>
  );
}

function StatusBadge({ type, value }: { type: "availability" | "maintenance"; value: string }) {
  const isGood = type === "availability" ? value === "AVAILABLE" : value === "GOOD";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        isGood
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-rose-50 text-rose-700 border-rose-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isGood ? "bg-emerald-500" : "bg-rose-500"}`} />
      {value}
    </span>
  );
}