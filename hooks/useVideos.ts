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
      // NOTE: Do not set Content-Type manually so the browser/Axios properly attaches multipart boundary
      // B12: video files are multi-MB — the shared 15s client timeout is
      // too short for the browser -> API route -> Cloud Storage round trip.
      return apiClient.post("/video-lectures", formData, { timeout: 120000 });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["videos"] });
      await queryClient.refetchQueries({ queryKey: ["videos"] });
      showToast("Video lecture uploaded successfully!", "success");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to upload video lecture.";
      showToast(msg, "error");
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["videos"] });
      await queryClient.refetchQueries({ queryKey: ["videos"] });
      showToast("Video lecture deleted successfully.", "success");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to delete video lecture.";
      showToast(msg, "error");
    },
  });
};
