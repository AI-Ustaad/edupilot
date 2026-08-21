// repositories/fees.repository.ts
import { BaseRepository } from "./base.repository";
import type { FeeDocument } from "@/documents/FeeDocument";
import type { IFeesRepository } from "@/interfaces/IFeesRepository";
import type { PaginatedResult } from "@/types/api";
import { RepositoryException } from "@/errors/AppError";

export class FeesRepository extends BaseRepository<FeeDocument> implements IFeesRepository {
  constructor() {
    super("fees");
  }

  async findByStudent(
    tenantId: string,
    studentId: string,
    limit = 100
  ): Promise<(FeeDocument & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("studentId", "==", studentId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeDocument & { id: string }));
  }

  async findWithFilters(
    tenantId: string,
    filters?: { studentId?: string; paid?: boolean; dueBefore?: string }
  ): Promise<(FeeDocument & { id: string })[]> {
    let query = this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId);

    if (filters?.studentId) {
      query = query.where("studentId", "==", filters.studentId);
    }
    if (filters?.dueBefore) {
      query = query.where("dueDate", "<", filters.dueBefore);
    }

    const snapshot = await query.get();
    const fees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeDocument & { id: string }));

    // `status` is the canonical persisted payment state. The previous query
    // used a nonexistent `paid` field, which made every overdue reminder miss
    // the records created by FeesService.
    if (filters?.paid === undefined) return fees;
    return fees.filter((fee) => {
      const isPaid = fee.status?.trim().toLowerCase() === "paid";
      return filters.paid ? isPaid : !isPaid;
    });
  }

  async getTotalRevenue(tenantId: string): Promise<number> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .get();
    return snapshot.docs.reduce((sum, doc) => sum + (doc.data().amountPaid || 0), 0);
  }

  async getRecentPayments(tenantId: string, limit = 5): Promise<(FeeDocument & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeDocument & { id: string }));
  }

  async count(tenantId: string): Promise<number> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .get();
    return snapshot.size;
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const doc = await this.db.collection(this.collectionName).doc(id).get();
    return doc.exists && doc.data()?.tenantId === tenantId;
  }

  async save(document: FeeDocument, tenantId: string): Promise<FeeDocument> {
    try {
      if (document.id) {
        await this.update(document.id, document, tenantId);
        const updated = await this.findById(document.id, tenantId);
        if (!updated) throw new Error("Fee not found after update.");
        return updated;
      } else {
        const newId = await this.create(document, tenantId);
        const created = await this.findById(newId, tenantId);
        if (!created) throw new Error("Fee not found after create.");
        return created;
      }
    } catch (error) {
      throw new RepositoryException("Failed to save fee", { tenantId, docId: document.id });
    }
  }
}
