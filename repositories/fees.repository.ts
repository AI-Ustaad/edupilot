// repositories/fees.repository.ts
import { BaseRepository } from "./base.repository";
import type { Fee } from "@/types/fees";
import type { IFeesRepository } from "@/interfaces/IFeesRepository";

// 🟢 Enterprise Safe Serializer
function serializeDoc<T>(doc: any): T & { id: string } {
  const data = doc.data() || {};
  for (const key in data) {
    if (data[key] && typeof data[key].toDate === 'function') {
      data[key] = data[key].toDate().toISOString();
    } else if (data[key] && data[key]._seconds !== undefined) {
      data[key] = new Date(data[key]._seconds * 1000).toISOString();
    }
  }
  return { id: doc.id, ...data } as T & { id: string };
}

export class FeesRepository extends BaseRepository<Fee> implements IFeesRepository {
  constructor() {
    super("fees");
  }

  async findByStudent(
    tenantId: string,
    studentId: string,
    limit = 100
  ): Promise<(Fee & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("studentId", "==", studentId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => serializeDoc<Fee>(doc));
  }

  async findWithFilters(
    tenantId: string,
    filters?: { studentId?: string; paid?: boolean; dueBefore?: string }
  ): Promise<(Fee & { id: string })[]> {
    let query: FirebaseFirestore.Query = this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId);

    if (filters?.studentId) {
      query = query.where("studentId", "==", filters.studentId);
    }
    if (filters?.paid !== undefined) {
      query = query.where("paid", "==", filters.paid);
    }
    if (filters?.dueBefore) {
      query = query.where("dueDate", "<", filters.dueBefore);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => serializeDoc<Fee>(doc));
  }

  async getTotalRevenue(tenantId: string): Promise<number> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .select("amountPaid")
      .get();
    return snapshot.docs.reduce((sum, doc) => sum + (doc.data().amountPaid || 0), 0);
  }

  async getRecentPayments(tenantId: string, limit = 5): Promise<(Fee & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => serializeDoc<Fee>(doc));
  }
}
