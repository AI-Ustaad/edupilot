// hooks/useAttendance.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

export const useAttendance = (classGrade: string, section: string, date: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: QueryKeys.attendance(tenantId, classGrade, section, date),
    queryFn: async () => {
      if (!classGrade || !section || !date) return [];
      const res = await apiClient.get("/attendance", { params: { classGrade, section, date } });
      return safeArray(res);
    },
    enabled: !!tenantId && !!classGrade && !!section && !!date,
  });
};

export const useSaveAttendance = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post("/attendance", data);
    },
    onSuccess: (_data, variables) => {
      // جب Attendance Save ہو، تو Dashboard اور اسی Date کی Attendance ریفریش ہو
      queryClient.invalidateQueries({
        queryKey: QueryKeys.attendance(tenantId, variables.classGrade, variables.section, variables.date)
      });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};
