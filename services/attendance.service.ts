import { AttendanceRepository } from "@/repositories/attendance.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { MarkAttendanceSchema, BulkAttendanceSchema } from "@/validators/attendance";
import { invalidateCache } from "@/lib/cache";
import type { IAttendanceRepository } from "@/interfaces/IAttendanceRepository";
import type { Attendance } from "@/types/attendance";

export class AttendanceService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: IAttendanceRepository = new AttendanceRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async createSingle(data: unknown, tenantId: string, userId: string): Promise<Attendance> {
    const validation = this.validation.validate(MarkAttendanceSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(", ")}`);
    }
    const parsed = validation.data;

    const docId = `${parsed.studentId}_${parsed.date}`;
    const createData = { ...parsed, tenantId, createdBy: userId } as Omit<Attendance, "id" | "createdAt" | "updatedAt">;
    const id = await this.repo.create({ ...createData, id: docId } as any, tenantId);
    const record = await this.repo.findById(id || docId, tenantId);
    if (!record) throw new Error("Attendance record could not be retrieved");

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "attendance.created",
      userId,
      tenantId,
      entityId: id || docId,
      entityType: "attendance",
      metadata: { studentId: parsed.studentId, date: parsed.date, status: parsed.status },
    });

    return record as Attendance;
  }

  async createBulk(data: unknown, tenantId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const validation = this.validation.validate(BulkAttendanceSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(", ")}`);
    }
    const records = validation.data;

    const batch = this.repo.getDb().batch();
    const datesSet = new Set<string>();
    for (const rec of records) {
      const docId = `${rec.studentId}_${rec.date}`;
      const docRef = this.repo.getDb().collection(this.repo.getCollectionName()).doc(docId);
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

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "attendance.bulkCreated",
      userId,
      tenantId,
      entityType: "attendance",
      metadata: { recordCount: records.length, dates: Array.from(datesSet) },
    });

    return { success: true, message: `${records.length} attendance records saved` };
  }

  async listAttendance(tenantId: string, filters?: { date?: string; classGrade?: string; section?: string }): Promise<Attendance[]> {
    return this.repo.findWithFilters(tenantId, filters);
  }

  async getById(id: string, tenantId: string): Promise<(Attendance & { id: string }) | null> {
    return this.repo.findById(id, tenantId);
  }

  async updateAttendance(id: string, data: unknown, tenantId: string, userId?: string): Promise<Attendance> {
    const validation = this.validation.validate(MarkAttendanceSchema.partial(), data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(", ")}`);
    }
    const parsed = validation.data;

    await this.repo.update(id, parsed, tenantId);
    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Attendance record not found after update");

    await invalidateCache(`dashboard:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "attendance.updated",
        userId,
        tenantId,
        entityId: id,
        entityType: "attendance",
        metadata: { updates: parsed },
      });
    }

    return updated as Attendance;
  }

  async deleteAttendance(id: string, tenantId: string, userId?: string): Promise<void> {
    const record = await this.repo.findById(id, tenantId);
    await this.repo.delete(id, tenantId);

    await invalidateCache(`dashboard:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "attendance.deleted",
        userId,
        tenantId,
        entityId: id,
        entityType: "attendance",
        metadata: { studentId: (record as any)?.studentId, date: (record as any)?.date },
      });
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
