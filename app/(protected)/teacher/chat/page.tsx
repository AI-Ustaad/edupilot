"use client";
import { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useToast } from "@/components/ToastProvider";
import apiClient from "@/lib/api/client";

export default function TeacherChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const { showToast } = useToast();

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newMessage = { text: input, sender: "me", time: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      await apiClient.post("/chat", { text: newMessage.text });
      showToast("Message sent", "success");
    } catch (err) {
      showToast("Failed to send message", "error");
    }
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.chat.send]}>
      <div className="max-w-4xl mx-auto p-4 md:p-6 h-[85vh] flex flex-col">
        <div className="bg-white border-b p-4 rounded-t-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Staff / Parent Chat</h1>
            <p className="text-xs text-green-500 font-bold">Online</p>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4 border-x border-gray-200">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 font-medium">
              Start a conversation...
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl ${msg.sender === "me" ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"}`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.sender === "me" ? "text-blue-200" : "text-gray-400"}`}>{msg.time}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white p-4 border rounded-b-2xl shadow-sm">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" disabled={!input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition disabled:opacity-50">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </RequirePermission>
  );
}
