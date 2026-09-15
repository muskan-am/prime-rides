import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";

import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import NotificationPreferencesClient from "@/components/notifications/NotificationPreferencesClient";

export const metadata = {
  title: "Notification Preferences | Prime Rides",
  description: "Control the in-app notifications you receive on Prime Rides.",
};

export default async function NotificationPreferencesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/notification-preferences");
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <NotificationPreferencesClient />
      </div>
      <Footer />
    </main>
  );
}
