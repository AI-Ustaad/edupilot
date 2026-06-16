"use client";
import { useState } from "react";
import { MessageSquare, CreditCard, Mail, CheckCircle2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function AddonsPage() {
  const [addons, setAddons] = useState({ whatsapp: false, stripe: true, sendgrid: false });

  const toggle = (key: keyof typeof addons) => {
    setAddons({ ...addons, [key]: !addons[key] });
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-gray-900">Add-ons & Integrations</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-2xl p-6 flex justify-between items-center shadow-sm">
            <div className="flex gap-4 items-center">
              <div className="bg-green-100 text-green-600 p-3 rounded-xl"><MessageSquare size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-900">WhatsApp API</h3>
                <p className="text-xs text-gray-500">Send automated attendance alerts.</p>
              </div>
            </div>
            <button onClick={() => toggle("whatsapp")} className={`px-4 py-2 rounded-lg font-bold text-sm ${addons.whatsapp ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              {addons.whatsapp ? "Enabled" : "Enable"}
            </button>
          </div>

          <div className="bg-white border rounded-2xl p-6 flex justify-between items-center shadow-sm">
            <div className="flex gap-4 items-center">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-xl"><CreditCard size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-900">Stripe Payments</h3>
                <p className="text-xs text-gray-500">Accept fee payments online.</p>
              </div>
            </div>
            <button onClick={() => toggle("stripe")} className={`px-4 py-2 rounded-lg font-bold text-sm ${addons.stripe ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              {addons.stripe ? "Enabled" : "Enable"}
            </button>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
