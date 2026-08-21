"use client";

import { signIn } from "next-auth/react";

export default function GoogleButton() {

    const handleGoogleLogin = async () => {
    const params = new URLSearchParams(window.location.search);
    
    const callbackUrl = params.get("callbackUrl") || "/dashboard";
    await signIn("google", {
      callbackUrl,
    });
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border bg-background text-sm font-medium transition hover:bg-muted"
    >
      <span className="text-base font-bold">
        G
      </span>

      Continue with Google
    </button>
  );
}