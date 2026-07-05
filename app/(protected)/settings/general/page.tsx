"use client";
import { useState, useEffect } from "react";
import { Loader2, Save, Building2, Globe, MapPin } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useGeneralSettings, useUpdateGeneralSettings } from "@/hooks/useGeneralSettings";

export default function GeneralSettingsPage() {
  const { data: settings, isLoading } = useGeneralSettings();
  const updateMutation = useUpdateGeneralSettings();
  
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  const inputClass = "w-full p-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition";

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">General Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure your school's fundamental details and localization.</p>
        </div>

        {/* School Profile Section */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2"><Building2 size={20} className="text-blue-600" /> School Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">School Name</label>
              <input type="text" value={form.schoolName || ""} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} className={inputClass} placeholder="e.g. EduPilot High School" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Established Year</label>
              <input type="number" value={form.establishedYear || ""} onChange={(e) => setForm({ ...form, establishedYear: e.target.value })} className={inputClass} placeholder="e.g. 1998" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">School Type</label>
              <select value={form.schoolType || "Private"} onChange={(e) => setForm({ ...form, schoolType: e.target.value })} className={inputClass}>
                <option value="Private">Private</option>
                <option value="Government">Government</option>
                <option value="Madrissa">Madrissa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Affiliation / Board</label>
              <input type="text" value={form.affiliation || ""} onChange={(e) => setForm({ ...form, affiliation: e.target.value })} className={inputClass} placeholder="e.g. FBISE / Punjab Board" />
            </div>
          </div>
        </div>

        {/* Localization Section */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2"><Globe size={20} className="text-green-600" /> Localization</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Currency</label>
              <select value={form.currency || "PKR"} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputClass}>
                <option value="PKR">Pakistani Rupee (PKR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="AED">UAE Dirham (AED)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Timezone</label>
              <select value={form.timezone || "Asia/Karachi"} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className={inputClass}>
                <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date Format</label>
              <select value={form.dateFormat || "DD-MM-YYYY"} onChange={(e) => setForm({ ...form, dateFormat: e.target.value })} className={inputClass}>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Default Language</label>
              <select value={form.language || "en"} onChange={(e) => setForm({ ...form, language: e.target.value })} className={inputClass}>
                <option value="en">English</option>
                <option value="ur">Urdu</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2"><MapPin size={20} className="text-red-600" /> Address Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Street Address</label>
              <input type="text" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} placeholder="House #, Street, Area" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
              <input type="text" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="e.g. Lahore" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Province / State</label>
              <input type="text" value={form.province || ""} onChange={(e) => setForm({ ...form, province: e.target.value })} className={inputClass} placeholder="e.g. Punjab" />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={() => updateMutation.mutate(form)} 
            disabled={updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-md"
          >
            {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </div>
    </RequirePermission>
  );
}
