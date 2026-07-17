import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import apiClient from "@/lib/api/client";
import { useRuntimeStore } from "@/lib/store/runtime.store";
import { StudentEntity } from "@/entities/student.entity";

export const useStudentSync = (campusId?: string) => {
  const hydrateStudents = useRuntimeStore((state) => state.hydrateStudents);

  const query = useQuery({
    queryKey: ["enterprise-students-sync", campusId],
    queryFn: async () => {
      // 🟢 API Call: Fetching all active students for the campus
      const res = await apiClient.get(`/students?campusId=${campusId || "default"}`);
      return res.data?.students as StudentEntity[];
    },
    staleTime: 10 * 60 * 1000, // 10 منٹ تک دوبارہ API ہٹ نہیں ہوگی
    refetchOnWindowFocus: false,
  });

  // 🚀 The Magic: Injecting fetched data into the O(1) Normalized Store
  useEffect(() => {
    if (query.data && query.isSuccess) {
      hydrateStudents(query.data);
    }
  }, [query.data, query.isSuccess, hydrateStudents]);

  return {
    isSyncing: query.isLoading,
    isError: query.isError,
    lastSync: query.dataUpdatedAt,
  };
};
