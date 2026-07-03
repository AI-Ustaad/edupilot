"use client";
import { useState, useEffect } from "react";
import { MessageSquare, CreditCard, Mail, CheckCircle2, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { useToast } from "@/components/ToastProvider";

export default function AddonsPage() {
  const [addons, setAddons] = useState({ whatsapp: false, stripe: true, sendgrid: false });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const res = await apiClient.get("/settings");
        const data = safeObject(res);
        setAddons(data.addons || { whatsapp: false, stripe: true, sendgrid: false });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddons();
  }, []);

  const toggle = async (key: keyof typeof addons) => {
    setUpdating(key);
    const newAddons = { ...addons, [key]: !addons[key] };
    try {
      await apiClient.put("/settings", { addons: newAddons });
      setAddons(newAddons);
      showToast("Add-on updated successfully!", "success");
    } catch (err) {
      showToast("Failed to update add-on.", "error");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

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
            <button onClick={() => toggle("whatsapp")} disabled={updating === "whatsapp"} className={`px-4 py-2 rounded-lg font-bold text-sm ${addons.whatsapp ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              {updating === "whatsapp" ? <Loader2 size={16} className="animate-spin" /> : addons.whatsapp ? "Enabled" : "Enable"}
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
            <button onClick={() => toggle("stripe")} disabled={updating === "stripe"} className={`px-4 py-2 rounded-lg font-bold text-sm ${addons.stripe ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              {updating === "stripe" ? <Loader2 size={16} className="animate-spin" /> : addons.stripe ? "Enabled" : "Enable"}
            </button>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
