import "server-only";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
};

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing");
      return {
        success: false,
        error: "Email service is not configured",
      };
    }

    if (!process.env.EMAIL_FROM) {
      console.error("EMAIL_FROM is missing");
      return {
        success: false,
        error: "Email sender is not configured",
      };
    }

    if (!to || (Array.isArray(to) && to.length === 0)) {
      console.error("Email recipient is missing");
      return {
        success: false,
        error: "Email recipient is required",
      };
    }

    if (!subject.trim()) {
      console.error("Email subject is missing");
      return {
        success: false,
        error: "Email subject is required",
      };
    }

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error("Resend error:", response.error);

      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      id: response.data?.id,
    };
  } catch (error) {
    console.error("Email sending failed:", error);

    return {
      success: false,
      error: "Failed to send email",
    };
  }
}