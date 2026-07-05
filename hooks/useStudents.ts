// hooks/useStudents.ts کے اندر موجود useStudents کو اس سے Replace کریں

export const useStudents = (params?: { classGrade?: string; section?: string }) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: [...QueryKeys.students(tenantId), params],
    queryFn: async () => {
      try {
        const queryString = new URLSearchParams(params as any).toString();
        const url = `/students${queryString ? `?${queryString}` : ""}`;
        const response = await apiClient.get(url);
        
        // 🛡️ Bulletproof Array Extraction
        let data = Array.isArray(response) ? response : (response?.data || []);
        if (!Array.isArray(data)) data = []; // Agar phir bhi array na ho, to khali array return karein
        
        return data;
      } catch (error) {
        console.error("Failed to fetch students:", error);
        return []; // Error ki soorat mein khali array return karein
      }
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};
