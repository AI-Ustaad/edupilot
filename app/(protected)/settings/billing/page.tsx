"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { PLANS } from "@/lib/stripe";
import { Loader2 } from "lucide-react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then(res => res.json())
      .then(setSubscription);
  }, []);

  const subscribe = async (planId: string) => {
    setLoading(true);
    const res = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      body: JSON.stringify({ planId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Subscription & Billing</h1>
      <div className="grid md:grid-cols-4 gap-4">
        {Object.values(PLANS).map(plan => (
          <div key={plan.id} className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col">
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <p className="text-2xl font-black mt-2 text-gray-800">
              {plan.price === 0 ? "Free" : `Rs ${plan.price.toLocaleString()}/mo`}
            </p>
            <p className="text-sm text-gray-500 mt-2">Up to {plan.limits.students} students</p>
            <button
              onClick={() => subscribe(plan.id)}
              disabled={loading || subscription?.planId === plan.id}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold disabled:opacity-50 transition"
            >
              {subscription?.planId === plan.id ? "Current Plan" : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
