// hooks/useRealtimeNotifications.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { logger } from "@/lib/logger/logger";

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user?.tenantId) return;

    // 🛡️ orderBy ہٹا دیا گیا ہے تاکہ Index کی ضرورت نہ پڑے
    const q = query(
      collection(db, "notifications"),
      where("tenantId", "==", user.tenantId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // ڈیٹا نکالیں اور Memory میں Sort کریں
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // createdAt کے مطابق Sort کرنا (نیا سب سے اوپر)
      notifications.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      // React Query Cache کو اپ ڈیٹ کریں
      queryClient.setQueryData(["notifications", user.tenantId], notifications);
      
      // نیا پیغام آئے تو Toast دکھائیں
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && change.doc.data().createdAt?.seconds > Date.now() / 1000 - 5) {
          showToast(change.doc.data().message, "info");
        }
      });
    }, (error) => {
      // اگر پھر بھی Permission کی Error آئے تو خاموش رہیں (Console میں دکھائیں)
      logger.error("Realtime notifications error:", { metadata: { error: error.message } });
    });

    return () => unsubscribe();
  }, [user?.tenantId, queryClient, showToast]);
};
