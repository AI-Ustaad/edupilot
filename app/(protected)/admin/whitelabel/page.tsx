"use client";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Palette, Globe, Image as ImageIcon } from "lucide-react"; // 🛡️ Fix: ImageIcon added
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useBranding, useUpdateBranding } from "@/hooks/useAdmin";
import ImageUpload from "@/components/ui/ImageUpload";

export default function EnterpriseWhiteLabelPage() {
  const { data: branding, isLoading } = useBranding();
  const updateMutation = useUpdateBranding();
  
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (branding) setForm(branding);
  }, [branding]);

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  const inputClass = "w-full p-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition";

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">White Label & Branding</h1>
          <p className="text-gray-500 text-sm mt-1">Customize the visual identity of your school portal.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column: Brand Identity */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visual Assets (Uploaders) */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                <ImageIcon size={20} className="text-blue-600" /> Visual Assets
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <ImageUpload 
                  label="School Logo" 
                  value={form.logo || ""} 
                  onChange={(base64) => setForm({ ...form, logo: base64 })} 
                  aspect="square"
                />
                
                {/* Favicon Upload */}
                <ImageUpload 
                  label="Favicon" 
                  value={form.favicon || ""} 
                  onChange={(base64) => setForm({ ...form, favicon: base64 })} 
                  aspect="square"
                />
              </div>

              {/* Cover Image Upload (Premium Feel) */}
              <div className="pt-4 border-t mt-4">
                <ImageUpload 
                  label="School Cover Image (Banner)" 
                  value={form.coverImage || ""} 
                  onChange={(base64) => setForm({ ...form, coverImage: base64 })} 
                  aspect="video"
                />
                <p className="text-xs text-gray-500 mt-2">This image will be displayed on the login screen and dashboard header for a premium look.</p>
              </div>

              <div className="pt-4 border-t">
                <label className="block text-sm font-bold text-gray-700 mb-1">School Name</label>
                <input type="text" value={form.schoolName || ""} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} className={inputClass} placeholder="EduPilot High School" />
              </div>
            </div>

            {/* Colors & Theme */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                <Palette size={20} className="text-purple-600" /> Theme & Colors
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3 p-2 border rounded-xl">
                    <input type="color" value={form.primaryColor || "#3b82f6"} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="w-16 h-10 rounded-lg cursor-pointer border-0 p-0" />
                    <input type="text" value={form.primaryColor || "#3b82f6"} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="flex-1 bg-transparent outline-none font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center gap-3 p-2 border rounded-xl">
                    <input type="color" value={form.secondaryColor || "#10b981"} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="w-16 h-10 rounded-lg cursor-pointer border-0 p-0" />
                    <input type="text" value={form.secondaryColor || "#10b981"} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="flex-1 bg-transparent outline-none font-mono text-sm" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Domain & Advanced */}
          <div className="space-y-6">
            
            {/* Custom Domain */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                <Globe size={20} className="text-green-600" /> Custom Domain
              </h2>
              <p className="text-xs text-gray-500">Point your school&apos;s domain to EduPilot. (Requires DNS configuration)</p>
              <input type="text" value={form.customDomain || ""} onChange={(e) => setForm({ ...form, customDomain: e.target.value })} className={inputClass} placeholder="portal.yourschool.com" />
              <button className="w-full bg-gray-100 text-gray-500 font-bold py-2 rounded-xl text-sm cursor-not-allowed">Verify Domain</button>
            </div>

            {/* Custom CSS */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Advanced Customization</h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Custom CSS</label>
                <textarea value={form.customCSS || ""} onChange={(e) => setForm({ ...form, customCSS: e.target.value })} rows={4} className={inputClass + " font-mono text-xs"} placeholder=".sidebar { background: #f0f0f0; }" />
              </div>
            </div>

          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end border-t pt-6">
          <button 
            onClick={() => updateMutation.mutate(form)} 
            disabled={updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-md"
          >
            {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            Save Branding Settings
          </button>
        </div>
      </div>
    </RequirePermission>
  );
}
