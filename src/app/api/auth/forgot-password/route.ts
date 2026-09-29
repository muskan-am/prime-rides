import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email-events";

type ForgotPasswordRequest = {
  email?: string;
};

export async function POST(request: Request) {
  try {
    let body: ForgotPasswordRequest;
    try {
      body = (await request.json()) as ForgotPasswordRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request payload.",
        },
        { status: 400 }
      );
    }

    const rawEmail = String(body.email || "").trim().toLowerCase();

    if (!rawEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is required.",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Always use a generic message to prevent account enumeration
    const genericSuccessMessage =
      "If an account exists with this email, a password reset link has been sent.";

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: rawEmail,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user || !user.email) {
      // Do not reveal whether user exists
      return NextResponse.json({
        success: true,
        message: genericSuccessMessage,
      });
    }

    // Generate secure random 32-byte (64 hex chars) token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store SHA-256 hash in DB (token itself is never stored in DB)
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Token expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
      },
    });

    // Send reset email asynchronously
    void sendPasswordResetEmail(
      user.id,
      user.email,
      user.name || "Customer",
      rawToken
    );

    return NextResponse.json({
      success: true,
      message: genericSuccessMessage,
    });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
