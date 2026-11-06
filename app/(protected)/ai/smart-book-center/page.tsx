"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, BookOpen, Sparkles, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAskSmartBookCenter } from "@/hooks/useAI";

export default function SmartBookCenterPage() {
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [type, setType] = useState("recommendation");
  const [result, setResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  
  const askMutation = useAskSmartBookCenter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setResult("");
    setErrorMessage("");
    setIsQuotaExceeded(false);
    
    askMutation.mutate(
      { query: query.trim(), grade, type },
      {
        onSuccess: (data: any) => setResult(data?.result || "No recommendations found."),
        onError: (err: any) => {
          const errorData = err?.response?.data;
          if (err?.response?.status === 429 || errorData?.error === "RATE_LIMIT_EXCEEDED") {
            const seconds = errorData?.retryAfterSeconds || 60;
            setErrorMessage(`Rate limit reached: Too many AI requests. Please wait ${seconds} seconds before trying again.`);
          } else if (err?.response?.status === 402 || errorData?.error === "AI_QUOTA_EXCEEDED") {
            setIsQuotaExceeded(true);
            setErrorMessage(errorData?.message || "Monthly AI quota reached for your current plan. Please upgrade your subscription to unlock more capacity.");
          } else {
            setErrorMessage(errorData?.message || "Network error or AI service unavailable.");
          }
        },
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <BookOpen size={32} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-black text-gray-900">AI Smart Book Center</h1>
          <p className="text-gray-500 text-sm">Ask AI for book recommendations, summaries, or questions.</p>
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

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <input
          type="text"
          placeholder="e.g., books for grade 5 about science"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Grades</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => <option key={g} value={g.toString()}>Grade {g}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="recommendation">Recommendation</option>
            <option value="summary">Book Summary</option>
            <option value="qa">Q/A from Book</option>
          </select>
        </div>
        
        <RequirePermission permissions={[PERMISSIONS.chat.send]}>
          <button type="submit" disabled={askMutation.isPending} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50">
            {askMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {askMutation.isPending ? "Processing..." : "Get AI Results"}
          </button>
        </RequirePermission>
      </form>

      {result && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-inner animate-fade-in">
          <h2 className="font-black text-blue-900 mb-3 border-b border-blue-200 pb-2">AI Results</h2>
          <div className="text-blue-900 leading-relaxed whitespace-pre-line font-medium">{result}</div>
        </div>
      )}
    </div>
  );
}
