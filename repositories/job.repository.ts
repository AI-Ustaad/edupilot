import { BaseRepository } from "./base.repository";
import { IJobRepository } from "@/interfaces/IJobRepository";
import { nowISO } from "@/lib/date";

export interface Job {
  id?: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  totalItems: number;
  processedItems: number;
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
  finishedAt?: any;
  error?: string;
}

export class JobRepository extends BaseRepository<Job> implements IJobRepository {
  constructor() {
    super("jobs");
  }

  private getCollection(tenantId: string) {
    return this.db.collection("tenants").doc(tenantId).collection(this.collectionName);
  }

  async findById(tenantId: string, jobId: string): Promise<(Job & { id: string }) | null> {
    const docSnap = await this.getCollection(tenantId).doc(jobId).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() } as Job & { id: string };
  }

  async create(data: Omit<Job, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string> {
    const docRef = await this.getCollection(tenantId).add({
      ...data,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return docRef.id;
  }

  async updateProgress(tenantId: string, jobId: string, processedItems: number, totalItems: number, status: "processing" | "completed" | "failed" = "processing"): Promise<void> {
    const progress = Math.round((processedItems / totalItems) * 100);
    const updateData: any = {
      processedItems,
      progress,
      status,
      updatedAt: nowISO(),
    };

    if (status === "completed") {
      updateData.finishedAt = nowISO();
    }

    await this.getCollection(tenantId).doc(jobId).update(updateData);
  }

  async failJob(tenantId: string, jobId: string, errorMessage: string): Promise<void> {
    await this.getCollection(tenantId).doc(jobId).update({
      status: "failed",
      error: errorMessage,
      updatedAt: nowISO(),
      finishedAt: nowISO(),
    });
  }
}
