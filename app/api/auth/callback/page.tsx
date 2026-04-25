"use client";

import { useEffect } from "react";
import { getAuth, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const auth = getAuth(app);
      const result = await getRedirectResult(auth);

      if (result?.user) {
        const user = result.user;

        // 🔥 FORCE REFRESH TOKEN (IMPORTANT)
        const idToken = await user.getIdToken(true);

        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        router.push("/dashboard");
      } else {
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
