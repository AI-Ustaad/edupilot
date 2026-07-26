export interface IDashboardStatsRepository {
  findByTenant(tenantId: string): Promise<any | null>;
  updateStats(tenantId: string, data: Partial<any>): Promise<void>;
  incrementCounter(tenantId: string, counter: string, amount: number): Promise<void>;
}
