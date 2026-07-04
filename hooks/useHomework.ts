// hooks/useHomework.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

// 1. 🔄 Fetch All Homework
export const useHomework = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["homework", tenantId],
    queryFn: async () => safeArray(await apiClient.get("/homework")),
  });
};

// 2. ✨ Create Homework
export const useCreateHomework = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => apiClient.post("/homework", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homework", tenantId] });
      showToast("Homework posted successfully!", "success");
    },
    onError: () => showToast("Failed to post homework.", "error"),
  });
};

// 3. 🗑️ Delete Homework (With Optimistic Update & Undo)
export const useDeleteHomework = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/homework?id=${id}`);
    },
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ["homework", tenantId] });
      
      const previousHomework = queryClient.getQueryData(["homework", tenantId]);
      
      // Optimistically remove from UI
      queryClient.setQueryData(["homework", tenantId], (old: any[]) => 
        old.filter((h: any) => h.id !== deletedId)
      );
      
      return { previousHomework };
    },
    onError: (err, deletedId, context) => {
      // Rollback on error
      queryClient.setQueryData(["homework", tenantId], context?.previousHomework);
      showToast("Failed to delete homework.", "error");
    },
    onSuccess: (_data, _deletedId, context) => {
      // Show Toast with Undo option
      showToast("Homework deleted successfully.", "undo", () => {
        // Undo Logic: Restore in UI
        queryClient.setQueryData(["homework", tenantId], context?.previousHomework);
        showToast("Homework restored.", "success");
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["homework", tenantId] });
    },
  });
};
