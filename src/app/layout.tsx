import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prime Rides | Premium Self-Drive Car Rentals",
  description: "Book premium self-drive cars for every journey across Delhi, Goa, and Bangalore. Hit the road with Prime Rides.",
  icons: {
    icon: [{ url: "/prime-rides-rounded-icon.png", type: "image/png" }],
    apple: "/prime-rides-rounded-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}