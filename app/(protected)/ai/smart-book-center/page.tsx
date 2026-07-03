"use client";
import { useState } from "react";
import { Loader2, BookOpen, Sparkles } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAskSmartBookCenter } from "@/hooks/useAI";

export default function SmartBookCenterPage() {
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [type, setType] = useState("recommendation");
  const [result, setResult] = useState("");
  
  const askMutation = useAskSmartBookCenter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setResult("");
    
    askMutation.mutate(
      { query: query.trim(), grade, type },
      {
        onSuccess: (data) => setResult(data?.result || "No recommendations found."),
        onError: () => setResult("Network error or AI service unavailable."),
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
