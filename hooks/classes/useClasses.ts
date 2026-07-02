// hooks/classes/useClasses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classService } from "@/services/class.service";
import { QueryKeys } from "@/lib/api/queryKeys";
import { useAuth } from "@/context/AuthContext"; // فرضی AuthContext

export const useClasses = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: QueryKeys.classes(tenantId),
    queryFn: () => classService.getAllClasses(),
    enabled: !!tenantId,
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useMutation({
    mutationFn: (data: { classGrade: string; sectionName: string }) => 
      classService.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.classes(tenantId) });
    },
  });
};
