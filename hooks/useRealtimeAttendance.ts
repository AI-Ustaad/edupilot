// hooks/useRealtimeAttendance.ts
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // آپ کا Firebase Client Instance
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/lib/logger/logger";
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";
import type { Attendance, AttendanceStatus } from "@/types/attendance";

export const useRealtimeAttendance = (classGrade: string, section: string, date: string) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<(Attendance & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.tenantId || !classGrade || !section || !date) {
      setRecords([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Real-time Query by tenantId and date to avoid Firestore compound index failures
    // and match documents regardless of legacy prefix differences (e.g. "Class Grade 10" vs "Class 10")
    const q = query(
      collection(db, "attendance"),
      where("tenantId", "==", user.tenantId),
      where("date", "==", date)
    );

    const normClass = formatClassLabel(classGrade).toLowerCase();
    const normSection = cleanSectionName(section).toLowerCase();

    // 🔄 Live Listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => {
          const raw = doc.data();
          const rawStatus = String(raw.status || "").toLowerCase();
          let status: AttendanceStatus = "Present";
          if (rawStatus === "absent") status = "Absent";
          else if (rawStatus === "late") status = "Late";
          else if (rawStatus === "leave") status = "Leave";
          else if (rawStatus === "halfday") status = "HalfDay";
          else if (rawStatus === "holiday") status = "Holiday";

          return {
            id: doc.id,
            ...raw,
            status,
          } as Attendance & { id: string };
        })
        .filter(doc => {
          const docClass = formatClassLabel(doc.classGrade).toLowerCase();
          const docSection = cleanSectionName(doc.section).toLowerCase();
          return (!normClass || docClass === normClass) && (!normSection || docSection === normSection);
        });

      setRecords(data);
      setIsLoading(false);
    }, (error) => {
      logger.error("Realtime attendance error:", { metadata: { error } });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.tenantId, classGrade, section, date]);

  return { data: records, isLoading };
};
