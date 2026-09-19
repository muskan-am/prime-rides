import "server-only";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export type SendTrackedEmailParams = {
  userId?: string;
  bookingId?: string;
  recipient: string | string[];
  type: string;
  subject: string;
  html: string;
};

/**
 * Sends a transactional email through sendEmail() while recording an EmailLog in PostgreSQL.
 *
 * Lifecycle:
 * 1. Creates a PENDING EmailLog entry.
 * 2. Calls sendEmail().
 * 3. Updates EmailLog status to SENT (with providerMessageId & sentAt) or FAILED (with errorMessage).
 *
 * Operational failures in logging never disrupt the email send or throw errors to caller.
 */
export async function sendTrackedEmail({
  userId,
  bookingId,
  recipient,
  type,
  subject,
  html,
}: SendTrackedEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const recipientStr = Array.isArray(recipient) ? recipient.join(", ") : recipient;

  let emailLogId: string | null = null;

  /* -----------------------------------------
     1. Create PENDING EmailLog
  ----------------------------------------- */
  try {
    const log = await prisma.emailLog.create({
      data: {
        userId: userId || null,
        bookingId: bookingId || null,
        recipient: recipientStr,
        type,
        subject,
        status: "PENDING",
      },
    });
    emailLogId = log.id;
  } catch (logCreateError) {
    console.error("[EmailLog] Failed to create PENDING email log:", logCreateError);
  }

  /* -----------------------------------------
     2. Send Email via sendEmail Helper
  ----------------------------------------- */
  let result: { success: boolean; id?: string; error?: string };
  try {
    result = await sendEmail({
      to: recipient,
      subject,
      html,
    });
  } catch (sendError: any) {
    result = {
      success: false,
      error: sendError?.message || "Failed to send email",
    };
  }

  /* -----------------------------------------
     3. Update EmailLog (SENT / FAILED)
  ----------------------------------------- */
  if (emailLogId) {
    try {
      if (result.success) {
        await prisma.emailLog.update({
          where: { id: emailLogId },
          data: {
            status: "SENT",
            providerMessageId: result.id || null,
            sentAt: new Date(),
          },
        });
      } else {
        await prisma.emailLog.update({
          where: { id: emailLogId },
          data: {
            status: "FAILED",
            errorMessage: result.error || "Failed to send email",
          },
        });
      }
    } catch (logUpdateError) {
      console.error("[EmailLog] Failed to update email log status:", logUpdateError);
    }
  }

  return result;
}
