"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function WhitelabelSettings() {
  const [settings, setSettings] = useState({ logo: "", favicon: "", schoolName: "", primaryColor: "#3b82f6" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/settings/whitelabel")
      .then(res => res.json())
      .then(data => setSettings(data));
  }, []);

  const save = async () => {
    setLoading(true);
    await fetch("/api/settings/whitelabel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setLoading(false);
    alert("Saved! Refresh to see changes.");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await convertToBase64(file);
      setSettings(prev => ({ ...prev, [type]: base64 }));
    } catch (err) {
      alert("Failed to convert image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black mb-6">White Label Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="block font-bold mb-1">School Name</label>
          <input
            value={settings.schoolName}
            onChange={e => setSettings({...settings, schoolName: e.target.value})}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Logo (image)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => handleImageUpload(e, "logo")}
            disabled={uploading}
            className="mb-2"
          />
          {settings.logo && (
            <img src={settings.logo} alt="Logo" className="h-12 border rounded p-1" />
          )}
        </div>
        <div>
          <label className="block font-bold mb-1">Favicon (icon)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => handleImageUpload(e, "favicon")}
            disabled={uploading}
            className="mb-2"
          />
          {settings.favicon && (
            <img src={settings.favicon} alt="Favicon" className="w-8 h-8 border rounded" />
          )}
        </div>
        <div>
          <label className="block font-bold mb-1">Primary Color</label>
          <input
            type="color"
            value={settings.primaryColor}
            onChange={e => setSettings({...settings, primaryColor: e.target.value})}
            className="w-16 h-10 border rounded"
          />
        </div>
        <button onClick={save} disabled={loading} className="bg-blue-600 text-gray-900 px-4 py-2 rounded">
          Save Changes
        </button>
      </div>
    </div>
  );
}
