import { JobRepository } from "@/repositories/job.repository";
import type { IJobService } from "@/interfaces/IJobService";

export class JobService {
  private jobRepo = new JobRepository();

  static async createJob(tenantId: string, type: string, createdBy: string, totalItems: number = 0): Promise<string> {
    const jobRepo = new JobRepository();
    return jobRepo.create({
      type,
      status: "pending",
      progress: 0,
      totalItems,
      processedItems: 0,
      createdBy,
    }, tenantId);
  }

  static async updateProgress(
    tenantId: string,
    jobId: string,
    processedItems: number,
    totalItems: number,
    status: "processing" | "completed" | "failed" = "processing"
  ): Promise<void> {
    const jobRepo = new JobRepository();
    await jobRepo.updateProgress(tenantId, jobId, processedItems, totalItems, status);
  }

  static async failJob(tenantId: string, jobId: string, errorMessage: string): Promise<void> {
    const jobRepo = new JobRepository();
    await jobRepo.failJob(tenantId, jobId, errorMessage);
  }
}
