"use client";

import { SessionProvider } from "next-auth/react";
import { FavoritesProvider } from "@/context/FavoritesContext";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <FavoritesProvider>{children}</FavoritesProvider>
    </SessionProvider>
  );
}
