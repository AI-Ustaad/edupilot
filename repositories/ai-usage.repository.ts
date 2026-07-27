import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { IAiUsageRepository } from "@/interfaces/IAiUsageRepository";
import { BaseRepository } from "./base.repository";

export interface AiUsage {
  id?: string;
  tenantId: string;
  userId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  createdAt?: any;
}

export class AiUsageRepository extends BaseRepository<AiUsage> implements IAiUsageRepository {
  constructor() {
    super("ai_usage");
  }

  async findByTenant(tenantId: string, startDate?: Date, endDate?: Date): Promise<AiUsage[]> {
    let query = this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId);

    if (startDate) {
      query = query.where("createdAt", ">=", startDate);
    }
    if (endDate) {
      query = query.where("createdAt", "<=", endDate);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AiUsage));
  }

  async getUsageStats(tenantId: string, days: number): Promise<{ totalTokens: number; totalCost: number }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usage = await this.findByTenant(tenantId, startDate);
    
    return usage.reduce((acc, item) => ({
      totalTokens: acc.totalTokens + (item.totalTokens || 0),
      totalCost: acc.totalCost + (item.cost || 0),
    }), { totalTokens: 0, totalCost: 0 });
  }

  async logUsage(data: any, tenantId: string): Promise<void> {
    await this.db.collection(this.collectionName).add({
      ...data,
      tenantId,
      createdAt: dbTimestamp,
    });
  }
}
