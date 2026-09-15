import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import NotificationHistoryClient from "@/components/notifications/NotificationHistoryClient";

export const metadata = {
  title: "Notifications | Prime Rides",
  description: "View and manage your Prime Rides in-app notification history.",
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/notifications");
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <NotificationHistoryClient />
      </div>
      <Footer />
    </main>
  );
}
