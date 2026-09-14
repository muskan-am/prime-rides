import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await prisma.platformStat.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { label, valueNumber, prefix, suffix, sortOrder, isActive } = body;

    if (!label || typeof valueNumber !== "number" || isNaN(valueNumber)) {
      return NextResponse.json(
        { error: "Label and a valid Number value are required" },
        { status: 400 }
      );
    }

    const newStat = await prisma.platformStat.create({
      data: {
        label: label.trim(),
        valueNumber: Number(valueNumber),
        prefix: typeof prefix === "string" ? prefix.trim() : "",
        suffix: typeof suffix === "string" ? suffix.trim() : "+",
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    revalidatePath("/", "page");
    revalidatePath("/(customer)", "page");
    revalidatePath("/admin/stats");

    return NextResponse.json(newStat, { status: 201 });
  } catch (error) {
    console.error("POST admin stat error:", error);
    return NextResponse.json(
      { error: "Failed to create platform stat" },
      { status: 500 }
    );
  }
}
