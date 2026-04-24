"use client";

import { useEffect } from "react";
import { getAuth, getRedirectResult } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const auth = getAuth(app);
      const result = await getRedirectResult(auth);

      if (result?.user) {
        const token = await result.user.getIdToken();

        // 👉 Fix Applied Here: idToken: token
        await fetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ idToken: token }),
        });

        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    };

    handleAuth();
  }, []);

  return <div className="flex h-screen items-center justify-center font-bold text-slate-500">Signing you in...</div>;
}
