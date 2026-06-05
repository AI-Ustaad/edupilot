"use client";
import { useState, useEffect } from "react";

const AVAILABLE_ADDONS = [
  { id: "bus_tracking", name: "Bus Tracking", price: "$10/mo" },
  { id: "sms_notifications", name: "SMS Notifications", price: "$5/mo" },
  { id: "ai_assistant", name: "AI Assistant", price: "$20/mo" },
  { id: "cbt_exams", name: "CBT Exams", price: "$15/mo" },
];

export default function AddonManager() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/addons").then(res => res.json()).then(data => setEnabled(data.enabled || {}));
  }, []);

  const toggle = async (id: string) => {
    const newState = { ...enabled, [id]: !enabled[id] };
    setEnabled(newState);
    await fetch("/api/addons", { method: "POST", body: JSON.stringify({ enabled: newState }) });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black mb-4">Addon Management</h1>
      <div className="space-y-3">
        {AVAILABLE_ADDONS.map(addon => (
          <div key={addon.id} className="flex justify-between items-center p-3 border rounded-lg">
            <div><span className="font-bold">{addon.name}</span> – {addon.price}</div>
            <button
              onClick={() => toggle(addon.id)}
              className={`px-4 py-1 rounded ${enabled[addon.id] ? "bg-green-600 text-gray-900" : "bg-slate-200"}`}
            >
              {enabled[addon.id] ? "Enabled" : "Enable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
