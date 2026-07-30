// services/attendance.service.ts
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { MarkAttendanceSchema, BulkAttendanceSchema } from "@/validators/attendance";
import { invalidateCache } from "@/lib/cache";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import type { IAttendanceRepository } from "@/interfaces/IAttendanceRepository";
import type { IAttendanceService } from "@/interfaces/IAttendanceService";
import type { AttendanceEntity } from "@/entities/attendance.entity";
import type { AttendanceDocument } from "@/documents/AttendanceDocument";
import type { CreateAttendanceDTO, UpdateAttendanceDTO } from "@/dto";
import type { PaginatedResult } from "@/types/api";
import { NotFoundException } from "@/errors/AppError";
import { AttendancePersistenceMapper } from "@/lib/mappers/AttendancePersistenceMapper";

export class AttendanceService implements IAttendanceService {
  private audit: AuditService;
  private validation: ValidationService;
  private repository: IAttendanceRepository;

  constructor(repository?: IAttendanceRepository) {
    this.repository = repository ?? new AttendanceRepository();
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async createSingle(data: CreateAttendanceDTO, tenantId: string, userId: string): Promise<AttendanceEntity> {
    const validation = this.validation.validate(MarkAttendanceSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(", ")}`);
    }
    const parsed = validation.data;

    const docId = `${parsed.studentId}_${parsed.date}`;
    const entity = AttendancePersistenceMapper.fromDTO(parsed);
    const document = AttendancePersistenceMapper.toFirestore(entity, userId);
    document.id = docId;
    document.tenantId = tenantId;
    document.createdBy = userId;

    const created = await this.repository.save(document, tenantId);
    const record = AttendancePersistenceMapper.fromFirestore(created);

    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "attendance.created",
      userId,
      tenantId,
      entityId: docId,
      entityType: "attendance",
      metadata: { studentId: parsed.studentId, date: parsed.date, status: parsed.status },
    });

    await eventBus.publish(EVENTS.ATTENDANCE_MARKED, {
      tenantId,
      attendanceId: docId,
      studentId: parsed.studentId,
      date: parsed.date,
      status: parsed.status,
    }, tenantId);

    return record;
  }

  async createBulk(data: CreateAttendanceDTO[], tenantId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const records: AttendanceDocument[] = data.map(rec => {
      const docId = `${rec.studentId}_${rec.date}`;
      const entity = AttendancePersistenceMapper.fromDTO(rec);
      const document = AttendancePersistenceMapper.toFirestore(entity, userId);
      document.id = docId;
      document.tenantId = tenantId;
      document.createdBy = userId;
      return document;
    });

    await this.repository.bulkCreate(records, tenantId);

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
    }, tenantId);

    return { success: true, message: `${records.length} attendance records saved` };
  }

  async listAttendance(tenantId: string, filters?: { date?: string; classGrade?: string; section?: string; studentId?: string }): Promise<AttendanceEntity[]> {
    const docs = await this.repository.findWithFilters(tenantId, filters);
    return docs.map(doc => AttendancePersistenceMapper.fromFirestore(doc));
  }

  async findByStudentId(tenantId: string, studentId: string): Promise<AttendanceEntity[]> {
    const docs = await this.repository.findByStudentId(tenantId, studentId);
    return docs.map(doc => AttendancePersistenceMapper.fromFirestore(doc));
  }

  async findByStudentIds(tenantId: string, studentIds: string[], limit = 30): Promise<AttendanceEntity[]> {
    const docs = await this.repository.findByStudentIds(tenantId, studentIds, limit);
    return docs.map(doc => AttendancePersistenceMapper.fromFirestore(doc));
  }

  async getById(tenantId: string, id: string): Promise<AttendanceEntity | null> {
    const doc = await this.repository.findById(id, tenantId);
    if (!doc) return null;
    return AttendancePersistenceMapper.fromFirestore(doc);
  }

  async updateAttendance(tenantId: string, id: string, data: UpdateAttendanceDTO, userId?: string): Promise<AttendanceEntity> {
    const existing = await this.repository.findById(id, tenantId);
    if (!existing) throw new NotFoundException("Attendance record not found");

    const entity = AttendancePersistenceMapper.fromDTO(data);
    const document = AttendancePersistenceMapper.toFirestore(entity, userId || "");
    const updatePayload: Record<string, unknown> = { ...document, updatedBy: userId || "system", updatedAt: new Date() };
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key as keyof typeof updatePayload] === undefined) {
        delete updatePayload[key as keyof typeof updatePayload];
      }
    });

    await this.repository.update(id, updatePayload, tenantId);
    const updated = await this.repository.findById(id, tenantId);
    if (!updated) throw new NotFoundException("Attendance record not found after update");

    await invalidateCache(`dashboard:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "attendance.updated",
        userId,
        tenantId,
        entityId: id,
        entityType: "attendance",
        metadata: { updates: data },
      });
    }

    await eventBus.publish(EVENTS.ATTENDANCE_UPDATED, {
      tenantId,
      attendanceId: id,
      updates: data,
    }, tenantId);

    return AttendancePersistenceMapper.fromFirestore(updated);
  }

  async deleteAttendance(tenantId: string, id: string, userId?: string): Promise<void> {
    const record = await this.repository.findById(id, tenantId);
    await this.repository.delete(id, tenantId);

    await invalidateCache(`dashboard:${tenantId}`);

    if (userId) {
      await this.audit.log({
        action: "attendance.deleted",
        userId,
        tenantId,
        entityId: id,
        entityType: "attendance",
        metadata: { studentId: record?.studentId, date: record?.date },
      });
    }

    await eventBus.publish(EVENTS.ATTENDANCE_DELETED, {
      tenantId,
      attendanceId: id,
      studentId: record?.studentId || "",
    }, tenantId);
  }

  async getTodayAttendance(tenantId: string): Promise<{ present: number; absent: number; late: number; total: number }> {
    const today = new Date().toISOString().slice(0, 10);
    const records = await this.repository.findWithFilters(tenantId, { date: today });
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

    const records = await this.repository.findWithFilters(tenantId, {
      dateRange: { gte: startStr, lte: endStr },
    });

    const byDate: Record<string, { present: number; total: number }> = {};
    for (const r of records) {
      if (!byDate[r.date]) byDate[r.date] = { present: 0, total: 0 };
      byDate[r.date].total++;
      if (r.status === "Present" || r.status === "Late") byDate[r.date].present++;
    }

    const trend: { day: string; percent: number }[] = [];
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
