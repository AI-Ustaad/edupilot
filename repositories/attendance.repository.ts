// repositories/attendance.repository.ts
import { BaseRepository } from "./base.repository";
import { Attendance } from "@/types/attendance";

export class AttendanceRepository extends BaseRepository<Attendance> {
  constructor() {
    super("attendance");
  }

  /**
   * فلٹرز کے ساتھ حاضری کے ریکارڈ لاتا ہے۔
   * date, classGrade, section میں سے کوئی بھی دیا جا سکتا ہے۔
   */
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
}
