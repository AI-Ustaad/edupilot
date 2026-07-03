// hooks/useRealtimeDashboard.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { QueryKeys } from "@/lib/api/queryKeys";

export const useRealtimeDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.tenantId) return;

    const tenantId = user.tenantId;
    
    // Students Count Live
    const studentsQuery = query(collection(db, "students"), where("tenantId", "==", tenantId));
    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      queryClient.setQueryData(QueryKeys.dashboard(tenantId), (oldData: any) => ({
        ...oldData,
        students: snapshot.size
      }));
    });

    // Cleanup listeners
    return () => {
      unsubStudents();
    };
  }, [user?.tenantId, queryClient]);
};
