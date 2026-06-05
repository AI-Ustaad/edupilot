export const dynamic = 'force-dynamic';
"use client";

import { useState } from "react";
import { Loader2, BookOpen } from "lucide-react";

export default function SmartBookCenterPage() {
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [type, setType] = useState("recommendation");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/ai/smart-book-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), grade, type }),
      });
      const json = await res.json();
      setResult(json.data?.result || json.result || "No recommendations found.");
    } catch (err) {
      setResult("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen size={32} className="text-blue-600" />
        <h1 className="text-2xl font-black text-gray-900">AI Smart Book Center</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <input
          type="text"
          placeholder="e.g., books for grade 5 about science"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="border border-gray-300 rounded-xl p-3">
            <option value="">All Grades</option>
            {[1,2,3,4,5,6,7,8,9,10].map(g => <option key={g} value={g.toString()}>Grade {g}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="border border-gray-300 rounded-xl p-3">
            <option value="recommendation">Recommendation</option>
            <option value="summary">Summary</option>
            <option value="qa">Q/A</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Get Recommendations"}
        </button>
      </form>

      {result && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-gray-800 mb-2">Result</h2>
          <div className="text-gray-700 whitespace-pre-line">{result}</div>
        </div>
      )}
    </div>
  );
}
