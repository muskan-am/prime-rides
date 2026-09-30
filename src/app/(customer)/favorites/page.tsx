import { Metadata } from "next";
import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";
import FavoritesClient from "@/components/customer/FavoritesClient";

export const metadata: Metadata = {
  title: "My Favorite Cars | Prime Rides",
  description:
    "View and manage your saved self-drive rental cars on Prime Rides. Book your favorite vehicles with ease.",
};

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 py-6">
        <FavoritesClient />
      </main>
      <Footer />
    </div>
  );
}
