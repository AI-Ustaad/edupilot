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

export default function TeacherChatPage() {
  const { user } = useAuth();
  const [parents, setParents] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loadingParents, setLoadingParents] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/parents")
      .then(res => res.json())
      .then(data => setParents(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoadingParents(false));
  }, []);

  useEffect(() => {
    if (selectedParentId && user?.uid) {
      fetch(`/api/chat?teacherId=${user.uid}&parentId=${selectedParentId}`)
        .then(res => res.json())
        .then(data => setMessages(Array.isArray(data) ? data : []))
        .catch(console.error);
    } else {
      setMessages([]);
    }
  }, [selectedParentId, user?.uid]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedParentId || !user?.uid) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: user.uid,
          parentId: selectedParentId,
          text: newMsg.trim(),
        }),
      });
      if (res.ok) {
        setNewMsg("");
        // تازہ ترین پیغامات لوڈ کریں
        const refetch = await fetch(`/api/chat?teacherId=${user.uid}&parentId=${selectedParentId}`);
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

  if (loadingParents) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-[calc(100vh-120px)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Parent Chat</h1>
      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* والدین کی فہرست */}
        <div className="w-64 bg-white border border-gray-200 rounded-xl p-3 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Parents</h2>
          {parents.map((p: any) => (
            <button
              key={p.uid || p.id}
              onClick={() => setSelectedParentId(p.uid || p.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${
                selectedParentId === (p.uid || p.id) ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p.fullName || p.email || "Unknown"}
            </button>
          ))}
          {parents.length === 0 && <p className="text-gray-400 text-sm">No parents found.</p>}
        </div>

        {/* چیٹ ایریا */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col">
          {!selectedParentId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">Select a parent to start chat</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderRole === "teacher" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      msg.senderRole === "teacher" ? "bg-blue-100 text-gray-900" : "bg-gray-100 text-gray-900"
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
