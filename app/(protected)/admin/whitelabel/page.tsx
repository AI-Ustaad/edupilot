"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function WhiteLabelPage() {
  const { user } = useAuth();
  const [branding, setBranding] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings/whitelabel")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBranding(data.data || {});
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/whitelabel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branding),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Branding updated successfully!" });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.message || "Failed to save" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">White‑label Settings</h1>
      <p className="text-gray-500 text-sm">Customize your school portal's appearance and branding.</p>

      {message && (
        <div
          className={`p-4 rounded-xl font-bold flex items-center gap-2 border shadow-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-5">
        <div>
          <label className="block font-bold text-gray-800 mb-2">School Name</label>
          <input
            type="text"
            value={branding.schoolName || ""}
            onChange={(e) => setBranding({ ...branding, schoolName: e.target.value })}
            className="w-full p-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. EduPilot High School"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-800 mb-2">Logo URL</label>
          <input
            type="text"
            value={branding.logo || ""}
            onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
            className="w-full p-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-800 mb-2">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={branding.primaryColor || "#3b82f6"}
              onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
              className="w-16 h-12 rounded-lg cursor-pointer border-0 p-0"
            />
            <span className="text-gray-500 font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
              {branding.primaryColor || "#3b82f6"}
            </span>
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-800 mb-2">Custom Domain</label>
          <input
            type="text"
            value={branding.customDomain || ""}
            onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })}
            className="w-full p-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="portal.yourschool.com"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-800 mb-2">Timezone</label>
          <select
            value={branding.timezone || ""}
            onChange={(e) => setBranding({ ...branding, timezone: e.target.value })}
            className="w-full p-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select timezone...</option>
            <option value="Asia/Karachi">Asia/Karachi (Pakistan)</option>
            <option value="America/New_York">America/New_York (Eastern US)</option>
            <option value="Europe/London">Europe/London (UK)</option>
            <option value="Asia/Dubai">Asia/Dubai (UAE)</option>
            <option value="Asia/Riyadh">Asia/Riyadh (Saudi Arabia)</option>
            <option value="Asia/Kolkata">Asia/Kolkata (India)</option>
          </select>
        </div>

        {/* 🛡️ Protected Save Button */}
        <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={save}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto transition-colors shadow-sm"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              {saving ? "Saving Changes..." : "Save Branding"}
            </button>
          </div>
        </RequirePermission>
      </div>
    </div>
  );
}
