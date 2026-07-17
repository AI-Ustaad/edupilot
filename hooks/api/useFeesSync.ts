import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import apiClient from "@/lib/api/client";
import { useRuntimeStore } from "@/lib/store/runtime.store";

export const useFeesSync = (studentId: string | null) => {
  const hydrateStudentFees = useRuntimeStore((state) => state.hydrateStudentFees);

  const query = useQuery({
    queryKey: ["enterprise-fees-sync", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      // 🟢 API Call: Fetching fee stats and ledgers for this specific student
      const res = await apiClient.get(`/fees/stats/${studentId}`);
      return res.data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });

  // 🚀 Injecting into Kernel
  useEffect(() => {
    if (studentId && query.data && query.isSuccess) {
      hydrateStudentFees(studentId, {
        totalDue: query.data.totalDue || 0,
        totalPaid: query.data.totalPaid || 0,
        outstanding: query.data.outstanding || 0,
        records: query.data.records || [],
      });
    }
  }, [studentId, query.data, query.isSuccess, hydrateStudentFees]);

  return {
    isSyncingFees: query.isLoading,
  };
};
