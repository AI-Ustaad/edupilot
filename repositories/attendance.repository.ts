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

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
  }

  getDb() {
    return this.db;
  }

  getCollectionName() {
    return this.collectionName;
  }
}
