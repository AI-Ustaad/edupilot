// hooks/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray, safeObject } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

// 1. Academic Year
export const useAcademicYears = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["academicYears", tenantId],
    queryFn: async () => safeArray(await apiClient.get("/academic-year")),
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

export const useSaveAcademicYear = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => apiClient.post("/academic-year", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academicYears", tenantId] });
      showToast("Academic Year saved successfully!", "success");
    },
    onError: () => showToast("Failed to save Academic Year.", "error"),
  });
};

// 3. Audit Logs
export const useAuditLogs = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["audit", tenantId],
    queryFn: async () => safeArray(await apiClient.get("/audit")),
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

// 4. Buses
export const useBuses = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["buses", tenantId],
    queryFn: async () => safeArray(await apiClient.get("/buses")),
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

export const useSaveBus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => apiClient.post("/buses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses", tenantId] });
      showToast("Bus added successfully!", "success");
    },
    onError: () => showToast("Failed to add bus.", "error"),
  });
};

// 5. Users & Roles
export const useUsers = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["users", tenantId],
    queryFn: async () => safeArray(await apiClient.get("/admin/users")),
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async ({ uid, role }: { uid: string; role: string }) => 
      apiClient.post("/admin/users/role", { uid, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", tenantId] });
      showToast("User role updated successfully!", "success");
    },
    onError: () => showToast("Failed to update role.", "error"),
  });
};

// 6. White Label (Branding)
export const useBranding = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["branding", tenantId],
    queryFn: async () => safeObject(await apiClient.get("/settings/whitelabel")),
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

export const useUpdateBranding = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (data: any) => apiClient.put("/settings/whitelabel", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branding", tenantId] });
      showToast("Branding updated successfully!", "success");
    },
    onError: () => showToast("Failed to update branding.", "error"),
  });
};

// 7. Promote Students
export const usePromoteStudents = () => {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async () => apiClient.post("/students/promote", {}),
    onSuccess: () => showToast("Students promoted successfully!", "success"),
    onError: () => showToast("Failed to promote students.", "error"),
  });
};

// 8. 🚀 Feature Flags Hook
export const useFeatureFlags = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["featureFlags", user?.tenantId],
    queryFn: async () => safeObject(await apiClient.get("/admin/feature-flags")),
    enabled: !!user?.tenantId,
  });
};

// 🚀 Toggle Feature Flag Mutation
export const useToggleFeatureFlag = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { feature: string; enabled: boolean }) => {
      return apiClient.post("/admin/feature-flags", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureFlags", user?.tenantId] });
      showToast("Feature updated successfully!", "success");
    },
    onError: () => showToast("Failed to update feature.", "error"),
  });
};
