"use client";
import { useState } from "react";
import { Loader2, Send, Bot } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// 🚀 Layered Architecture Hook
import { useAskChatbot } from "@/hooks/useAI";

export default function AIChatbotPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  
  const askMutation = useAskChatbot();

  const askQuestion = async () => {
    if (!question.trim()) return;
    setAnswer("");
    
    askMutation.mutate(question, {
      onSuccess: (data) => {
        setAnswer(data?.answer || "No response from AI.");
      },
      onError: () => {
        setAnswer("Network error or AI service is down. Please try again.");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <Bot size={36} className="text-purple-600" />
        <div>
          <h1 className="text-2xl font-black text-gray-900">AI Assistant</h1>
          <p className="text-gray-500 text-sm">Your personal school management AI companion.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-4">
        <textarea
          placeholder="Ask me anything about education, teaching, or school management..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        
        <RequirePermission permissions={[PERMISSIONS.chat.send]}>
          <button
            onClick={askQuestion}
            disabled={askMutation.isPending || !question.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 w-full sm:w-auto"
          >
            {askMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {askMutation.isPending ? "Thinking..." : "Ask AI"}
          </button>
        </RequirePermission>
      </div>

      {answer && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 shadow-inner animate-fade-in">
          <h2 className="font-black text-purple-900 mb-3 border-b border-purple-200 pb-2 flex items-center gap-2">
            <Bot size={20} /> AI Response
          </h2>
          <div className="text-purple-900 leading-relaxed whitespace-pre-line font-medium">{answer}</div>
        </div>
      )}
    </div>
  );
}
