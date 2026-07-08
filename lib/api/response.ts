// lib/api/response.ts
// Standardized API response builder with traceId and timestamp

function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export interface ApiResponseOptions {
  message?: string;
  errors?: any[];
  meta?: Record<string, any>;
  traceId?: string;
}

export function createSuccessResponse<T = any>(
  data: T,
  options?: ApiResponseOptions
) {
  return new Response(
    JSON.stringify({
      success: true,
      message: options?.message ?? "Success",
      data,
      errors: options?.errors ?? null,
      meta: options?.meta ?? null,
      traceId: options?.traceId ?? generateTraceId(),
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function createErrorResponse(
  statusCode: number,
  message: string,
  errors?: any[],
  options?: ApiResponseOptions
) {
  return new Response(
    JSON.stringify({
      success: false,
      message,
      data: null,
      errors: errors ?? null,
      meta: options?.meta ?? null,
      traceId: options?.traceId ?? generateTraceId(),
      timestamp: new Date().toISOString(),
    }),
    {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export function createApiResponse<T = any>(
  statusCode: number,
  data: T,
  message?: string,
  meta?: Record<string, any>
) {
  return new Response(
    JSON.stringify({
      success: statusCode >= 200 && statusCode < 300,
      message: message ?? (statusCode >= 200 && statusCode < 300 ? "Success" : "Error"),
      data: statusCode >= 200 && statusCode < 300 ? data : null,
      errors: statusCode >= 200 && statusCode < 300 ? null : data,
      meta: meta ?? null,
      traceId: generateTraceId(),
      timestamp: new Date().toISOString(),
    }),
    {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    }
  );
}
