// hooks/useRealtimeAttendance.ts
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // آپ کا Firebase Client Instance
import { useAuth } from "@/context/AuthContext";

export const useRealtimeAttendance = (classGrade: string, section: string, date: string) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.tenantId || !classGrade || !section || !date) {
      setRecords([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Real-time Query
    const q = query(
      collection(db, "attendance"),
      where("tenantId", "==", user.tenantId),
      where("classGrade", "==", classGrade),
      where("section", "==", section),
      where("date", "==", date)
    );

    // 🔄 Live Listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Realtime attendance error:", error);
      setIsLoading(false);
    });

    // Component Unmount ہونے پر Listener بند کر دیں
    return () => unsubscribe();
  }, [user?.tenantId, classGrade, section, date]);

  return { data: records, isLoading };
};
