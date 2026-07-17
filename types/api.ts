// types/api.ts
export interface TenantContext {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  traceId?: string;
  processingTime?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}