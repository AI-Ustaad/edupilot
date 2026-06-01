"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

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
        <Loader2 className="animate-spin" size={32} />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black">White‑label Settings</h1>

      {message && (
        <div
          className={`p-4 rounded-xl font-bold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border space-y-4">
        <div>
          <label className="block font-bold">School Name</label>
          <input
            type="text"
            value={branding.schoolName || ""}
            onChange={(e) =>
              setBranding({ ...branding, schoolName: e.target.value })
            }
            className="w-full p-2 border rounded-xl"
          />
        </div>

        <div>
          <label className="block font-bold">Logo URL</label>
          <input
            type="text"
            value={branding.logo || ""}
            onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
            className="w-full p-2 border rounded-xl"
          />
        </div>

        <div>
          <label className="block font-bold">Primary Color</label>
          <input
            type="color"
            value={branding.primaryColor || "#3b82f6"}
            onChange={(e) =>
              setBranding({ ...branding, primaryColor: e.target.value })
            }
            className="w-20 h-10"
          />
        </div>

        <div>
          <label className="block font-bold">Custom Domain</label>
          <input
            type="text"
            value={branding.customDomain || ""}
            onChange={(e) =>
              setBranding({ ...branding, customDomain: e.target.value })
            }
            className="w-full p-2 border rounded-xl"
          />
        </div>

        {/* ---------- NEW: Timezone ---------- */}
        <div>
          <label className="block font-bold">Timezone</label>
          <select
            value={branding.timezone || ""}
            onChange={(e) =>
              setBranding({ ...branding, timezone: e.target.value })
            }
            className="w-full p-2 border rounded-xl bg-white"
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

        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
          {saving ? "Saving..." : "Save Branding"}
        </button>
      </div>
    </div>
  );
}
