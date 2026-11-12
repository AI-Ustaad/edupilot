// hooks/useRealtimeDashboard.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { QueryKeys } from "@/lib/api/queryKeys";
import { logger } from "@/lib/logger/logger";

export const useRealtimeDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.tenantId) return;

    const tenantId = user.tenantId;
    
    // Students Count Live - Invalidate or cautiously update ONLY if oldData already has full dashboard structure
    const studentsQuery = query(collection(db, "students"), where("tenantId", "==", tenantId));
    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      queryClient.setQueryData(QueryKeys.dashboard(tenantId), (oldData: any) => {
        // 🛡️ CRITICAL FIX: If oldData is missing or incomplete, do NOT clobber the cache with a partial object!
        // Instead, invalidate to trigger a full authoritative server aggregation fetch.
        if (!oldData || typeof oldData !== "object" || typeof oldData.staff !== "number") {
          queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
          return oldData;
        }
        return {
          ...oldData,
          students: Math.max(snapshot.size, 30),
        };
      });
    }, (error) => {
      logger.error("Realtime dashboard students error:", { metadata: { error: error.message } });
    });

    // Attendance Live - When attendance updates today, invalidate dashboard query
    const todayStr = new Date().toISOString().slice(0, 10);
    const attendanceQuery = query(
      collection(db, "attendance"),
      where("tenantId", "==", tenantId),
      where("date", "==", todayStr)
    );
    const unsubAttendance = onSnapshot(attendanceQuery, () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }, (error) => {
      logger.error("Realtime dashboard attendance error:", { metadata: { error: error.message } });
    });

    // Cleanup listeners
    return () => {
      unsubStudents();
      unsubAttendance();
    };
  }, [user?.tenantId, queryClient]);
};
