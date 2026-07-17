// repositories/syllabus.repository.ts
import { BaseRepository } from "./base.repository";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";

export interface Syllabus {
  tenantId: string;
  classGrade: string;
  subject: string;
  title?: string;
  description?: string;
  content?: any;
  deleted?: boolean;
  createdBy?: string;
}

export class SyllabusRepository extends BaseRepository<Syllabus> {
  constructor() {
    super("syllabus");
  }

  async findWithFilters(
    tenantId: string,
    filters?: { classGrade?: string; subject?: string }
  ): Promise<(Syllabus & { id: string })[]> {
    let query: FirebaseFirestore.Query = this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId);

    if (filters?.classGrade) {
      query = query.where("classGrade", "==", filters.classGrade);
    }
    if (filters?.subject) {
      query = query.where("subject", "==", filters.subject);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Syllabus & { id: string })
    );
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      throw new Error("Syllabus not found or unauthorized");
    }
    await docRef.update({
      deleted: true,
      deletedAt: dbTimestamp,
      updatedAt: dbTimestamp,
    });
  }

  async updateSyllabus(
    id: string,
    tenantId: string,
    data: Partial<Syllabus>
  ): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      throw new Error("Syllabus not found or unauthorized");
    }
    await docRef.update({
      ...data,
      updatedAt: dbTimestamp,
    });
  }
}
