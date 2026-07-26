export interface IJobRepository {
  findById(tenantId: string, jobId: string): Promise<any | null>;
  create(data: any, tenantId: string): Promise<string>;
  updateProgress(tenantId: string, jobId: string, processedItems: number, totalItems: number, status?: string): Promise<void>;
  failJob(tenantId: string, jobId: string, errorMessage: string): Promise<void>;
}
