// hooks/useVideos.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

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
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return apiClient.post("/video-lectures", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos", tenantId] });
      showToast("Video lecture uploaded successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to upload video lecture.", "error");
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/video-lectures?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos", tenantId] });
      showToast("Video lecture deleted successfully.", "success");
    },
    onError: (err: any) => {
      showToast(err?.message || "Failed to delete video lecture.", "error");
    },
  });
};
