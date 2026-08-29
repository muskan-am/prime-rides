import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewVehiclePage() {
  const session = await getServerSession(authOptions);

  // Login check
  if (!session?.user) {
    redirect("/login");
  }

  // Admin check
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Prime Rides Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Add Vehicle
            </h1>
          </div>

          <Link
            href="/admin/vehicles"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            ← Back to Vehicles
          </Link>
        </div>

        {/* Form Card */}
        <div className="mt-8 rounded-2xl border bg-card p-8 shadow-sm">

          <form className="space-y-8">

            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Enter the basic details of the rental vehicle.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* Brand */}
                <div>
                  <label
                    htmlFor="brand"
                    className="text-sm font-medium"
                  >
                    Brand *
                  </label>

                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    placeholder="e.g. Toyota"
                    required
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Model */}
                <div>
                  <label
                    htmlFor="model"
                    className="text-sm font-medium"
                  >
                    Model *
                  </label>

                  <input
                    id="model"
                    name="model"
                    type="text"
                    placeholder="e.g. Fortuner"
                    required
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Variant */}
                <div>
                  <label
                    htmlFor="variant"
                    className="text-sm font-medium"
                  >
                    Variant
                  </label>

                  <input
                    id="variant"
                    name="variant"
                    type="text"
                    placeholder="e.g. 4x4 Legender"
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Registration Number */}
                <div>
                  <label
                    htmlFor="registrationNumber"
                    className="text-sm font-medium"
                  >
                    Registration Number
                  </label>

                  <input
                    id="registrationNumber"
                    name="registrationNumber"
                    type="text"
                    placeholder="e.g. UP32AB1234"
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

              </div>
            </section>

            {/* Vehicle Details */}
            <section>
              <h2 className="text-xl font-semibold">
                Vehicle Details
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* Fuel Type */}
                <div>
                  <label
                    htmlFor="fuelType"
                    className="text-sm font-medium"
                  >
                    Fuel Type
                  </label>

                  <select
                    id="fuelType"
                    name="fuelType"
                    defaultValue=""
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Select fuel type
                    </option>
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label
                    htmlFor="transmission"
                    className="text-sm font-medium"
                  >
                    Transmission
                  </label>

                  <select
                    id="transmission"
                    name="transmission"
                    defaultValue=""
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Select transmission
                    </option>
                    <option value="MANUAL">Manual</option>
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="AMT">AMT</option>
                    <option value="CVT">CVT</option>
                    <option value="DCT">DCT</option>
                  </select>
                </div>

                {/* Seating Capacity */}
                <div>
                  <label
                    htmlFor="seatingCapacity"
                    className="text-sm font-medium"
                  >
                    Seating Capacity
                  </label>

                  <input
                    id="seatingCapacity"
                    name="seatingCapacity"
                    type="number"
                    min="1"
                    placeholder="e.g. 7"
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Speed Limit */}
                <div>
                  <label
                    htmlFor="speedLimit"
                    className="text-sm font-medium"
                  >
                    Speed Limit (km/h)
                  </label>

                  <input
                    id="speedLimit"
                    name="speedLimit"
                    type="number"
                    min="0"
                    placeholder="e.g. 120"
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

              </div>
            </section>

            {/* Pricing */}
            <section>
              <h2 className="text-xl font-semibold">
                Pricing
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* Base Price */}
                <div>
                  <label
                    htmlFor="basePrice"
                    className="text-sm font-medium"
                  >
                    Base Price *
                  </label>

                  <input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 2500"
                    required
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Deposit */}
                <div>
                  <label
                    htmlFor="deposit"
                    className="text-sm font-medium"
                  >
                    Security Deposit
                  </label>

                  <input
                    id="deposit"
                    name="deposit"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 5000"
                    defaultValue="0"
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

              </div>
            </section>

            {/* Status */}
            <section>
              <h2 className="text-xl font-semibold">
                Status & Visibility
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-3">

                {/* Availability */}
                <div>
                  <label
                    htmlFor="availabilityStatus"
                    className="text-sm font-medium"
                  >
                    Availability
                  </label>

                  <select
                    id="availabilityStatus"
                    name="availabilityStatus"
                    defaultValue="AVAILABLE"
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="AVAILABLE">
                      Available
                    </option>
                    <option value="UNAVAILABLE">
                      Unavailable
                    </option>
                  </select>
                </div>

                {/* Maintenance */}
                <div>
                  <label
                    htmlFor="maintenanceStatus"
                    className="text-sm font-medium"
                  >
                    Maintenance
                  </label>

                  <select
                    id="maintenanceStatus"
                    name="maintenanceStatus"
                    defaultValue="GOOD"
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="GOOD">
                      Good
                    </option>
                    <option value="MAINTENANCE">
                      Maintenance
                    </option>
                  </select>
                </div>

                {/* Search Priority */}
                <div>
                  <label
                    htmlFor="searchPriority"
                    className="text-sm font-medium"
                  >
                    Search Priority
                  </label>

                  <input
                    id="searchPriority"
                    name="searchPriority"
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

              </div>
            </section>

            {/* Image */}
            <section>
              <h2 className="text-xl font-semibold">
                Vehicle Image
              </h2>

              <div className="mt-6">
                <label
                  htmlFor="primaryImage"
                  className="text-sm font-medium"
                >
                  Primary Image URL
                </label>

                <input
                  id="primaryImage"
                  name="primaryImage"
                  type="url"
                  placeholder="https://example.com/car.jpg"
                  className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </section>

            {/* Rental Terms */}
            <section>
              <h2 className="text-xl font-semibold">
                Rental Terms
              </h2>

              <div className="mt-6">
                <label
                  htmlFor="rentalTerms"
                  className="text-sm font-medium"
                >
                  Rental Terms
                </label>

                <textarea
                  id="rentalTerms"
                  name="rentalTerms"
                  rows={5}
                  placeholder="Enter rental terms and conditions..."
                  className="mt-2 w-full rounded-lg border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </section>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t pt-6">

              <Link
                href="/admin/vehicles"
                className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Create Vehicle
              </button>

            </div>

          </form>
        </div>

      </div>
    </main>
  );
}