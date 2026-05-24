"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Building2, Phone, Loader2, ArrowRight } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({
    schoolName: "",
    phone: ""
  });

  const handleSetupWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. API کو کال کر کے اسکول رجسٹر کریں
      const res = await fetch("/api/users/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include"
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to register workspace");
      }

      // 🔥 THE MAGIC FIX: اسکول رجسٹر ہونے کے بعد فائر بیس سے نیا ٹوکن منگوائیں!
      // اس ٹوکن میں اب "tenantId" اور "role: admin" کی مہر لگی ہوگی
      if (auth.currentUser) {
         const idToken = await auth.currentUser.getIdToken(true);

         // 2. اس نئے طاقتور ٹوکن سے اپنا سیشن اپڈیٹ کریں
         await fetch("/api/auth/session", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ idToken }),
         });
      }

      // 3. سب کچھ 100% صحیح ہونے کے بعد ڈیش بورڈ پر ری ڈائریکٹ کریں
      window.location.href = "/dashboard";
      
    } catch (error: any) {
      console.error("Setup Error:", error);
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sm:p-10 animate-fade-in-up">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm border border-blue-100">
            <ShieldCheck size={32} />
          </div>
        </div>

        <div className="text-center mb-8">
           <h1 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight">Setup Workspace</h1>
           <p className="text-sm text-slate-500 font-bold mt-2">Register your school to get Admin privileges and access the command centre.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 text-center uppercase tracking-widest">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSetupWorkspace} className="space-y-6">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Official School Name</label>
              <div className="relative">
                 <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                 <input 
                    required 
                    value={formData.schoolName}
                    onChange={e => setFormData({...formData, schoolName: e.target.value.toUpperCase()})}
                    placeholder="E.G. EDUPILOT HIGH SCHOOL" 
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl pl-12 pr-4 py-4 font-black uppercase text-sm focus:border-blue-500 transition-colors"
                 />
              </div>
           </div>

           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Admin Phone Number</label>
              <div className="relative">
                 <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                 <input 
                    required 
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="0300-0000000" 
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl pl-12 pr-4 py-4 font-black text-sm focus:border-blue-500 transition-colors"
                 />
              </div>
           </div>

           <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50 mt-4"
           >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Provisioning...</> : <>Launch Workspace <ArrowRight size={18}/></>}
           </button>
        </form>

      </div>
    </div>
  );
}
