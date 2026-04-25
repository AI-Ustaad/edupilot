"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Phone, ShieldCheck, Loader2, ArrowRight } from "lucide-react";

export default function SchoolRegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    schoolName: "",
    phone: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register school");
      }

      // رجسٹریشن کامیاب ہونے کے بعد سیدھا ڈیش بورڈ پر بھیج دیں
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 p-8 sm:p-10 animate-fade-in-up">
        
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100">
            <ShieldCheck size={32} />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] uppercase tracking-tight">Setup Workspace</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Register your school to get Admin privileges and access the command centre.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official School Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building2 size={18} className="text-slate-400" />
              </div>
              <input 
                type="text" 
                required 
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value.toUpperCase() })}
                placeholder="e.g. EDUPILOT HIGH SCHOOL" 
                className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-800 uppercase transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone size={18} className="text-slate-400" />
              </div>
              <input 
                type="tel" 
                required 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0300-0000000" 
                className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-800 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50 disabled:hover:bg-[#0F172A]"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating Workspace...</>
              ) : (
                <>Launch Workspace <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}
