"use client";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, ArrowRight, Zap } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { usePrincipalAgent } from "@/hooks/useAIAgents";

export default function PrincipalCopilotPage() {
  const [query, setQuery] = useState("");
  const [insights, setInsights] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  
  const agentMutation = usePrincipalAgent();

  const generateInsights = async () => {
    setInsights("");
    setErrorMessage("");
    setIsQuotaExceeded(false);

    agentMutation.mutate(query, {
      onSuccess: (data: any) => {
        setInsights(data?.data?.answer || data?.answer || data?.data || "No insights generated.");
      },
      onError: (err: any) => {
        const errorData = err?.response?.data;
        if (err?.response?.status === 429 || errorData?.error === "RATE_LIMIT_EXCEEDED") {
          const seconds = errorData?.retryAfterSeconds || 60;
          setErrorMessage(`Rate limit reached: Too many AI requests. Please wait ${seconds} seconds before trying again.`);
        } else if (err?.response?.status === 402 || errorData?.error === "AI_QUOTA_EXCEEDED") {
          setIsQuotaExceeded(true);
          setErrorMessage(errorData?.message || "Monthly AI quota reached for your current plan. Please upgrade your subscription to unlock more capacity.");
        } else {
          setErrorMessage(errorData?.message || "Failed to generate AI insights. Please try again.");
        }
      },
    });
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.analytics.view]}>
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-3 border-b pb-4">
          <Sparkles className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-black text-gray-900">Principal Copilot</h1>
            <p className="text-gray-500 text-sm">AI-powered insights for school administration.</p>
          </div>
        </div>

        {/* Error / Quota Alert Banner */}
        {errorMessage && (
          <div className={`p-5 rounded-2xl border flex items-start gap-4 ${isQuotaExceeded ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <AlertTriangle className={isQuotaExceeded ? 'text-amber-600' : 'text-red-600'} size={24} />
            <div className="flex-1 space-y-2">
              <p className="font-bold text-sm">{errorMessage}</p>
              {isQuotaExceeded && (
                <Link
                  href="/settings/billing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Zap size={14} /> Upgrade Subscription <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <label className="text-sm font-bold text-gray-700 block">Ask the Principal Agent (Optional)</label>
          <textarea
            placeholder="e.g., How is the school performing this month? Any risks I should know about?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={generateInsights}
            disabled={agentMutation.isPending}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {agentMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {agentMutation.isPending ? "Analyzing School Data..." : "Generate Insights"}
          </button>
        </div>

        {/* Output Area */}
        {agentMutation.isPending && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-gray-500 font-medium">AI is analyzing students, fees, and attendance...</p>
          </div>
        )}

        {insights && !agentMutation.isPending && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
              <TrendingUp className="text-green-600" /> Executive Summary & Recommendations
            </h2>
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-line font-medium leading-relaxed">
              {insights}
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
