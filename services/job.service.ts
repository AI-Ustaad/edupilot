import { JobRepository } from "@/repositories/job.repository";
import type { IJobService } from "@/interfaces/IJobService";

export class JobService implements IJobService {
  private jobRepo = new JobRepository();

  async createJob(tenantId: string, type: string, createdBy: string, totalItems: number = 0): Promise<string> {
    return this.jobRepo.create({
      type,
      status: "pending",
      progress: 0,
      totalItems,
      processedItems: 0,
      createdBy,
    }, tenantId);
  }

  async updateProgress(
    tenantId: string,
    jobId: string,
    processedItems: number,
    totalItems: number,
    status: "processing" | "completed" | "failed" = "processing"
  ): Promise<void> {
    await this.jobRepo.updateProgress(tenantId, jobId, processedItems, totalItems, status);
  }

  async failJob(tenantId: string, jobId: string, errorMessage: string): Promise<void> {
    await this.jobRepo.failJob(tenantId, jobId, errorMessage);
  }

  async findById(tenantId: string, jobId: string) {
    return this.jobRepo.findById(tenantId, jobId);
  }
}
