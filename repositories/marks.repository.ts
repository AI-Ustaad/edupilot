// repositories/marks.repository.ts
import { BaseRepository } from "./base.repository";
import type { Mark } from "@/types/marks";
import type { IMarksRepository } from "@/interfaces/IMarksRepository";

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
  ): Promise<Mark[]> {
    let query: FirebaseFirestore.Query = this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId);

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
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as unknown as Mark))
      .filter(mark => !(mark as any).deleted);
  }

  async upsert(id: string, data: Partial<Mark>, tenantId: string): Promise<void> {
    await this.db.collection(this.collectionName).doc(id).set(data, { merge: true });
  }

  getDb() {
    return this.db;
  }

  getCollectionName() {
    return this.collectionName;
  }
}
