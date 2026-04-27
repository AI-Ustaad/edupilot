"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying Identity...");

  useEffect(() => {
    const processLogin = async () => {
      try {
        // 🔥 صرف Redirect کا رزلٹ پکڑیں
        const result = await getRedirectResult(auth);

        if (!result?.user) {
          router.replace("/login");
          return;
        }

        setStatus("Securing Session...");
        const idToken = await result.user.getIdToken(true);

        // سرور پر سیشن کوکی بھیجیں
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (res.ok) {
          setStatus("Redirecting to Dashboard...");
          window.location.href = "/dashboard"; // ہارڈ ریفریش تاکہ سرور کوکی ریڈ کر لے
        } else {
          router.replace("/login");
        }
      } catch (e) {
        console.error("Callback Error:", e);
        router.replace("/login");
      }
    };

    processLogin();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center text-center">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-6" />
        <h2 className="text-lg font-black text-[#0F172A] uppercase">{status}</h2>
      </div>
    </div>
  );
}
