"use client";
import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useStudents } from "@/hooks/useStudents";
import { useRealtimeChat, useSendMessage } from "@/hooks/useChat";

export default function TeacherChatPage() {
  const { data: students = [] } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🚀 Live Chat Hook (Parent ID کے ساتھ)
  const { messages, loading } = useRealtimeChat(selectedStudent?.parentId || "");
  const { sendMessage } = useSendMessage();

  // جب نیا میسج آئے تو خود بخول نیچے Scroll کرے
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedStudent) return;
    
    const msgText = input;
    setInput(""); // Input فوراً خالی کر دیں (Optimistic)
    
    try {
      await sendMessage(selectedStudent.parentId, msgText);
    } catch (err) {
      alert("Failed to send message");
    }
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.chat.send]}>
      <div className="max-w-5xl mx-auto p-4 md:p-6 h-[85vh] flex bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Sidebar: Students List */}
        <div className={`w-full md:w-72 border-r border-gray-100 flex-col ${selectedStudent ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h1 className="font-bold text-gray-900 flex items-center gap-2"><MessageSquare size={20} /> Parents Chat</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {students.map((s: any) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-50 text-left ${selectedStudent?.id === s.id ? 'bg-blue-50' : ''}`}
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  {s.fullName?.charAt(0) || "S"}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{s.fullName}</p>
                  <p className="text-xs text-gray-500">Parent: {s.guardianName || s.fatherName || "N/A"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col ${selectedStudent ? 'flex' : 'hidden md:flex'}`}>
          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                <button onClick={() => setSelectedStudent(null)} className="md:hidden text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                  {selectedStudent.guardianName?.charAt(0) || "P"}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{selectedStudent.guardianName || selectedStudent.fatherName || "Parent"}</h2>
                  <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-3">
                {loading ? (
                  <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 font-medium">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderRole === "teacher" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${msg.senderRole === "teacher" ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.senderRole === "teacher" ? "text-blue-200" : "text-gray-400"}`}>
                          {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "..."}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
              Select a student to start chatting with their parent.
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
}
