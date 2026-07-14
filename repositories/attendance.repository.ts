// repositories/attendance.repository.ts
import { BaseRepository } from "./base.repository";
import type { Attendance } from "@/types/attendance";
import type { IAttendanceRepository } from "@/interfaces/IAttendanceRepository";

export class AttendanceRepository extends BaseRepository<Attendance> implements IAttendanceRepository {
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
  ): Promise<Attendance[]> {
    let query: FirebaseFirestore.Query = this.db
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
  }

  async findByStudentId(tenantId: string, studentId: string): Promise<(Attendance & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("studentId", "==", studentId)
      .orderBy("date", "desc")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance & { id: string }));
  }

  async findByStudentIds(tenantId: string, studentIds: string[], limit = 30): Promise<(Attendance & { id: string })[]> {
    if (studentIds.length === 0) return [];
    // Firestore `in` operator supports up to 30 values; chunk if needed
    const results: (Attendance & { id: string })[] = [];
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
      results.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance & { id: string })));
    }
    return results;
  }

  getDb() {
    return this.db;
  }

  getCollectionName() {
    return this.collectionName;
  }
}
