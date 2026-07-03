// hooks/useStaff.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";

// 1. 🔄 Fetch All Staff
export const useStaff = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: QueryKeys.staff(tenantId),
    queryFn: async () => {
      const response = await apiClient.get("/staff");
      return safeArray(response);
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

// 2. ✨ Create Staff
export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post("/staff", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.staff(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};

// 3. ✏️ Update Staff
export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiClient.put(`/staff/${id}`, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.staff(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.staffMember(tenantId, variables.id) });
    },
  });
};

// 4. 🗑️ Delete Staff (With Optimistic Update)
export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/staff/${id}`);
    },
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.staff(tenantId) });
      
      const previousStaff = queryClient.getQueryData(QueryKeys.staff(tenantId));
      
      // Optimistically remove from UI
      queryClient.setQueryData(QueryKeys.staff(tenantId), (old: any[]) => 
        old.filter((s: any) => s.id !== deletedId)
      );
      
      return { previousStaff };
    },
    onError: (err, deletedId, context) => {
      // Rollback on error
      queryClient.setQueryData(QueryKeys.staff(tenantId), context?.previousStaff);
    },
    onSettled: () => {
      // Sync with server at the end
      queryClient.invalidateQueries({ queryKey: QueryKeys.staff(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};
