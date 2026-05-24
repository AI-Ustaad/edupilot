// lib/response/apiResponse.ts

export function createApiResponse<T>(
  statusCode: number,
  data: T,
  message?: string,
  meta?: Record<string, any>
) {
  const body = JSON.stringify({
    success: statusCode >= 200 && statusCode < 300,
    data,
    message,
    meta,
    timestamp: new Date().toISOString(),
  });

  return new Response(body, {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
