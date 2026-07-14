// repositories/marks.repository.ts
import { BaseRepository } from "./base.repository";
import { dbTimestamp } from "@/lib/firebase-admin";
import type { Mark } from "@/types/marks";
import type { IMarksRepository } from "@/interfaces/IMarksRepository";

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

export class MarksRepository extends BaseRepository<Mark> implements IMarksRepository {
  constructor() {
    super("marks");
  }

  async findWithFilters(
    tenantId: string,
    filters?: {
      classGrade?: string;
      section?: string;
      term?: string;
      subject?: string;
      studentId?: string;
    }
  ): Promise<(Mark & { id: string })[]> {
    let query: FirebaseFirestore.Query = this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("deleted", "==", false);

    if (filters?.classGrade) {
      query = query.where("classGrade", "==", filters.classGrade);
    }
    if (filters?.section) {
      query = query.where("section", "==", filters.section);
    }
    if (filters?.term) {
      query = query.where("term", "==", filters.term);
    }
    if (filters?.subject) {
      query = query.where("subject", "==", filters.subject);
    }
    if (filters?.studentId) {
      query = query.where("studentId", "==", filters.studentId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => serializeDoc<Mark>(doc));
  }

  async upsert(id: string, data: Partial<Mark>, tenantId: string): Promise<void> {
    await this.db.collection(this.collectionName).doc(id).set({
      ...data,
      tenantId,
      updatedAt: dbTimestamp,
    }, { merge: true });
  }

  async softDeleteMark(id: string, tenantId: string, userId: string): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      throw new Error("Mark not found or access denied");
    }
    await docRef.update({
      deleted: true,
      deletedAt: dbTimestamp,
      deletedBy: userId,
    });
  }

  async findByStudent(tenantId: string, studentId: string): Promise<(Mark & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("studentId", "==", studentId)
      .where("deleted", "==", false)
      .get();
    return snapshot.docs.map(doc => serializeDoc<Mark>(doc));
  }

  async findSkills(tenantId: string, studentId: string, term?: string): Promise<Record<string, number>[]> {
    let query: FirebaseFirestore.Query = this.db
      .collection(this.collectionName)
      .where("studentId", "==", studentId)
      .where("tenantId", "==", tenantId);

    if (term) {
      query = query.where("term", "==", term);
    }

    const snapshot = await query.get();
    return snapshot.docs
      .map(d => d.data().skills as Record<string, number>)
      .filter(Boolean);
  }
}
