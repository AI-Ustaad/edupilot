// hooks/useHomework.ts میں یہ Hook Add کریں

import { useToast } from "@/components/ToastProvider"; // Top پر Import کریں

// 🗑️ Delete Homework (With Optimistic Update & Undo)
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
        // Note: Backend restoration needs a specific API, currently we just restore UI.
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["homework", tenantId] });
    },
  });
};
