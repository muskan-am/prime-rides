import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try{
        const body = await request.json();

        const name = String(body.name || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");

    // -----------------------------
    // Validation
    // -----------------------------

    if(!name){
        return NextResponse.json(
            {success : false, message: "Full name is requested."},
            { status : 400}
        );
    }

    if(name.length < 2) {
       return NextResponse.json(
        {
            success : false,
            message : "Name must contain at least 2 characters.",
        },
        { status : 400 }
       );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }
     
    // -----------------------------
    // Check existing user
    // -----------------------------

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // -----------------------------
    // Hash password
    // -----------------------------

    const hashedPassword = await bcrypt.hash(password, 12);

    // -----------------------------
    // Create customer
    // -----------------------------

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

     return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("SIGNUP_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating your account.",
      },
      { status: 500 }
    );
    
    }
}
