"use client";
import { useState } from "react";
import { CreditCard, Zap, Check, Loader2, FileText, Download, TrendingUp } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useToast } from "@/components/ToastProvider";

const PLANS = [
  { id: "free", name: "Free", price: 0, limits: { students: 50, staff: 10 } },
  { id: "basic", name: "Basic", price: 2000, limits: { students: 500, staff: 50 } },
  { id: "pro", name: "Pro", price: 3000, limits: { students: 2000, staff: 200 } },
  { id: "enterprise", name: "Enterprise", price: 5000, limits: { students: 999999, staff: 999999 } },
];

// Mock Data (In real app, fetch from API)
const MOCK_USAGE = { studentsUsed: 145, staffUsed: 22, aiTokensUsed: 12500 };
const MOCK_INVOICES = [
  { id: "INV-001", date: "Jun 01, 2024", amount: 3000, status: "Paid" },
  { id: "INV-002", date: "May 01, 2024", amount: 3000, status: "Paid" },
  { id: "INV-003", date: "Apr 01, 2024", amount: 3000, status: "Paid" },
];

export default function EnterpriseBillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { showToast } = useToast();
  
  // Mock current plan
  const currentPlanId = "pro";

  const handleUpgrade = (planId: string) => {
    setLoadingPlan(planId);
    // Mock API Call for Stripe Checkout
    setTimeout(() => {
      showToast("Redirecting to payment gateway...", "info");
      setLoadingPlan(null);
    }, 1500);
  };

  const currentPlan = PLANS.find(p => p.id === currentPlanId)!;
  const studentUsagePercent = Math.min((MOCK_USAGE.studentsUsed / currentPlan.limits.students) * 100, 100);
  const staffUsagePercent = Math.min((MOCK_USAGE.staffUsed / currentPlan.limits.staff) * 100, 100);

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <CreditCard className="text-blue-600" /> Subscription & Billing
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your subscription, usage limits, and payment history.</p>
        </div>

        {/* Current Plan & Usage */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-800 text-white rounded-3xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <p className="text-blue-200 font-bold mb-1">Current Plan</p>
              <h2 className="text-4xl font-black flex items-center gap-2 capitalize">
                <Zap className="text-yellow-400" /> {currentPlan.name}
              </h2>
              <p className="text-blue-300 text-sm mt-2">Rs. {currentPlan.price.toLocaleString()} / month</p>
            </div>
            <button className="mt-4 md:mt-0 bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-md">
              Manage Payment Method
            </button>
          </div>

          {/* Usage Meters */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-blue-100">Students Limit</span>
                <span className="font-bold text-white">{MOCK_USAGE.studentsUsed} / {currentPlan.limits.students}</span>
              </div>
              <div className="w-full bg-blue-800/50 rounded-full h-3">
                <div className="bg-yellow-400 h-3 rounded-full transition-all" style={{ width: `${studentUsagePercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-blue-100">Staff Limit</span>
                <span className="font-bold text-white">{MOCK_USAGE.staffUsed} / {currentPlan.limits.staff}</span>
              </div>
              <div className="w-full bg-blue-800/50 rounded-full h-3">
                <div className="bg-green-400 h-3 rounded-full transition-all" style={{ width: `${staffUsagePercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Table (Upgrade/Downgrade) */}
        <div>
          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="text-green-600" /> Change Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlanId;
              return (
                <div key={plan.id} className={`bg-white border-2 rounded-2xl p-6 shadow-sm flex flex-col ${isCurrent ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                  <h4 className="text-lg font-black text-gray-900 capitalize">{plan.name}</h4>
                  <p className="text-3xl font-black text-gray-900 mt-2">Rs {plan.price.toLocaleString()}<span className="text-sm font-medium text-gray-500">/mo</span></p>
                  
                  <ul className="space-y-2 mt-4 mb-6 flex-1">
                    <li className="flex items-center gap-2 text-sm text-gray-600"><Check size={16} className="text-green-500" /> {plan.limits.students === 999999 ? "Unlimited" : plan.limits.students} Students</li>
                    <li className="flex items-center gap-2 text-sm text-gray-600"><Check size={16} className="text-green-500" /> {plan.limits.staff === 999999 ? "Unlimited" : plan.limits.staff} Staff</li>
                    <li className="flex items-center gap-2 text-sm text-gray-600"><Check size={16} className="text-green-500" /> AI Features</li>
                  </ul>

                  <button
                    onClick={() => !isCurrent && handleUpgrade(plan.id)}
                    disabled={isCurrent || loadingPlan === plan.id}
                    className={`w-full py-3 rounded-xl font-bold transition ${isCurrent ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {loadingPlan === plan.id ? <Loader2 className="animate-spin mx-auto" size={18} /> : isCurrent ? "Current Plan" : "Upgrade"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <FileText size={20} className="text-gray-600" />
            <h2 className="font-bold text-gray-800">Invoice History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600">Invoice ID</th>
                  <th className="p-4 font-bold text-gray-600">Date</th>
                  <th className="p-4 font-bold text-gray-600">Amount</th>
                  <th className="p-4 font-bold text-gray-600">Status</th>
                  <th className="p-4 font-bold text-gray-600 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-mono font-bold text-gray-900">{inv.id}</td>
                    <td className="p-4 text-gray-600">{inv.date}</td>
                    <td className="p-4 font-bold text-gray-900">Rs. {inv.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{inv.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}
