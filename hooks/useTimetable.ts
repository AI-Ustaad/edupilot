// hooks/useTimetable.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

// 🔄 Fetch Timetable
export const useTimetable = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: ["timetable", tenantId],
    queryFn: async () => {
      const res = await apiClient.get("/timetable");
      return safeArray(res);
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

// ✨ Create Timetable Entry
export const useCreateTimetableEntry = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post("/timetable", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable", tenantId] });
      showToast("Timetable entry added successfully!", "success");
    },
    onError: () => {
      showToast("Failed to add timetable entry.", "error");
    },
  });
};

// 🗑️ Delete Timetable Entry
export const useDeleteTimetableEntry = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/timetable?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable", tenantId] });
    },
  });
};
