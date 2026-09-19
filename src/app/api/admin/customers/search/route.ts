import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

/* =========================================
   GET - Search Customers for Admin Booking
========================================= */

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    let customers;

    if (!query) {
      customers = await prisma.user.findMany({
        where: {
          role: "CUSTOMER",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          createdAt: true,
        },
      });
    } else {
      customers = await prisma.user.findMany({
        where: {
          role: "CUSTOMER",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { mobile: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Search Customers Error:", error);
    return NextResponse.json(
      { error: "Failed to search customers." },
      { status: 500 }
    );
  }
}

/* =========================================
   POST - Quick Create Customer for Admin
========================================= */

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const name = body.name?.trim();
    const email = body.email?.trim()?.toLowerCase();
    const mobile = body.mobile?.trim() || null;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Customer name and email are required." },
        { status: 400 }
      );
    }

    // Check duplicate by email
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
      },
    });

    if (existingByEmail) {
      return NextResponse.json({
        customer: existingByEmail,
        isExisting: true,
        message: `Existing customer found with email "${email}". Selected existing user.`,
      });
    }

    // Check duplicate by mobile if mobile is provided
    if (mobile) {
      const existingByMobile = await prisma.user.findFirst({
        where: { mobile },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
        },
      });

      if (existingByMobile) {
        return NextResponse.json({
          customer: existingByMobile,
          isExisting: true,
          message: `Existing customer found with mobile "${mobile}". Selected existing user.`,
        });
      }
    }

    // Create new customer user
    const newCustomer = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
      },
    });

    return NextResponse.json(
      {
        customer: newCustomer,
        isExisting: false,
        message: "New customer account created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Customer Error:", error);
    return NextResponse.json(
      { error: "Failed to create customer account." },
      { status: 500 }
    );
  }
}
