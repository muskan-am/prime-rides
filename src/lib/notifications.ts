import { prisma } from "@/lib/prisma";
import { isNotificationEnabled } from "@/lib/notification-preferences";

export type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
};

/**
 * Creates an in-app notification for a single user.
 * Evaluates user's persisted NotificationPreferences server-side.
 * Implements failure isolation so errors never cause upstream business logic to fail.
 * Prevents duplicates when a unique link (e.g. referencing an entity/event) is provided.
 */
export async function createNotification(input: CreateNotificationInput) {
  try {
    const { userId, type, title, message, link } = input;

    if (!userId || !type || !title || !message) {
      console.warn("createNotification called with missing required fields:", input);
      return null;
    }

    // Preference check: skip creating notification if user disabled this type
    const enabled = await isNotificationEnabled({ userId, type });
    if (!enabled) {
      return null;
    }

    // Deduplication check: if link is provided, skip if notification already exists for user + type + link
    if (link) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          type,
          link,
        },
      });

      if (existing) {
        return existing;
      }
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification (isolated failure):", error);
    return null;
  }
}

/**
 * Sends an in-app notification to all users with role ADMIN.
 * Safe failure isolation and per-admin preference evaluation.
 */
export async function notifyAdmins(
  input: Omit<CreateNotificationInput, "userId">
) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    if (!admins || admins.length === 0) {
      return [];
    }

    const results = await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          ...input,
        })
      )
    );

    return results;
  } catch (error) {
    console.error("Error notifying admins (isolated failure):", error);
    return [];
  }
}
