// hooks/useVideos.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { extractErrorMessage } from "@/lib/api/errorMessage";
import { uploadVideoToStorage } from "@/lib/storage/clientUpload";
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
      // B12 rework: upload the bytes straight from the browser to Firebase
      // Storage (see lib/storage/clientUpload). Routing a multi-MB video
      // through the serverless function hits Vercel's 4.5 MB request-body
      // cap (413) and the function timeout — and the platform's structured
      // error body crashed the app via the toast (see errorMessage.ts).
      // The function now only receives the small metadata JSON + the
      // download URL, which the POST /video-lectures JSON branch accepts.
      const file = formData.get("file") as File | null;
      if (!file) throw new Error("A video file is required.");
      const videoUrl = await uploadVideoToStorage(file, tenantId);
      return apiClient.post(
        "/video-lectures",
        {
          title: String(formData.get("title") || ""),
          description: String(formData.get("description") || ""),
          classGrade: String(formData.get("classGrade") || ""),
          subject: String(formData.get("subject") || ""),
          videoUrl,
        },
        { timeout: 120000 }
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["videos"] });
      await queryClient.refetchQueries({ queryKey: ["videos"] });
      showToast("Video lecture uploaded successfully!", "success");
    },
    onError: (err: any) => {
      // B12 rework: the toast message MUST be a string. The old code passed
      // err?.response?.data?.error straight through; Vercel platform errors
      // carry that field as an OBJECT, React threw rendering it, and the
      // whole app landed on the "Critical System Error" page.
      showToast(extractErrorMessage(err, "Failed to upload video lecture."), "error");
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
      // Same crash vector as the upload handler: coerce to a string first.
      showToast(extractErrorMessage(err, "Failed to delete video lecture."), "error");
    },
  });
};
