// repositories/attendance.repository.ts
import { BaseRepository } from "./base.repository";
import type { AttendanceDocument } from "@/documents/AttendanceDocument";
import type { AttendanceEntity } from "@/entities/attendance.entity";
import type { IAttendanceRepository } from "@/interfaces/IAttendanceRepository";
import type { PaginatedResult } from "@/types/api";
import { RepositoryException } from "@/errors/AppError";

export class AttendanceRepository extends BaseRepository<AttendanceDocument> implements IAttendanceRepository {
  constructor() {
    super("attendance");
  }

  async findWithFilters(
    tenantId: string,
    filters?: {
      date?: string;
      classGrade?: string;
      section?: string;
      studentId?: string;
      dateRange?: { gte: string; lte: string };
    }
  ): Promise<AttendanceDocument[]> {
    let query = this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId);

    if (filters?.date) {
      query = query.where("date", "==", filters.date);
    }
    if (filters?.classGrade) {
      query = query.where("classGrade", "==", filters.classGrade);
    }
    if (filters?.section) {
      query = query.where("section", "==", filters.section);
    }
    if (filters?.studentId) {
      query = query.where("studentId", "==", filters.studentId);
    }
    if (filters?.dateRange) {
      query = query.where("date", ">=", filters.dateRange.gte).where("date", "<=", filters.dateRange.lte);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceDocument));
  }

  async findByStudentId(tenantId: string, studentId: string): Promise<(AttendanceDocument & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("studentId", "==", studentId)
      .orderBy("date", "desc")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceDocument & { id: string }));
  }

  async findByStudentIds(tenantId: string, studentIds: string[], limit = 30): Promise<(AttendanceDocument & { id: string })[]> {
    if (studentIds.length === 0) return [];
    
    const results: (AttendanceDocument & { id: string })[] = [];
    const chunks: string[][] = [];
    for (let i = 0; i < studentIds.length; i += 30) {
      chunks.push(studentIds.slice(i, i + 30));
    }
    for (const chunk of chunks) {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .where("studentId", "in", chunk)
        .limit(limit * chunk.length)
        .get();
      results.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceDocument & { id: string })));
    }
    return results;
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

  async bulkCreate(documents: AttendanceDocument[], tenantId: string): Promise<string[]> {
    if (documents.length === 0) return [];
    const batch = this.db.batch();
    const ids: string[] = [];
    for (const doc of documents) {
      const docRef = doc.id 
        ? this.db.collection(this.collectionName).doc(doc.id)
        : this.db.collection(this.collectionName).doc();
      batch.set(docRef, { ...doc, tenantId });
      ids.push(docRef.id);
    }
    await batch.commit();
    return ids;
  }

  async save(document: AttendanceDocument, tenantId: string): Promise<AttendanceDocument> {
    try {
      if (document.id) {
        await this.update(document.id, document, tenantId);
        const updated = await this.findById(document.id, tenantId);
        if (!updated) throw new Error("Attendance record not found after update.");
        return updated;
      } else {
        const newId = await this.create(document, tenantId);
        const created = await this.findById(newId, tenantId);
        if (!created) throw new Error("Attendance record not found after create.");
        return created;
      }
    } catch (error) {
      throw new RepositoryException("Failed to save attendance", { tenantId, docId: document.id });
    }
  }
}
