// lib/api/safeResponse.ts

export const unwrapApiResponse = <T = any>(response: any): T => {
  if (response === null || response === undefined) return response as T;
  let current = response;

  for (let i = 0; i < 3; i++) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      break;
    }
    if ("data" in current && ("status" in current || "headers" in current || "config" in current)) {
      current = current.data;
      continue;
    }
    if ("data" in current && ("success" in current || "traceId" in current || "timestamp" in current || "message" in current)) {
      current = current.data;
      continue;
    }
    if ("data" in current && typeof current.data === "object" && current.data !== null && ("success" in current.data || "data" in current.data)) {
      current = current.data;
      continue;
    }
    break;
  }

  return (current ?? response) as T;
};

export const safeArray = <T = any>(data: any): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];

  const unwrapped = unwrapApiResponse(data);
  if (Array.isArray(unwrapped)) return unwrapped as T[];

  if (unwrapped && typeof unwrapped === "object") {
    if (Array.isArray(unwrapped.data)) return unwrapped.data as T[];
    if (Array.isArray(unwrapped.items)) return unwrapped.items as T[];
    if (unwrapped.data && typeof unwrapped.data === "object") {
      if (Array.isArray(unwrapped.data.items)) return unwrapped.data.items as T[];
      if (Array.isArray(unwrapped.data.data)) return unwrapped.data.data as T[];
    }
  }

  return [];
};

export const safeObject = <T = any>(data: any): T => {
  if (!data) return {} as T;
  const unwrapped = unwrapApiResponse(data);
  if (!unwrapped || typeof unwrapped !== "object" || Array.isArray(unwrapped)) {
    return {} as T;
  }
  return unwrapped as T;
};

export const isEmpty = (value: any): boolean => {
  if (value === null) return true;
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};
