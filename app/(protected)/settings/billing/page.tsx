"use client";
import { CreditCard, Zap, Check } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function BillingPage() {
  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <CreditCard className="text-blue-600" /> Subscription & Billing
        </h1>

        <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-3xl p-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-blue-200 font-bold mb-1">Current Plan</p>
              <h2 className="text-3xl font-black flex items-center gap-2"><Zap className="text-yellow-400" /> Premium EduPilot</h2>
            </div>
            <span className="bg-white/20 px-4 py-2 rounded-full font-bold text-sm">Active</span>
          </div>
          
          <div className="space-y-2 mb-6">
            <p className="flex items-center gap-2 text-sm text-blue-100"><Check size={16} className="text-green-400"/> Unlimited Students</p>
            <p className="flex items-center gap-2 text-sm text-blue-100"><Check size={16} className="text-green-400"/> AI Features Enabled</p>
            <p className="flex items-center gap-2 text-sm text-blue-100"><Check size={16} className="text-green-400"/> White-label Branding</p>
          </div>

          <button className="bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition">
            Manage Subscription via Stripe
          </button>
        </div>
      </div>
    </RequirePermission>
  );
}
