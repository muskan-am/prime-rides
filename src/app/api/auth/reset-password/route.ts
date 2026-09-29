import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type ResetPasswordRequest = {
  token?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    let body: ResetPasswordRequest;
    try {
      body = (await request.json()) as ResetPasswordRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request payload.",
        },
        { status: 400 }
      );
    }

    const rawToken = String(body.token || "").trim();
    const newPassword = String(body.password || "");

    if (!rawToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset token is required.",
        },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password is required.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    // Compute SHA-256 hash of provided token
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const now = new Date();

    const user = await prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: {
          gt: now,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The password reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and invalidate reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("[RESET_PASSWORD_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while resetting your password. Please try again.",
      },
      { status: 500 }
    );
  }
}
