// hooks/useReports.ts
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

// 📄 Generate PDF Report Card (Opens in new tab)
export const useGenerateReportCard = () => {
  return useMutation({
    mutationFn: async ({ studentId, term }: { studentId: string; term: string }) => {
      // Axios `responseType: 'blob'` کے ذریعے PDF File Download کرے گا
      const response = await apiClient.get(`/reports/generate`, {
        params: { studentId, term },
        responseType: "blob",
      });
      return response;
    },
    onSuccess: (data: any) => {
      // PDF کو Browser میں Open کرنے کے لیے URL بنائیں
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    },
  });
};

// 📊 Export Data to CSV
export const useExportCSV = () => {
  return useMutation({
    mutationFn: async ({ endpoint, params }: { endpoint: string; params?: any }) => {
      const res = await apiClient.get(endpoint, { params, responseType: "blob" });
      return res;
    },
    onSuccess: (data: any, variables) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${variables.endpoint}_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
};
