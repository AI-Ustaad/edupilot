// hooks/useAttendance.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";
import type { MarkAttendanceInput } from "@/validators/attendance";
import type { Attendance } from "@/types/attendance";

// 🔄 Fetch Attendance by Class, Section, Date
export const useAttendance = (classGrade: string, section: string, date: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery<Attendance[]>({
    queryKey: QueryKeys.attendance(tenantId, classGrade, section, date),
    queryFn: async () => {
      if (!classGrade || !section || !date) return [];
      const res = await apiClient.get("/attendance", { params: { classGrade, section, date } });
      return safeArray(res);
    },
    enabled: !!tenantId && !!classGrade && !!section && !!date,
  });
};

// ✨ Save Attendance
export const useSaveAttendance = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (data: MarkAttendanceInput | MarkAttendanceInput[]) => {
      return apiClient.post("/attendance", data);
    },
    onSuccess: (_data, variables) => {
      // جب Attendance Save ہو، تو اسی Date کی Attendance اور Dashboard ریفریش ہو
      const firstRecord = Array.isArray(variables) ? variables[0] : variables;
      queryClient.invalidateQueries({
        queryKey: QueryKeys.attendance(tenantId, firstRecord.classGrade, firstRecord.section, firstRecord.date)
      });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};
