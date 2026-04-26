"use client";
import { useEffect, useState } from "react";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, ShieldCheck } from "lucide-react";

export default function CallbackPage() {
  const [status, setStatus] = useState("Verifying Google Credentials...");

  useEffect(() => {
    const processLogin = async () => {
      try {
        // 1. گوگل سے واپس آنے والا رزلٹ پکڑیں
        const result = await getRedirectResult(auth);

        if (!result?.user) {
          // اگر کوئی رزلٹ نہیں ہے تو واپس لاگ ان پر بھیجیں
          window.location.href = "/login";
          return;
        }

        setStatus("Securing Workspace Session...");
        
        // 2. ٹوکن اور کلیمز نکالیں
        const idTokenResult = await result.user.getIdTokenResult(true);
        const token = idTokenResult.token;

        // 3. سرور پر کوکی (Cookie) بنائیں
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: token }),
        });

        if (!res.ok) {
          throw new Error("Session creation failed");
        }

        setStatus("Routing to Command Centre...");

        // 4. 🔥 THE SMART ROUTING
        const claims = idTokenResult.claims || {};
        
        setTimeout(() => {
          if (claims.tenantId) {
            window.location.href = "/dashboard"; // پرانا یوزر
          } else {
            window.location.href = "/signup"; // نیا یوزر (Setup Wizard)
          }
        }, 1500);

      } catch (e) {
        console.error("CALLBACK ERROR:", e);
        window.location.href = "/login";
      }
    };

    processLogin();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center text-center max-w-md w-full animate-fade-in-up">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-6" />
        <h2 className="text-lg font-black text-[#0F172A] uppercase tracking-widest mb-2">
          {status}
        </h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Please do not close this window
        </p>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-2 px-4 rounded-lg border border-emerald-100">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Authentication in progress</span>
        </div>
      </div>
    </div>
  );
}
