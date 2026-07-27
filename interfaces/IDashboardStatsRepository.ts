// interfaces/IDashboardStatsRepository.ts
export interface IDashboardStatsRepository {
  findByTenant(...args: any[]): Promise<any>;
  incrementCounter(...args: any[]): Promise<any>;
  updateStats(...args: any[]): Promise<any>;
}
