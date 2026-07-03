// hooks/useRealtimeNotifications.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase"; // آپ کا Firebase Client Instance
import { useAuth } from "@/context/AuthContext";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useToast } from "@/components/ToastProvider";

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user?.tenantId) return;

    // Notifications Collection کا Query
    const q = query(
      collection(db, "notifications"),
      where("tenantId", "==", user.tenantId),
      orderBy("createdAt", "desc")
    );

    // 🔄 Real-time Listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // React Query Cache کو فوراً اپڈیٹ کریں
      queryClient.setQueryData(["notifications", user.tenantId], notifications);
      
      // اگر کوئی نیا پیغام آئے تو Toast دکھائیں
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && change.doc.data().createdAt?.seconds > Date.now() / 1000 - 5) {
          showToast(change.doc.data().message, "info");
        }
      });
    }, (error) => {
      console.error("Realtime notifications error:", error);
    });

    // Component Unmount ہونے پر Listener بند کر دیں
    return () => unsubscribe();
  }, [user?.tenantId, queryClient, showToast]);
};
