// hooks/useExams.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

// 🔄 Fetch Marks by Class, Section, Term, Subject
export const useMarks = (classGrade: string, section: string, term: string, subject: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    // Marks کا اپنا الگ Cache Key ہے
    queryKey: ["marks", tenantId, classGrade, section, term, subject],
    queryFn: async () => {
      if (!classGrade || !section || !term || !subject) return [];
      const res = await apiClient.get("/marks", { params: { classGrade, section, term, subject } });
      return safeArray(res);
    },
    enabled: !!tenantId && !!classGrade && !!section && !!term && !!subject,
  });
};

// ✨ Save Single or Bulk Marks
export const useSaveMarks = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post("/marks", data);
    },
    onSuccess: (_data, variables) => {
      // جب Marks Save ہوں، تو Marks اور Dashboard کا Cache ریفریش ہو
      queryClient.invalidateQueries({ 
        queryKey: ["marks", tenantId, variables.classGrade, variables.section, variables.term, variables.subject] 
      });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};

// 🗑️ Delete Mark
export const useDeleteMark = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/marks?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks", tenantId] });
    },
  });
};
