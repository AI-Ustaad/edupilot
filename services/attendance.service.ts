import { AttendanceRepository } from "@/repositories/attendance.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { MarkAttendanceSchema, BulkAttendanceSchema } from "@/validators/attendance";
import { invalidateCache } from "@/lib/cache";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
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

    await eventBus.publish(EVENTS.ATTENDANCE_MARKED, {
      tenantId,
      attendanceId: id || docId,
      studentId: parsed.studentId,
      date: parsed.date,
      status: parsed.status,
    });

    return record as Attendance;
  }

  async createBulk(data: unknown, tenantId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const validation = this.validation.validate(BulkAttendanceSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(", ")}`);
    }
    const records = validation.data;

    const bulkData = records.map(rec => ({
      id: `${rec.studentId}_${rec.date}`,
      ...rec,
      tenantId,
      createdBy: userId,
    }));

    await this.repo.bulkCreate(bulkData as any, tenantId);

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "attendance.bulkCreated",
      userId,
      tenantId,
      entityType: "attendance",
      metadata: { recordCount: records.length, dates: [...new Set(records.map(r => r.date))] },
    });

    await eventBus.publish(EVENTS.ATTENDANCE_IMPORTED, {
      tenantId,
      recordCount: records.length,
      dates: [...new Set(records.map(r => r.date))],
    });

    return { success: true, message: `${records.length} attendance records saved` };
  }

  async listAttendance(tenantId: string, filters?: { date?: string; classGrade?: string; section?: string; studentId?: string }): Promise<Attendance[]> {
    return this.repo.findWithFilters(tenantId, filters);
  }

  async findByStudentId(tenantId: string, studentId: string): Promise<(Attendance & { id: string })[]> {
    return this.repo.findByStudentId(tenantId, studentId);
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

    await eventBus.publish(EVENTS.ATTENDANCE_UPDATED, {
      tenantId,
      attendanceId: id,
      updates: parsed,
    });

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

    await eventBus.publish(EVENTS.ATTENDANCE_DELETED, {
      tenantId,
      attendanceId: id,
      studentId: (record as any)?.studentId,
    });
  }

  async getTodayAttendance(tenantId: string): Promise<{ present: number; absent: number; late: number; total: number }> {
    const today = new Date().toISOString().slice(0, 10);
    const records = await this.repo.findWithFilters(tenantId, { date: today });
    let present = 0, absent = 0, late = 0;
    records.forEach(r => {
      if (r.status === 'Present') present++;
      else if (r.status === 'Absent') absent++;
      else if (r.status === 'Late') { present++; late++; }
    });
    return { present, absent, late, total: records.length };
  }

  async getWeeklyAttendanceTrend(tenantId: string): Promise<{ day: string; percent: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);

    // Single date-range query instead of 7 sequential queries
    const records = await this.repo.findWithFilters(tenantId, {
      dateRange: { gte: startStr, lte: endStr },
    });

    // Group by date in-memory
    const byDate: Record<string, { present: number; total: number }> = {};
    for (const r of records) {
      if (!byDate[r.date]) byDate[r.date] = { present: 0, total: 0 };
      byDate[r.date].total++;
      if (r.status === "Present" || r.status === "Late") byDate[r.date].present++;
    }

    // Build trend for all 7 days (including days with 0 records)
    const trend = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dayStr = d.toISOString().slice(0, 10);
      const stats = byDate[dayStr] || { present: 0, total: 0 };
      const percent = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
      trend.push({ day: dayStr.slice(5), percent: Math.round(percent) });
    }
    return trend;
  }
}
