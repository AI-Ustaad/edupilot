export interface IAiUsageRepository {
  logUsage(data: any, tenantId: string): Promise<string>;
  findByTenant(tenantId: string, startDate?: Date, endDate?: Date): Promise<any[]>;
  getUsageStats(tenantId: string, days: number): Promise<{ totalTokens: number; totalCost: number }>;
}
