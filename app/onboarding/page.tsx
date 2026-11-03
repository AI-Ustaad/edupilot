"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Phone,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function OnboardingPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    schoolName: "",
    phone: "",
    type: "Private School",
    curriculum: "Single National Curriculum (SNC)",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true);
      if (!user) {
        // Redirect to login if user is not authenticated
        router.replace("/login?redirect=/onboarding");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLaunchWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (!formData.schoolName.trim()) {
        throw new Error("Please enter your official school name");
      }

      // 1. Register School and Tenant
      const res = await fetch("/api/v1/users/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          schoolName: formData.schoolName.trim(),
          phone: formData.phone.trim(),
          type: formData.type,
          curriculum: formData.curriculum,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to initialize school workspace");
      }

      // 2. Refresh client token to capture new custom claims (tenantId & role: admin)
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken(true);

        // 3. Sync refreshed session cookie on server
        await fetch("/api/v1/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      }

      // 4. Deterministic transition to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Onboarding Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred during onboarding.");
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl w-full bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/60 p-6 sm:p-10 text-white animate-fade-in-up">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/30 shadow-inner">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-3 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Workspace Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Configure Your School
          </h1>
          <p className="text-sm text-slate-400 font-normal mt-2 max-w-md mx-auto">
            Set up your tenant environment with automatic class structures, grading policies, and free tier subscription quotas.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLaunchWorkspace} className="space-y-5">
          {/* School Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Official School Name *
            </label>
            <div className="relative">
              <Building2 className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="e.g. Apex International Grammar School"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Admin Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Administrator Contact / Phone
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 300 1234567"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* School Type & Curriculum */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Institution Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Private School">Private School</option>
                <option value="Semi-Government">Semi-Government</option>
                <option value="Trust / Non-Profit">Trust / Non-Profit</option>
                <option value="Higher Secondary / College">Higher Secondary / College</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Curriculum Standard
              </label>
              <select
                value={formData.curriculum}
                onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-3.5 text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Single National Curriculum (SNC)">Single National Curriculum (SNC)</option>
                <option value="Cambridge Assessment (CAIE)">Cambridge Assessment (CAIE)</option>
                <option value="Oxford Progressive">Oxford Progressive</option>
                <option value="Matric / Intermediate (BISE)">Matric / Intermediate (BISE)</option>
                <option value="Custom Curriculum">Custom Curriculum</option>
              </select>
            </div>
          </div>

          {/* Features Included Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Free Plan Included
            </span>
            <span>Up to 50 Students &amp; 10 Staff</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Provisioning Workspace...
              </>
            ) : (
              <>
                Launch Workspace <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
