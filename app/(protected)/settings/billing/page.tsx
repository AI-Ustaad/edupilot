"use client";
import { useState } from "react";
import { CreditCard, Zap, Check, Loader2, AlertCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

const PLANS = [
  { id: "free", name: "Free", price: 0, limits: { students: 50, staff: 10 } },
  { id: "basic", name: "Basic", price: 2000, limits: { students: 500, staff: 50 } },
  { id: "pro", name: "Pro", price: 3000, limits: { students: 2000, staff: 200 } },
  { id: "enterprise", name: "Enterprise", price: 5000, limits: { students: 999999, staff: 999999 } },
];

export default function BillingPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // 1. Fetch Current Subscription & Usage
  const { data: subData, isLoading } = useQuery({
    queryKey: ["subscription", user?.tenantId],
    queryFn: async () => safeObject(await apiClient.get("/subscription")),
  });

  const currentPlanId = subData?.planId || "free";
  const usage = subData?.usage || { studentsUsed: 0, staffUsed: 0 };
  const limits = PLANS.find(p => p.id === currentPlanId)?.limits || PLANS[0].limits;

  // 2. Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiClient.post("/stripe/create-checkout", { planId });
      return safeObject(res);
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      }
    },
    onError: () => {
      showToast("Failed to initiate checkout. Please try again.", "error");
      setLoadingPlan(null);
    }
  });

  const handleUpgrade = (planId: string) => {
    setLoadingPlan(planId);
    checkoutMutation.mutate(planId);
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  const usagePercent = Math.min((usage.studentsUsed / limits.students) * 100, 100);

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <CreditCard className="text-blue-600" /> Subscription & Billing
        </h1>

        {/* Current Usage Card */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white rounded-3xl p-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-blue-200 font-bold mb-1">Current Plan</p>
              <h2 className="text-3xl font-black flex items-center gap-2 capitalize">
                <Zap className="text-yellow-400" /> {currentPlanId}
              </h2>
            </div>
            <span className={`px-4 py-2 rounded-full font-bold text-sm ${subData?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
              {subData?.status?.toUpperCase() || "ACTIVE"}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-100">Students Usage</span>
                <span className="font-bold text-white">{usage.studentsUsed} / {limits.students === 999999 ? "Unlimited" : limits.students}</span>
              </div>
              <div className="w-full bg-blue-800/50 rounded-full h-3">
                <div className="bg-yellow-400 h-3 rounded-full transition-all" style={{ width: `${usagePercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <div>
          <h3 className="text-xl font-black text-gray-900 mb-4 text-center">Upgrade Your Plan</h3>
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
                    <li className="flex items-center gap-2 text-sm text-gray-600"><Check size={16} className="text-green-500" /> White-label</li>
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
      </div>
    </RequirePermission>
  );
}
