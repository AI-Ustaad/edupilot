import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import apiClient from "@/lib/api/client";
import { useRuntimeStore } from "@/lib/store/runtime.store";

export const useAttendanceSync = (studentId: string | null) => {
  const hydrateStudentAttendance = useRuntimeStore((state) => state.hydrateStudentAttendance);

  const query = useQuery({
    queryKey: ["enterprise-attendance-sync", studentId],
    queryFn: async () => {
      if (!studentId) return null;
      // 🟢 API Call: Fetching attendance stats for this specific student
      const res = await apiClient.get(`/attendance/stats/${studentId}`);
      return res.data; 
    },
    enabled: !!studentId, // صرف تب چلے گا جب studentId موجود ہو
    staleTime: 5 * 60 * 1000, // 5 منٹ تک دوبارہ API ہٹ نہیں ہوگی
  });

  // 🚀 The Magic: Injecting fetched data into the O(1) Normalized Store
  useEffect(() => {
    if (studentId && query.data && query.isSuccess) {
      hydrateStudentAttendance(studentId, {
        present: query.data.present || 0,
        absent: query.data.absent || 0,
        late: query.data.late || 0,
        percentage: query.data.percentage || 0,
      });
    }
  }, [studentId, query.data, query.isSuccess, hydrateStudentAttendance]);

  return {
    isSyncingAttendance: query.isLoading,
  };
};
