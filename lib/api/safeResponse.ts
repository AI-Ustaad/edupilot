// lib/api/safeResponse.ts

export const safeArray = <T = any>(data: any): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  if (Array.isArray(data?.items)) return data.items as T[];
  return [];
};

export const safeObject = <T = any>(data: any): T | null => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return (data?.data ?? data) as T;
  }
  return null;
};

export const safePagination = (data: any) => {
  const items = safeArray(data?.data || data?.items);
  return {
    items,
    total: data?.total ?? items.length,
    page: data?.page ?? 1,
    limit: data?.limit ?? items.length,
    totalPages: data?.totalPages ?? 1,
  };
};

export const safeData = <T = any>(data: any): T => {
  return (data?.data ?? data) as T;
};

// 🌟 آپ کی تجویز کردہ Enterprise isEmpty Function
export const isEmpty = (value: any): boolean => {
  if (value === null) return true;
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};
