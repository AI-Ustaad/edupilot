"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function AIChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      const reply = data?.reply || "Sorry, I couldn't process that.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <Bot className="text-primary" size={28} /> AI Assistant
      </h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto glass-card p-4 mb-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-900/40 text-center mt-10">
            Ask me anything about education, teaching, or school management!
          </p>
        )}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`p-2 rounded-full ${msg.role === "user" ? "bg-primary/20" : "bg-secondary/20"}`}>
              {msg.role === "user" ? <User size={18} className="text-primary" /> : <Bot size={18} className="text-secondary" />}
            </div>
            <div className={`glass-card p-3 max-w-[80%] ${msg.role === "user" ? "bg-primary/10" : "bg-white/5"}`}>
              <p className="text-gray-900 text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-900/50">
            <Loader2 className="animate-spin" size={16} /> Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          rows={2}
          className="flex-1 bg-white/10 border border-white/10 rounded-xl p-3 text-gray-900 placeholder-gray-40 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
        <button onClick={sendMessage} disabled={loading} className="btn-primary px-4 flex items-center gap-2 self-end">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
