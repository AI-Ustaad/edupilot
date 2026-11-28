// lib/api/errorMessage.ts
// B12 rework (27 Nov audit): the video upload crashed the WHOLE app to the
// "Critical System Error" page instead of showing an error toast.
//
// Root cause of the crash (not the upload failure itself): the upload
// mutation picked its toast message with
//   err?.response?.data?.error || err?.response?.data?.message || ...
// Vercel platform errors (413 FUNCTION_PAYLOAD_TOO_LARGE when the request
// body exceeds the 4.5 MB function cap, 504 FUNCTION_INVOCATION_TIMEOUT
// when the function runs past maxDuration) answer with a JSON body whose
// `error` field is an OBJECT — {"error": {"code": "413", "message": "..."}}.
// The toast then carried that object, React threw "Objects are not valid as
// a React child" while rendering it, and because ToastProvider lives in the
// root layout the error bubbled past app/error.tsx to global-error.tsx.
// "Try Again" could not recover it (the poisoned toast stays in provider
// state); only a full reload cleared it.
//
// This helper ALWAYS returns a string, so no API error shape — platform
// error, AppError, axios network error, plain Error, or garbage — can ever
// crash a toast again. Use it for every error toast / error message
// derived from a caught error.
export function extractErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  const asString = (value: unknown): string | null => {
    if (typeof value === "string" && value.trim().length > 0) return value;
    return null;
  };

  const fromObject = (obj: Record<string, unknown>): string | null => {
    // Vercel platform errors and AppError-style bodies: { error: { code, message } }
    const nested = obj.error;
    if (nested && typeof nested === "object") {
      const inner = nested as Record<string, unknown>;
      return asString(inner.message) ?? asString(inner.code);
    }
    return asString(obj.message) ?? asString(obj.error) ?? asString(obj.code);
  };

  if (typeof error === "string") return asString(error) ?? fallback;
  if (error instanceof Error) return asString(error.message) ?? fallback;

  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    // Axios-style: { response: { data } } — unwrap to the response body first.
    const response = e.response as Record<string, unknown> | undefined;
    const data = response?.data ?? e.data;
    if (typeof data === "string") return asString(data) ?? fallback;
    if (data && typeof data === "object") {
      const fromData = fromObject(data as Record<string, unknown>);
      if (fromData) return fromData;
    }
    const fromErr = fromObject(e);
    if (fromErr) return fromErr;
    // Last resort: a compact JSON rendering — still a string, never an object.
    try {
      const json = JSON.stringify(e);
      if (json && json.length > 2) {
        return json.length > 200 ? `${json.slice(0, 200)}…` : json;
      }
    } catch {
      // JSON.stringify can throw on circular structures — fall through.
    }
  }

  return fallback;
}
