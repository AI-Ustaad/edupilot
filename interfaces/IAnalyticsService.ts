// interfaces/IAnalyticsService.ts
export interface TenantAnalytics {
  tenantId: string;
  name: string;
  students: number;
  staff: number;
  revenue: number;
}

export interface IAnalyticsService {
  getTenantAnalytics(tenantId: string): Promise<TenantAnalytics>;
  getAllTenantsAnalytics(): Promise<TenantAnalytics[]>;
}
