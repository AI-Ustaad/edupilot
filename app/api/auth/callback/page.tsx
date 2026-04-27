"use "use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying Identity...");

  useEffect(() => {
    const processLogin = async () => {
      try {
        // 1. پہلے Redirect کا رزلٹ چیک کریں
        const result = await getRedirectResult(auth);
        let user = result?.user;

        // 2. اگر Redirect رزلٹ null ہو، تو Firebase Radar سے چیک کریں
        if (!user) {
          user = await new Promise((resolve) => {
            const unsub = onAuthStateChanged(auth, (u) => {
              unsub();
              resolve(u);
            });
          });
        }

        // 3. اگر دونوں جگہ یوزر نہ ملے تو لاگ ان پر واپس بھیج دیں
        if (!user) {
          router.replace("/login");
          return;
        }

        setStatus("Securing Session...");
        const idToken = await user.getIdToken(true);

        // 4. سرور کو ٹوکن بھیجیں تاکہ کوکی بنے
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
          credentials: "include", // 👈 کوکی سیو کرنے کے لیے لازمی
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        setStatus("Redirecting to Dashboard...");

        // 5. ہارڈ ری ڈائریکٹ (تاکہ سرور اور مڈل ویئر کوکی کو فورا ریڈ کر لیں)
        window.location.href = "/dashboard";

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
