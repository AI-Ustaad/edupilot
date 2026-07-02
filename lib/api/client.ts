// lib/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as Sentry from "@sentry/nextjs";
import { getAuth } from "firebase/auth"; // Firebase Client Auth

// 🚀 Enterprise Axios Instance
const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// 🛡️ Request Interceptor: Firebase Token اور Tenant ID Inject کرنا
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // 1. Firebase Live Token حاصل کریں
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. Tenant ID AuthContext سے حاصل کریں (Module level variable)
      // AuthContext اس کو runtime میں set کرے گا
      if (typeof window !== "undefined" && (window as any).__TENANT_ID__) {
        config.headers["x-tenant-id"] = (window as any).__TENANT_ID__;
      }
    } catch (err) {
      console.error("[API Client] Auth Token Error:", err);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 🛡️ Response Interceptor: Sentry Logging اور Refresh Token Logic
apiClient.interceptors.response.use(
  (response) => response.data, // سیدھا ڈیٹا Return کرے گا
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Sentry پر Error Log بھیجیں
    Sentry.captureException(error);

    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as any)?.message || "Server Error";

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Firebase Auth خودکار Refresh Token Handle کرتا ہے
          const auth = getAuth();
          if (auth.currentUser) {
            await auth.currentUser.getIdToken(true); // Force Refresh
            const newToken = await auth.currentUser.getIdToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest); // Request دوبارہ بھیجیں
          }
        } catch (refreshError) {
          console.error("[API Client] Token Refresh Failed. Logging out.");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      } else if (status === 403) {
        console.error("[API Client] Forbidden: Insufficient permissions.");
      } else if (status >= 500) {
        console.error("[API Client] Server Error:", message);
      }
    } else if (error.request) {
      console.error("[API Client] Network Error: No response received.");
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
