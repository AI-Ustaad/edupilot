import { invalidateCache } from "@/lib/cache";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { Attendance } from "@/types/attendance";
import { MarkAttendanceSchema, BulkAttendanceSchema } from "@/lib/validation";
import { ZodError } from "zod";

export class AttendanceService {
  constructor(private repo: AttendanceRepository) {}

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

    const createData = { ...validated, tenantId, createdBy: userId } as Omit<Attendance, "id" | "createdAt" | "updatedAt">;
    const docId = `${validated.studentId}_${validated.date}`;
    const id = await this.repo.create({ ...createData, id: docId } as any, tenantId);
    const record = await this.repo.findById(id || docId, tenantId);
    if (!record) throw new Error("Attendance record could not be retrieved");

    // Invalidate caches (attendance for that date and dashboard)
    if (validated.date) {
    }

    return record as Attendance;
  }

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

    const batch = (this.repo as any).db.batch();
    const datesSet = new Set<string>();
    for (const rec of records) {
      const docId = `${rec.studentId}_${rec.date}`;
      const docRef = (this.repo as any).db.collection("attendance").doc(docId);
      batch.set(docRef, {
        ...rec,
        tenantId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });
      datesSet.add(rec.date);
    }
    await batch.commit();

    // Invalidate cache for each affected date
    for (const date of datesSet) {
    }

    return { success: true, message: `${records.length} attendance records saved` };
  }

  async listAttendance(tenantId: string, filters?: { date?: string; classGrade?: string; section?: string }): Promise<Attendance[]> {
    return this.repo.findWithFilters(tenantId, filters);
  }

  async getById(id: string, tenantId: string): Promise<Attendance | null> {
    return this.repo.findById(id, tenantId);
  }

  async updateAttendance(id: string, data: unknown, tenantId: string): Promise<Attendance> {
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

    // Invalidate cache for that date (if we know it)
    if ((updated as any).date) {
    }

    return updated as Attendance;
  }

  async deleteAttendance(id: string, tenantId: string): Promise<void> {
    // اصل ریکارڈ کی معلومات نکالیں
    const record = await this.repo.findById(id, tenantId);
    await this.repo.delete(id, tenantId);

    if (record) {
      if ((record as any).date) {
      }
    }
  }

  async getTodayAttendance(tenantId: string): Promise<{ present: number; absent: number; total: number }> {
    const today = new Date().toISOString().slice(0, 10);
    const records = await this.repo.findWithFilters(tenantId, { date: today });
    let present = 0, absent = 0;
    records.forEach(r => {
      if (r.status === 'Present') present++;
      else if (r.status === 'Absent') absent++;
    });
    return { present, absent, total: records.length };
  }

  async getWeeklyAttendanceTrend(tenantId: string): Promise<{ day: string; percent: number }[]> {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    }).reverse();

    const trend = [];
    for (const day of last7Days) {
      const records = await this.repo.findWithFilters(tenantId, { date: day });
      const present = records.filter(r => r.status === 'Present').length;
      const percent = records.length > 0 ? (present / records.length) * 100 : 0;
      trend.push({ day: day.slice(5), percent: Math.round(percent) });
    }
    return trend;
  }
}
