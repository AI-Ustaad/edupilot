// hooks/useChat.ts
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/lib/logger/logger";

// 🔄 Real-time Chat Listener
export const useRealtimeChat = (otherUserId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !otherUserId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // ایک منفرد Chat ID بنائیں (دونوں یوزرز کے IDs کو Sort کر کے)
    const chatId = [user.uid, otherUserId].sort().join("_");

    const q = query(
      collection(db, "chat_messages"),
      where("chatId", "==", chatId),
      where("tenantId", "==", user.tenantId),
      orderBy("createdAt", "asc")
    );

    // 🚀 Live Listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      logger.error("Chat listener error:", { metadata: { error } });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, otherUserId]);

  return { messages, loading };
};

// ✨ Send Message Mutation
export const useSendMessage = () => {
  const { user } = useAuth();

  const sendMessage = async (receiverId: string, text: string) => {
    if (!user?.uid || !text.trim()) return;

    const chatId = [user.uid, receiverId].sort().join("_");

    await addDoc(collection(db, "chat_messages"), {
      chatId,
      senderId: user.uid,
      senderRole: user.role,
      receiverId,
      text: text.trim(),
      tenantId: user.tenantId,
      createdAt: serverTimestamp(),
    });
  };

  return { sendMessage };
};
