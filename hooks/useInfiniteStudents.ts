// hooks/useInfiniteStudents.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";

export const useInfiniteStudents = (limit: number = 20) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";

  return useInfiniteQuery({
    queryKey: ["students", tenantId, "infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get(`/students?page=${pageParam}&limit=${limit}`);
      return {
        items: safeArray(res),
        nextPage: pageParam + 1,
        totalPages: 10, // Assume 10 pages for now, or get from API headers
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage <= lastPage.totalPages) return lastPage.nextPage;
      return undefined;
    },
    enabled: !!tenantId && tenantId !== "unknown",
  });
};
