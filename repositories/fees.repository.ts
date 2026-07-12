// repositories/fees.repository.ts
import { BaseRepository } from "./base.repository";
import type { Fee } from "@/types/fees";
import type { IFeesRepository } from "@/interfaces/IFeesRepository";

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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee & { id: string }));
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee & { id: string }));
  }
}
