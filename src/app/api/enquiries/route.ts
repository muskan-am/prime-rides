import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

type CreateEnquiryRequest = {
  name?: string;
  mobile?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateEnquiryRequest;

    const name = body.name?.trim() || "";
    const mobile = body.mobile?.trim() || "";
    const email = body.email?.trim() || "";
    const subject = body.subject?.trim() || "General Enquiry";
    const message = body.message?.trim() || "";

    /* -----------------------------------------
       Validation
    ----------------------------------------- */
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Name cannot exceed 100 characters." },
        { status: 400 }
      );
    }

    if (!mobile || !/^[0-9+\s\-()]{7,20}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid mobile number." },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        { success: false, message: "Message must be at least 10 characters long." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, message: "Message cannot exceed 2000 characters." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       User Association (If Authenticated)
    ----------------------------------------- */
    let userId: string | null = null;

    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
      } else if (session?.user?.email) {
        const foundUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (foundUser) userId = foundUser.id;
      }
    } catch {
      // Unauthenticated or session read error - proceed as guest
    }

    /* -----------------------------------------
       Create Enquiry Record
    ----------------------------------------- */
    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        mobile,
        email,
        subject,
        message,
        userId: userId || undefined,
        status: "NEW",
      },
    });

    /* -----------------------------------------
       Notify Admins (Failure Isolated)
    ----------------------------------------- */
    try {
      const shortMsg = message.length > 60 ? `${message.slice(0, 60)}...` : message;
      await notifyAdmins({
        type: "ADMIN_NEW_ENQUIRY",
        title: "New Customer Enquiry",
        message: `${name} submitted an enquiry: "${shortMsg}"`,
        link: `/admin/enquiries#${enquiry.id}`,
      });
    } catch (notifErr) {
      console.error("Failed to notify admins of enquiry:", notifErr);
    }


    return NextResponse.json(
      {
        success: true,
        message: "Your enquiry has been submitted successfully. Our team will get back to you shortly.",
        enquiryId: enquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enquiry Submission Error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong while submitting your enquiry. Please try again later." },
      { status: 500 }
    );
  }
}
