// hooks/useSchool.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeObject } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";

export const useSchool = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useQuery({
    queryKey: ["school", tenantId],
    queryFn: async () => {
      const result = safeObject(await apiClient.get("/settings/school-configuration"));
      const configuration = result.configuration || {};
      return {
        ...configuration,
        classes: configuration.academicStructure?.classes?.map((item: any) => ({ name: item.name, sections: configuration.academicStructure?.sectionNames || [] })) || [],
        subjects: configuration.academicStructure?.subjects || [],
      };
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};
