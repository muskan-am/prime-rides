import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "coupon_ticker_enabled" },
    });

    const enabled = setting ? setting.value === "true" : true;

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error("GET coupon ticker setting error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon ticker setting" },
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
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Field 'enabled' (boolean) is required" },
        { status: 400 }
      );
    }

    const updatedSetting = await prisma.systemSetting.upsert({
      where: { key: "coupon_ticker_enabled" },
      update: { value: enabled ? "true" : "false" },
      create: {
        key: "coupon_ticker_enabled",
        value: enabled ? "true" : "false",
      },
    });

    revalidatePath("/", "page");
    revalidatePath("/(customer)", "page");
    revalidatePath("/admin/coupons");

    return NextResponse.json({
      enabled: updatedSetting.value === "true",
      message: `Coupon ticker banner has been ${
        enabled ? "enabled" : "disabled"
      } successfully.`,
    });
  } catch (error) {
    console.error("POST coupon ticker setting error:", error);
    return NextResponse.json(
      { error: "Failed to update coupon ticker setting" },
      { status: 500 }
    );
  }
}
