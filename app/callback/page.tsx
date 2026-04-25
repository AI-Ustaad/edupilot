"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, getRedirectResult } from "firebase/auth";
import app from "@/lib/firebase";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        const auth = getAuth(app);

        // 1) Get Google redirect result
        const result = await getRedirectResult(auth);

        if (!result?.user) {
          router.replace("/login");
          return;
        }

        // 2) 🔥 FORCE NEW TOKEN (contains role + tenantId claims)
        const idToken = await result.user.getIdToken(true);

        // 3) Send token to server → create session cookie
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

        // 4) Go to dashboard
        router.replace("/dashboard");
      } catch (e) {
        router.replace("/login");
      }
    };

    run();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      Signing you in...
    </div>
  );
}
