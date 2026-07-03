// hooks/useVideos.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";

export const useVideos = (classGrade?: string, subject?: string) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useQuery({
    queryKey: ["videos", tenantId, classGrade, subject],
    queryFn: async () => safeArray(await apiClient.get("/video-lectures", { params: { classGrade, subject } })),
  });
};

export const useUploadVideo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return apiClient.post("/video-lectures", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos", tenantId] }),
  });
};
