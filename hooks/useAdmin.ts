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

// 2. Admissions
export const usePendingAdmissions = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["admissions", tenantId, "pending"],
    queryFn: async () => {
      const res = await apiClient.get("/students?admissionStatus=pending");
      return safeArray(res);
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};

export const useUpdateAdmissionStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => 
      apiClient.put("/admissions/approve", { studentId: id, status }),
    
    // 🚀 Optimistic Update: کلک کرتے ہی UI سے ہٹا دو
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["admissions", tenantId, "pending"] });
      
      const previousAdmissions = queryClient.getQueryData(["admissions", tenantId, "pending"]);
      
      queryClient.setQueryData(["admissions", tenantId, "pending"], (old: any[]) => 
        old.filter((s: any) => s.id !== id)
      );
      
      return { previousAdmissions };
    },
    
    onError: (err, variables, context) => {
      // اگر Backend Fail ہو تو واپس لسٹ میں لے آو
      queryClient.setQueryData(["admissions", tenantId, "pending"], context?.previousAdmissions);
      showToast("Failed to update admission status.", "error");
    },
    
    onSuccess: () => {
      showToast("Admission status updated successfully.", "success");
      // Backend کے ساتھ Sync کرنے کے لیے Refetch
      queryClient.invalidateQueries({ queryKey: ["admissions", tenantId] });
    },
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
