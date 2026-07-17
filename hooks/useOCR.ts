// hooks/useOCR.ts
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { useToast } from "@/components/ToastProvider";

export const useOCR = () => {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (file: File): Promise<any> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/v1/staff/ocr", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "OCR extraction failed");
      }

      return json.data;
    },
    onError: (err: any) => {
      showToast(err.message || "OCR extraction failed.", "error");
    },
  });
};

export const useOCRUpload = () => {
  const ocrMutation = useOCR();

  const handleOCRUpload = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,application/pdf";

      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return reject(new Error("No file selected"));

        try {
          const data = await ocrMutation.mutateAsync(file);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };

      input.click();
    });
  };

  return {
    handleOCRUpload,
    isProcessing: ocrMutation.isPending,
    error: ocrMutation.error,
  };
};
