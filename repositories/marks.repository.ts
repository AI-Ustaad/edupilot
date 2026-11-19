// repositories/marks.repository.ts
import { BaseRepository } from "./base.repository";
import { dbTimestamp } from "@/lib/firebase-admin";
import type { Mark } from "@/types/marks";
import type { IMarksRepository } from "@/interfaces/IMarksRepository";
import { canonicalizeSubject } from "@/lib/utils/formatClassLabel";

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
    try {
      let query: FirebaseFirestore.Query = this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("deleted", "==", false);

      if (filters?.studentId) {
        query = query.where("studentId", "==", filters.studentId);
      }
      if (filters?.term) {
        query = query.where("term", "==", filters.term);
      }

      const snapshot = await query.get();
      let docs = snapshot.docs.map(doc => serializeDoc<Mark>(doc));

      if (filters?.classGrade) {
        const targetClass = filters.classGrade.trim().toLowerCase().replace(/^class\s*/i, "");
        docs = docs.filter(d => {
          const docClass = String(d.classGrade || "").trim().toLowerCase().replace(/^class\s*/i, "");
          return docClass === targetClass;
        });
      }

      if (filters?.section) {
        const targetSec = filters.section.trim().toLowerCase().replace(/^section\s*/i, "");
        docs = docs.filter(d => {
          const docSec = String(d.section || "").trim().toLowerCase().replace(/^section\s*/i, "");
          return docSec === targetSec;
        });
      }

      if (filters?.subject) {
        const targetSub = canonicalizeSubject(filters.subject).toLowerCase();
        docs = docs.filter(d => {
          const docSub = canonicalizeSubject(d.subject).toLowerCase();
          return docSub === targetSub;
        });
      }

      return docs.map(d => ({
        ...d,
        subject: canonicalizeSubject(d.subject),
      }));
    } catch {
      try {
        const snapshot = await this.db
          .collection(this.collectionName)
          .where("tenantId", "==", tenantId)
          .get();
        let docs = snapshot.docs.map(doc => serializeDoc<Mark>(doc)).filter(d => !d.deleted);

        if (filters?.studentId) {
          docs = docs.filter(d => d.studentId === filters.studentId);
        }
        if (filters?.term) {
          const targetTerm = filters.term.trim().toLowerCase();
          docs = docs.filter(d => String(d.term || "").trim().toLowerCase() === targetTerm);
        }
        if (filters?.classGrade) {
          const targetClass = filters.classGrade.trim().toLowerCase().replace(/^class\s*/i, "");
          docs = docs.filter(d => String(d.classGrade || "").trim().toLowerCase().replace(/^class\s*/i, "") === targetClass);
        }
        if (filters?.section) {
          const targetSec = filters.section.trim().toLowerCase().replace(/^section\s*/i, "");
          docs = docs.filter(d => String(d.section || "").trim().toLowerCase().replace(/^section\s*/i, "") === targetSec);
        }
        if (filters?.subject) {
          const targetSub = canonicalizeSubject(filters.subject).toLowerCase();
          docs = docs.filter(d => {
            const docSub = canonicalizeSubject(d.subject).toLowerCase();
            return docSub === targetSub;
          });
        }
        return docs.map(d => ({
          ...d,
          subject: canonicalizeSubject(d.subject),
        }));
      } catch {
        return [];
      }
    }
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
