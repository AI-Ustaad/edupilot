// lib/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as Sentry from "@sentry/nextjs";
import { firebaseTokenProvider, TokenProvider } from "@/lib/auth/tokenProvider";

// 🌟 Tenant Provider Interface (آپ اسے Context کے ذریعے Inject کریں گے)
export interface TenantProvider {
  getTenantId(): string | null;
}

// 🚀 Enterprise Axios Instance
const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// 🛡️ Request Interceptor: Token, Tenant ID, اور Request ID (Tracing)
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // 1. Token Inject کریں
      const token = await firebaseTokenProvider.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. Tenant ID Inject کریں (یہ آپ کا AuthContext Provide کرے گا)
      const tenantId = (apiClient.defaults.headers as any)["x-tenant-id"];
      if (tenantId) {
        config.headers["x-tenant-id"] = tenantId;
      }

      // 3. Distributed Tracing کیلئے Request ID
      config.headers["x-request-id"] = crypto.randomUUID();
      
    } catch (err) {
      console.error("[API Client] Interceptor Error:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🛡️ Response Interceptor: Sentry Logging اور Refresh Token Logic
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Sentry پر Error Log بھیجیں
    Sentry.captureException(error);

    if (error.response) {
      const status = error.response.status;

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const auth = getAuth();
          if (auth.currentUser) {
            await auth.currentUser.getIdToken(true); // Force Refresh
            const newToken = await auth.currentUser.getIdToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error("[API Client] Token Refresh Failed. Logging out.");
          if (typeof window !== "undefined") window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
