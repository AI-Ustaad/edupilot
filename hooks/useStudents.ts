// hooks/useStudents.ts (Add useToast import)
import { useToast } from "@/components/ToastProvider";

// 🗑️ Delete Student (With Optimistic Update & Undo)
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/students/${id}`);
    },
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.students(tenantId) });
      
      const previousStudents = queryClient.getQueryData(QueryKeys.students(tenantId));
      
      // Optimistically remove from UI
      queryClient.setQueryData(QueryKeys.students(tenantId), (old: any[]) => 
        old.filter((s: any) => s.id !== deletedId)
      );
      
      return { previousStudents, deletedId };
    },
    onError: (err, deletedId, context) => {
      // Rollback on error
      queryClient.setQueryData(QueryKeys.students(tenantId), context?.previousStudents);
      showToast("Failed to delete student.", "error");
    },
    onSuccess: (_data, _deletedId, context) => {
      // Show Toast with Undo option
      showToast("Student deleted successfully.", "undo", () => {
        // Undo Logic: Restore the student in UI (Note: Actual DB restoration needs API support)
        // For now, we just restore it in the UI cache.
        queryClient.setQueryData(QueryKeys.students(tenantId), context?.previousStudents);
        showToast("Student restored.", "success");
        // Note: To permanently restore, you'd need an API call like: apiClient.post(`/students/restore?id=${context?.deletedId}`)
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.students(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};
