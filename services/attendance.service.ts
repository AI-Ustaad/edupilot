// services/attendance.service.ts
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { Attendance } from "@/types/attendance";
import {
  MarkAttendanceSchema,
  BulkAttendanceSchema,
} from "@/lib/validation"; // barrel export
import { ZodError } from "zod";

export class AttendanceService {
  constructor(private repo: AttendanceRepository) {}

  /**
   * ایک ہی ریکارڈ تخلیق کرنے کے لیے
   */
  async createSingle(data: unknown, tenantId: string, userId: string): Promise<Attendance> {
    let validated;
    try {
      validated = MarkAttendanceSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    const createData = {
      ...validated,
      tenantId,
      createdBy: userId,
    } as Omit<Attendance, "id" | "createdAt" | "updatedAt">;

    const docId = `${validated.studentId}_${validated.date}`;
    // آئی ڈی کو دستاویز کا نام بنایا تاکہ دوبارہ ریکارڈ نہ بنے (merge)
    const id = await this.repo.create({ ...createData, id: docId } as any, tenantId);
    const record = await this.repo.findById(id || docId, tenantId);
    if (!record) throw new Error("Attendance record could not be retrieved");
    return record as Attendance;
  }

  /**
   * ایک ساتھ کئی ریکارڈ (بلک) تخلیق کرنا
   */
  async createBulk(data: unknown, tenantId: string, userId: string): Promise<{ success: boolean; message: string }> {
    let records;
    try {
      records = BulkAttendanceSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    const batch = this.repo["db"].batch(); // اب BaseRepository میں db موجود ہے
    for (const rec of records) {
      const docId = `${rec.studentId}_${rec.date}`;
      const docRef = this.repo["db"].collection("attendance").doc(docId);
      batch.set(docRef, {
        ...rec,
        tenantId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });
    }
    await batch.commit();

    return { success: true, message: `${records.length} attendance records saved` };
  }

  /**
   * فلٹرز کے ساتھ حاضری لسٹ
   */
  async listAttendance(
    tenantId: string,
    filters?: { date?: string; classGrade?: string; section?: string }
  ): Promise<Attendance[]> {
    return this.repo.findWithFilters(tenantId, filters);
  }

  /**
   * ایک ریکارڈ حاصل کریں
   */
  async getById(id: string, tenantId: string): Promise<Attendance | null> {
    return this.repo.findById(id, tenantId);
  }

  /**
   * ریکارڈ اپ ڈیٹ کریں (اکثر اسٹیٹس تبدیل کرنے کے لیے)
   */
  async updateAttendance(id: string, data: unknown, tenantId: string): Promise<Attendance> {
    // یہاں MarkAttendanceSchema کا partial استعمال کر سکتے ہیں
    const schema = MarkAttendanceSchema.partial();
    let validated;
    try {
      validated = schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }

    await this.repo.update(id, validated, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Attendance record not found after update");
    return updated as Attendance;
  }

  /**
   * حذف کریں
   */
  async deleteAttendance(id: string, tenantId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
  }
}
