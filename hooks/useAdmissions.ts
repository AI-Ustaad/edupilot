// hooks/useAdmissions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";
import { QueryKeys } from "@/lib/api/queryKeys";

export const usePendingAdmissions = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["admissions", tenantId, "pending"],
    queryFn: async () => {
      const res = await apiClient.get("/students");
      const allStudents = safeArray(res);
      return allStudents.filter((s: any) => !s.admissionStatus || s.admissionStatus === "pending");
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
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["admissions", tenantId, "pending"] });
      const previousAdmissions = queryClient.getQueryData(["admissions", tenantId, "pending"]);
      queryClient.setQueryData(["admissions", tenantId, "pending"], (old: any[]) =>
        old.filter((s: any) => s.id !== id)
      );
      return { previousAdmissions };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["admissions", tenantId, "pending"], context?.previousAdmissions);
      showToast("Failed to update admission status.", "error");
    },
    onSuccess: () => {
      showToast("Admission status updated successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["admissions", tenantId] });
      queryClient.invalidateQueries({ queryKey: QueryKeys.students(tenantId) });
    },
  });
};
