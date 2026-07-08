// hooks/useParents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

// 🔄 Fetch Parent Dashboard Data (Children List with Metrics)
export const useParentDashboard = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: ["parents", tenantId, "dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/parents/dashboard");
      return safeArray(res);
    },
    enabled: !!tenantId && tenantId !== "unknown" && user?.role === 'parent',
  });
};

// 🔄 Fetch All Parents (Admin)
export const useParents = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: QueryKeys.parents(tenantId),
    queryFn: async () => safeArray(await apiClient.get("/admin/parents")),
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

// ➕ Create Parent (Admin)
export const useCreateParent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: { email: string; password: string; fullName: string; phone?: string; studentIds: string[] }) =>
      apiClient.post("/admin/parents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.parents(tenantId) });
      showToast("Parent created successfully!", "success");
    },
    onError: () => showToast("Failed to create parent.", "error"),
  });
};

// 🗑️ Delete Parent (Admin)
export const useDeleteParent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (parentId: string) =>
      apiClient.delete(`/admin/parents/${parentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.parents(tenantId) });
      showToast("Parent deleted successfully!", "success");
    },
    onError: () => showToast("Failed to delete parent.", "error"),
  });
};

