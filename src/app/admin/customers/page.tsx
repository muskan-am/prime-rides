import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminCustomersPage() {
  const session = await getServerSession(authOptions);

  // Authentication
  if (!session?.user) {
    redirect("/login");
  }

  // Admin only
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch customers
  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      createdAt: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Prime Rides Admin
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Customer Management
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage registered Prime Rides customers.
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Total Customers
            </p>

            <p className="mt-2 text-3xl font-bold">
              {customers.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Customers With Bookings
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                customers.filter(
                  (customer) => customer._count.bookings > 0
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Total Bookings
            </p>

            <p className="mt-2 text-3xl font-bold">
              {customers.reduce(
                (total, customer) =>
                  total + customer._count.bookings,
                0
              )}
            </p>
          </div>

        </div>

        {/* Customer List */}
        <div className="mt-8 rounded-2xl border bg-card">

          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">
              All Customers
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Registered customer accounts
            </p>
          </div>

          {customers.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">
                No customers found
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Customer accounts will appear here after registration.
              </p>
            </div>
          ) : (
            <div className="divide-y">

              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-6"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* Customer Info */}
                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                        {(customer.name?.charAt(0) || "C").toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          {customer.name || "Unnamed Customer"}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>

                    </div>

                    {/* Customer Details */}
                    <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[500px]">
                      
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Mobile
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {customer.mobile || "Not available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Bookings
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {customer._count.bookings}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Joined
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {customer.createdAt.toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>

                    </div>

                    <div className="mt-4 lg:mt-0">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                        >
                          View Details →
                        </Link>
                    </div>                      

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}