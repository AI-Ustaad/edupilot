export const dynamic = 'force-dynamic';
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Send, User } from "lucide-react";

interface Message {
  id: string;
  teacherId: string;
  parentId: string;
  text: string;
  senderRole: string;
  createdAt: any;
}

export default function ParentChatPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // فرض کریں کہ ایک API ہے جو اس اسکول کے اساتذہ کی فہرست دیتی ہے
    fetch("/api/staff")
      .then(res => res.json())
      .then(data => setTeachers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoadingTeachers(false));
  }, []);

  useEffect(() => {
    if (selectedTeacherId && user?.uid) {
      fetch(`/api/chat?teacherId=${selectedTeacherId}&parentId=${user.uid}`)
        .then(res => res.json())
        .then(data => setMessages(Array.isArray(data) ? data : []))
        .catch(console.error);
    } else {
      setMessages([]);
    }
  }, [selectedTeacherId, user?.uid]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedTeacherId || !user?.uid) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          parentId: user.uid,
          text: newMsg.trim(),
        }),
      });
      if (res.ok) {
        setNewMsg("");
        const refetch = await fetch(`/api/chat?teacherId=${selectedTeacherId}&parentId=${user.uid}`);
        const data = await refetch.json();
        setMessages(Array.isArray(data) ? data : []);
      } else {
        alert("Failed to send message");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSending(false);
    }
  };

  if (loadingTeachers) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-[calc(100vh-120px)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Teacher Chat</h1>
      <div className="flex gap-4 flex-1 overflow-hidden">
        <div className="w-64 bg-white border border-gray-200 rounded-xl p-3 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Teachers</h2>
          {teachers.map((t: any) => (
            <button
              key={t.id}
              onClick={() => setSelectedTeacherId(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${
                selectedTeacherId === t.id ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t.personal?.fullName || t.email || "Unknown"}
            </button>
          ))}
          {teachers.length === 0 && <p className="text-gray-400 text-sm">No teachers found.</p>}
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col">
          {!selectedTeacherId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Select a teacher to start chat</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderRole === "parent" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      msg.senderRole === "parent" ? "bg-purple-100 text-gray-900" : "bg-gray-100 text-gray-900"
                    }`}>
                      <p>{msg.text}</p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {new Date(msg.createdAt?.toDate?.()).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-gray-400">No messages yet. Start the conversation!</p>
                )}
              </div>
              <div className="p-3 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 bg-white border border-gray-300 rounded-xl p-2 text-sm"
                />
                <button onClick={handleSend} disabled={sending || !newMsg.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition disabled:opacity-50">
                  <Send size={16} /> {sending ? "..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
