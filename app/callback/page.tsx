"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying Identity...");

  useEffect(() => {
    const processLogin = async () => {
      try {
        let user: User | null = null;

        // ✅ Step 1: redirect result
        const result = await getRedirectResult(auth);
        if (result?.user) {
          user = result.user;
        }

        // ✅ Step 2: fallback (important)
        if (!user) {
          user = await new Promise<User | null>((resolve) => {
            const unsub = onAuthStateChanged(auth, (u) => {
              unsub();
              resolve(u);
            });
          });
        }

        // ❌ No user
        if (!user) {
          router.replace("/login");
          return;
        }

        setStatus("Securing Session...");

        const idToken = await user.getIdToken(true);

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

        setStatus("Redirecting to Dashboard...");
        window.location.href = "/dashboard";

      } catch (e) {
        console.error("Callback Error:", e);
        router.replace("/login");
      }
    };

    processLogin();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center">
        <Loader2 size={40} className="animate-spin text-blue-600 mb-4 mx-auto" />
        <p className="font-bold text-sm">{status}</p>
      </div>
    </div>
  );
}
