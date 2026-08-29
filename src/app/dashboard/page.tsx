import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // User is not logged in
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Customer Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Welcome, {session.user.name || "Customer"}
            </h1>
          </div>

          <LogoutButton />
        </div>

        {/* Account Information */}
        <div className="mt-8 rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">
            Account Information
          </h2>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {session.user.name || "Not available"}
            </p>

            <p>
              <span className="font-medium">Email:</span>{" "}
              {session.user.email || "Not available"}
            </p>
          </div>
        </div>

        {/* My Bookings */}
        <div className="mt-6 rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">
            My Bookings
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your bookings will appear here.
          </p>
        </div>

      </div>
    </main>
  );
}