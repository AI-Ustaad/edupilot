"use client";
import { useState, useEffect } from "react";
import { Send, User, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function ParentChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    // Add logic to send message to teachers/admin
    setMessages([...messages, { text: input, sender: "parent", time: new Date().toLocaleTimeString() }]);
    setInput("");
    setLoading(false);
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.parents.view]}>
      <div className="max-w-4xl mx-auto p-4 md:p-6 h-[85vh] flex flex-col">
        <div className="bg-white border-b p-4 rounded-t-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">School Administration</h1>
            <p className="text-xs text-green-500 font-bold">Online</p>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4 border-x border-gray-200">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 font-medium">
              Start a conversation with the school...
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "parent" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl ${msg.sender === "parent" ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.sender === "parent" ? "text-blue-200" : "text-gray-400"}`}>{msg.time}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white p-4 border rounded-b-2xl">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition disabled:opacity-50">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </RequirePermission>
  );
}
