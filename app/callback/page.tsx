"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logger } from "@/lib/logger/logger";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        let user: User | null = null;

        const result = await getRedirectResult(auth);
        if (result?.user) {
          user = result.user;
        }

        if (!user) {
          user = await new Promise<User | null>((resolve) => {
            const unsub = onAuthStateChanged(auth, (u) => {
              unsub();
              resolve(u);
            });
          });
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        const idToken = await user.getIdToken(true);

        // 🚀 FIX: Added v1 to the session API path
        const res = await fetch("/api/v1/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        window.location.replace("/dashboard");

      } catch (err) {
        logger.error("Callback Error:", { metadata: { error: err } });
        router.replace("/login");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
