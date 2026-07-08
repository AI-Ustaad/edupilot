// hooks/useStaff.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

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

export const useStaffList = (page = 1, limit = 20) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: [...QueryKeys.staff(tenantId), "paginated", page, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/staff?page=${page}&limit=${limit}`);
      return response as any;
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

export const useStaffMember = (id: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: QueryKeys.staffMember(tenantId, id),
    queryFn: async () => {
      const response = await apiClient.get(`/staff/${id}`);
      return (response as any)?.data ?? response;
    },
    enabled: !!id && !!tenantId && tenantId !== "unknown",
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post("/staff", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.staff(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
      showToast("Staff member added successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Failed to add staff.", "error");
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiClient.put(`/staff/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.staff(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
      showToast("Staff member updated!", "success");
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Failed to update staff.", "error");
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/staff/${id}`);
    },
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: QueryKeys.staff(tenantId) });
      const previousStaff = queryClient.getQueryData(QueryKeys.staff(tenantId));

      queryClient.setQueryData(QueryKeys.staff(tenantId), (old: any[]) =>
        old?.filter((s: any) => s.id !== deletedId) ?? []
      );

      return { previousStaff };
    },
    onError: (err, deletedId, context) => {
      queryClient.setQueryData(QueryKeys.staff(tenantId), context?.previousStaff);
      showToast("Failed to delete staff.", "error");
    },
    onSuccess: () => {
      showToast("Staff member deleted.", "success");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.staff(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
    },
  });
};

export const useBulkImport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return apiClient.post("/staff/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.staff(tenantId) });
      queryClient.invalidateQueries({ queryKey: QueryKeys.dashboard(tenantId) });
      showToast(`Imported ${data?.imported ?? 0} staff members!`, "success");
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Bulk import failed.", "error");
    },
  });
};

export const useSearchStaff = (query: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: [...QueryKeys.staff(tenantId), "search", query],
    queryFn: async () => {
      const response = await apiClient.get(`/staff?search=${encodeURIComponent(query)}`);
      return safeArray(response);
    },
    enabled: !!query && query.length >= 2 && !!tenantId && tenantId !== "unknown",
  });
};

