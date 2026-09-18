import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  const result = await sendEmail({
    to: "muskankesharwani63@gmail.com",
    subject: "Prime Rides Email Test",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 30px;">
        <h1 style="color: #0A1128;">
          Prime Rides
        </h1>

        <h2>
          Email System Test
        </h2>

        <p>
          Congratulations! Your Prime Rides email service is working.
        </p>

        <p>
          This is a test email sent using Resend.
        </p>

        <hr />

        <p style="color: #94A3B8;">
          Your Ride. Your Freedom.
        </p>
      </div>
    `,
  });

  return NextResponse.json(result);
}