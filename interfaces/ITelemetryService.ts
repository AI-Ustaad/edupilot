// interfaces/ITelemetryService.ts
export interface ITelemetryService {
  getSaaSMetrics(): Promise<{
    totalSchools: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    mrr: number;
    dau: number;
    systemHealth: { apiStatus: string; databaseLatency: string; errorRate: string };
    revenueTrend: { month: string; revenue: number }[];
  }>;
}
