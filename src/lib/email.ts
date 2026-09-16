import "server-only";
import { Resend } from "resend";

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
};

export type SendEmailResult = {
  success: boolean;
  id?: string;
  error?: string;
};

const DEFAULT_EMAIL_FROM = "Prime Rides <onboarding@resend.dev>";

/**
 * Validates basic email address format.
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Server-side transactional email sender using Resend.
 * Complete failure isolation ensures upstream business flows (bookings, payments, enquiries)
 * never fail due to email dispatch issues.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  try {
    const { to, subject, html } = options;

    // 1. Recipient Validation
    const recipientList = Array.isArray(to) ? to : [to];
    const validRecipients = recipientList
      .map((r) => r?.trim())
      .filter((r): r is string => Boolean(r) && isValidEmail(r));

    if (validRecipients.length === 0) {
      const errMessage = `Invalid recipient email address(es): ${JSON.stringify(to)}`;
      console.warn("[Email Service] Validation Error:", errMessage);
      return { success: false, error: errMessage };
    }

    // 2. Subject Validation
    const cleanSubject = subject?.trim();
    if (!cleanSubject) {
      const errMessage = "Email subject is required and cannot be empty.";
      console.warn("[Email Service] Validation Error:", errMessage);
      return { success: false, error: errMessage };
    }

    // 3. HTML Content Validation
    if (!html || typeof html !== "string" || !html.trim()) {
      const errMessage = "Email HTML content is required.";
      console.warn("[Email Service] Validation Error:", errMessage);
      return { success: false, error: errMessage };
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const fromAddress = process.env.EMAIL_FROM?.trim() || DEFAULT_EMAIL_FROM;

    // 4. Development / Unconfigured API Key Sandbox Handling
    if (!apiKey || apiKey === "your_resend_api_key" || apiKey === "re_123456789") {
      console.log("[Email Service] Sandbox Mode / Mock Dispatch (Resend API key not configured)");
      console.log(`  To: ${validRecipients.join(", ")}`);
      console.log(`  From: ${fromAddress}`);
      console.log(`  Subject: ${cleanSubject}`);
      return {
        success: true,
        id: `mock_resend_msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      };
    }

    // 5. Initialize Resend & Send
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from: fromAddress,
      to: validRecipients,
      subject: cleanSubject,
      html,
    });

    if (response.error) {
      console.error("[Email Service] Resend API Error:", response.error);
      return {
        success: false,
        error: response.error.message || "Resend email delivery failed.",
      };
    }

    console.log(
      `[Email Service] Email sent successfully to [${validRecipients.join(", ")}], Resend ID: ${response.data?.id}`
    );

    return {
      success: true,
      id: response.data?.id,
    };
  } catch (error: any) {
    const errorMessage = error?.message || "Unexpected server error while sending email.";
    console.error("[Email Service] Unhandled Exception (Isolated):", error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
