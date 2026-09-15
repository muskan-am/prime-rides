import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const statusFilter = searchParams.get("status")?.trim() || "";

    const allEnquiries = await prisma.enquiry.findMany({
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

    // Calculate metrics
    const total = allEnquiries.length;
    const newCount = allEnquiries.filter((e) => e.status === "NEW" || e.status === "OPEN").length;
    const inProgressCount = allEnquiries.filter((e) => e.status === "IN_PROGRESS").length;
    const resolvedCount = allEnquiries.filter((e) => e.status === "RESOLVED").length;
    const closedCount = allEnquiries.filter((e) => e.status === "CLOSED").length;

    // Apply filtering & searching
    const filtered = allEnquiries.filter((e) => {
      // Status filter
      if (statusFilter && statusFilter !== "ALL") {
        if (statusFilter === "NEW" && (e.status !== "NEW" && e.status !== "OPEN")) return false;
        if (statusFilter !== "NEW" && e.status !== statusFilter) return false;
      }

      // Search filter
      if (search) {
        const query = search.toLowerCase();
        const nameMatch = (e.name || e.user?.name || "").toLowerCase().includes(query);
        const emailMatch = (e.email || e.user?.email || "").toLowerCase().includes(query);
        const mobileMatch = (e.mobile || e.user?.mobile || "").toLowerCase().includes(query);
        const messageMatch = (e.message || "").toLowerCase().includes(query);
        if (!nameMatch && !emailMatch && !mobileMatch && !messageMatch) return false;
      }

      return true;
    });

    return NextResponse.json({
      success: true,
      enquiries: filtered,
      metrics: {
        total,
        newCount,
        inProgressCount,
        resolvedCount,
        closedCount,
      },
    });
  } catch (error) {
    console.error("Admin Get Enquiries Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch enquiries." },
      { status: 500 }
    );
  }
}
