"use client";
import { useState } from "react";
import { Sparkles, Loader2, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { usePrincipalAgent } from "@/hooks/useAIAgents";

export default function PrincipalCopilotPage() {
  const [query, setQuery] = useState("");
  const [insights, setInsights] = useState("");
  
  const agentMutation = usePrincipalAgent();

  const generateInsights = async () => {
    setInsights("");
    agentMutation.mutate(query, {
      onSuccess: (data) => setInsights(data?.data || "No insights generated."),
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
