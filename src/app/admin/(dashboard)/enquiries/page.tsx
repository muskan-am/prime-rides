import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminEnquiriesClient from "@/components/admin/AdminEnquiriesClient";

export default async function AdminEnquiriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
        },
      },
    },
  });

  const total = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === "NEW" || e.status === "OPEN").length;
  const inProgressCount = enquiries.filter((e) => e.status === "IN_PROGRESS").length;
  const resolvedCount = enquiries.filter((e) => e.status === "RESOLVED").length;
  const closedCount = enquiries.filter((e) => e.status === "CLOSED").length;

  return (
    <AdminEnquiriesClient
      initialEnquiries={enquiries}
      initialMetrics={{
        total,
        newCount,
        inProgressCount,
        resolvedCount,
        closedCount,
      }}
    />
  );
}
