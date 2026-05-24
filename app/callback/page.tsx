"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        let user: User | null = null;

        // Step 1: redirect result
        const result = await getRedirectResult(auth);
        if (result?.user) {
          user = result.user;
        }

        // Step 2: fallback
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

        // Step 3: token
        const idToken = await user.getIdToken(true);

        // Step 4: create session
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        // Step 5: redirect
        window.location.replace("/dashboard");

      } catch (err) {
        console.error("Callback Error:", err);
        router.replace("/login");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Logging you in...</p>
    </div>
  );
}
