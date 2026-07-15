import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger/logger";

// 🚀 Enterprise Axios Instance (Session Cookie Based)
const apiClient = axios.create({
  baseURL: "/api/v1",
  // 🟢 CRITICAL: This automatically sends the HTTP-Only Session Cookie to the backend
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// 🛡️ Request Interceptor: Distributed Tracing ONLY
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      // 🟢 No more manual Token or TenantID injection here! 
      // Everything is securely handled by the backend session.

      // Distributed Tracing کیلئے Request ID
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        config.headers["x-request-id"] = crypto.randomUUID();
      }
    } catch (err) {
      logger.error("[API Client] Interceptor Error:", { metadata: { error: err } });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🛡️ Response Interceptor: Sentry Logging & Session Expiry
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    // Sentry پر Error Log بھیجیں
    Sentry.captureException(error);

    if (error.response) {
      const status = error.response.status;

      // 🟢 اگر کوکی ایکسپائر ہو گئی ہے یا انویلڈ ہے، تو سیدھا لاگ ان پر بھیجیں
      if (status === 401 || status === 403) {
        logger.warn("[API Client] Session expired or unauthorized. Redirecting to login.");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
