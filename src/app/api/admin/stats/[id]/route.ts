import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const stat = await prisma.platformStat.findUnique({
      where: { id },
    });

    if (!stat) {
      return NextResponse.json({ error: "Stat not found" }, { status: 404 });
    }

    return NextResponse.json(stat);
  } catch (error) {
    console.error("GET stat by id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform stat" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { label, valueNumber, prefix, suffix, sortOrder, isActive } = body;

    const updateData: Record<string, any> = {};

    if (typeof label === "string") updateData.label = label.trim();
    if (typeof valueNumber === "number" && !isNaN(valueNumber)) updateData.valueNumber = valueNumber;
    if (typeof prefix === "string") updateData.prefix = prefix.trim();
    if (typeof suffix === "string") updateData.suffix = suffix.trim();
    if (typeof sortOrder === "number") updateData.sortOrder = sortOrder;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    const updatedStat = await prisma.platformStat.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/", "page");
    revalidatePath("/(customer)", "page");
    revalidatePath("/admin/stats");

    return NextResponse.json(updatedStat);
  } catch (error) {
    console.error("PATCH admin stat error:", error);
    return NextResponse.json(
      { error: "Failed to update platform stat" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.platformStat.delete({
      where: { id },
    });

    revalidatePath("/", "page");
    revalidatePath("/(customer)", "page");
    revalidatePath("/admin/stats");

    return NextResponse.json({ message: "Platform stat deleted successfully" });
  } catch (error) {
    console.error("DELETE admin stat error:", error);
    return NextResponse.json(
      { error: "Failed to delete platform stat" },
      { status: 500 }
    );
  }
}
