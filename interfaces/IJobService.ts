// interfaces/IJobService.ts
export interface IJobService {
  createJob(tenantId: string, type: string, createdBy: string, totalItems: number): Promise<string>;
  updateProgress(tenantId: string, jobId: string, processedItems: number, totalItems: number, status: string): Promise<void>;
  failJob(tenantId: string, jobId: string, errorMessage: string): Promise<void>;
}
