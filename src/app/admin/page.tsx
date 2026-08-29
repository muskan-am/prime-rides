import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // User is not logged in
  if (!session?.user) {
    redirect("/login");
  }

  // Only ADMIN can access this page
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Prime Rides Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Admin Dashboard
            </h1>
          </div>

          <LogoutButton />
        </div>

        {/* Welcome Card */}
        <div className="mt-8 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-semibold">
            Welcome, {session.user.name || "Admin"} 👋
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            You are logged in as an administrator.
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {session.user.name || "Not available"}
            </p>

            <p>
              <span className="font-medium">Email:</span>{" "}
              {session.user.email || "Not available"}
            </p>

            <p>
              <span className="font-medium">Role:</span>{" "}
              {session.user.role}
            </p>
          </div>
        </div>

        {/* Admin Modules */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">Vehicles</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage rental vehicles
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">Bookings</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage customer bookings
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">Customers</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage customers
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-semibold">Reports</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              View platform reports
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}