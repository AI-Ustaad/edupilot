// repositories/job.repository.ts
import { adminDb } from "@/lib/firebase-admin";

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

export class JobRepository {
  private getCollection(tenantId: string) {
    return adminDb.collection("tenants").doc(tenantId).collection("jobs");
  }

  async findById(tenantId: string, jobId: string): Promise<(Job & { id: string }) | null> {
    const docSnap = await this.getCollection(tenantId).doc(jobId).get();
    
    if (!docSnap.exists) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Job & { id: string };
  }
}
