"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, CheckCircle } from "lucide-react";

export default function WhiteLabelPage() {
  const { user } = useAuth();
  const [branding, setBranding] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/whitelabel")
      .then(res => res.json())
      .then(data => {
        if (data.success) setBranding(data.data);
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/settings/whitelabel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(branding),
    });
    setSaving(false);
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black">White‑label Settings</h1>
      <div className="bg-white p-6 rounded-2xl border space-y-4">
        <div>
          <label className="block font-bold">School Name</label>
          <input
            type="text"
            value={branding.schoolName || ""}
            onChange={e => setBranding({ ...branding, schoolName: e.target.value })}
            className="w-full p-2 border rounded-xl"
          />
        </div>
        <div>
          <label className="block font-bold">Logo URL</label>
          <input
            type="text"
            value={branding.logo || ""}
            onChange={e => setBranding({ ...branding, logo: e.target.value })}
            className="w-full p-2 border rounded-xl"
          />
        </div>
        <div>
          <label className="block font-bold">Primary Color</label>
          <input
            type="color"
            value={branding.primaryColor || "#3b82f6"}
            onChange={e => setBranding({ ...branding, primaryColor: e.target.value })}
            className="w-20 h-10"
          />
        </div>
        <div>
          <label className="block font-bold">Custom Domain</label>
          <input
            type="text"
            value={branding.customDomain || ""}
            onChange={e => setBranding({ ...branding, customDomain: e.target.value })}
            className="w-full p-2 border rounded-xl"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : "Save Branding"}
        </button>
      </div>
    </div>
  );
}
