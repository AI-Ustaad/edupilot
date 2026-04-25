"use client";

import { useEffect } from "react";
import { getAuth, getRedirectResult } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const auth = getAuth(app);
        const result = await getRedirectResult(auth);

        if (!result?.user) {
          router.push("/login");
          return;
        }

        const user = result.user;

        // ✅ Force fresh token (important for claims later)
        const idToken = await user.getIdToken(true);

        // ✅ Create session + check new user
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        const data = await res.json();

        if (data.isNewUser) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }

      } catch (error) {
        console.error("Auth error:", error);
        router.push("/login");
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      Signing you in...
    </div>
  );
}
