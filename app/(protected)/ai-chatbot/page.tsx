"use client";

import { useState } from "react";
import { Loader2, Send, Bot } from "lucide-react";

export default function AIChatbotPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const json = await res.json();
      setAnswer(json.data?.answer || json.answer || "No response from AI.");
    } catch (err) {
      setAnswer("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bot size={32} className="text-purple-600" />
        <h1 className="text-2xl font-black text-gray-900">AI Assistant</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <textarea
          placeholder="Ask me anything about education, teaching, or school management!"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={askQuestion}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>

      {answer && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-gray-800 mb-2">Answer</h2>
          <div className="text-gray-700 whitespace-pre-line">{answer}</div>
        </div>
      )}
    </div>
  );
}
