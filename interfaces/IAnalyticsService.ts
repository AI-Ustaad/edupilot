// interfaces/IAnalyticsService.ts
export interface TenantAnalytics {
  tenantId: string;
  name: string;
  students: number;
  staff: number;
  revenue: number;
  totalStudents?: number;
  totalStaff?: number;
  totalRevenue?: number;
  activeUsers?: number;
  trend?: any[];
}

export interface IAnalyticsService {
  getTenantAnalytics(tenantId: string): Promise<TenantAnalytics>;
  getAllTenantsAnalytics(): Promise<TenantAnalytics[]>;
}
