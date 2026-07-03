"use client";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useBranding, useUpdateBranding } from "@/hooks/useAdmin";

export default function WhiteLabelPage() {
  const { data: branding, isLoading } = useBranding();
  const updateMutation = useUpdateBranding();
  
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (branding) setForm(branding);
  }, [branding]);

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900">White‑label Settings</h1>
        <p className="text-gray-500 text-sm">Customize your school portal&apos;s appearance and branding.</p>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div>
            <label className="block font-bold text-gray-800 mb-2">School Name</label>
            <input type="text" value={form.schoolName || ""} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} className="w-full p-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. EduPilot High School" />
          </div>
          <div>
            <label className="block font-bold text-gray-800 mb-2">Logo URL</label>
            <input type="text" value={form.logo || ""} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="w-full p-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://example.com/logo.png" />
          </div>
          <div>
            <label className="block font-bold text-gray-800 mb-2">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primaryColor || "#3b82f6"} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="w-16 h-12 rounded-lg cursor-pointer border-0 p-0" />
              <span className="text-gray-500 font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">{form.primaryColor || "#3b82f6"}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto transition-colors shadow-sm">
              {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} Save Branding
            </button>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
