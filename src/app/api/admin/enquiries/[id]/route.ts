import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const VALID_STATUSES = ["NEW", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Enquiry ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const status = body?.status as string;

    if (!status || !VALID_STATUSES.includes(status as any)) {
      return NextResponse.json(
        { success: false, message: "Invalid enquiry status" },
        { status: 400 }
      );
    }

    const existing = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Enquiry not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: {
        status: status as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Enquiry status updated successfully",
      enquiry: updated,
    });
  } catch (error) {
    console.error("Update Enquiry Status Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update enquiry status" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Enquiry ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Enquiry not found" },
        { status: 404 }
      );
    }

    await prisma.enquiry.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    console.error("Delete Enquiry Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete enquiry" },
      { status: 500 }
    );
  }
}
