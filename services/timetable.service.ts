// services/timetable.service.ts
import { TimetableRepository } from "@/repositories/timetable.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateTimetableEntrySchema } from "@/validators/timetable";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";
import type { ITimetableRepository } from "@/interfaces/ITimetableRepository";
import type { TimetableEntry } from "@/types/timetable";
import type { ITimetableService } from "@/interfaces/ITimetableService";

export class TimetableService implements ITimetableService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: ITimetableRepository = new TimetableRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async listEntries(tenantId: string): Promise<(TimetableEntry & { id: string })[]> {
    return this.repo.findAll(tenantId);
  }

  async createEntry(data: unknown, tenantId: string, userId?: string): Promise<string> {
    const validation = this.validation.validate(CreateTimetableEntrySchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.map(e => e.message).join(", ")}`);
    }
    const parsed = validation.data;

    // Conflict Detection: Teacher OR Class/Section already booked for day + period
    const existingEntries = await this.repo.findAll(tenantId);
    const normDay = (parsed.day || "").trim().toLowerCase();
    const normPeriod = (parsed.period || "").trim().toLowerCase();
    const normTeacher = (parsed.teacher || "").trim().toLowerCase();
    const normClass = (parsed.classGrade || "").trim().toLowerCase();
    const normSection = (parsed.section || "A").trim().toLowerCase();

    const conflict = existingEntries.find((e: any) => {
      if ((e.day || "").trim().toLowerCase() !== normDay) return false;
      if ((e.period || "").trim().toLowerCase() !== normPeriod) return false;

      const sameTeacher = Boolean(normTeacher && (e.teacher || "").trim().toLowerCase() === normTeacher);
      const sameClassSection = Boolean(
        (e.classGrade || "").trim().toLowerCase() === normClass &&
        (e.section || "A").trim().toLowerCase() === normSection
      );

      return sameTeacher || sameClassSection;
    });

    if (conflict) {
      const isTeacherConflict = Boolean(normTeacher && (conflict.teacher || "").trim().toLowerCase() === normTeacher);
      const message = isTeacherConflict
        ? `Conflict: Teacher ${parsed.teacher} is already assigned during period ${parsed.period} on ${parsed.day}.`
        : `Conflict: Class ${parsed.classGrade} (${parsed.section || "A"}) already has ${conflict.subject || "a class"} scheduled during period ${parsed.period} on ${parsed.day}.`;
      const err: any = new Error(message);
      err.statusCode = 409;
      err.status = 409;
      throw err;
    }

    const entryData = {
      ...parsed,
      tenantId,
      createdAt: new Date(),
    };

    const id = await this.repo.create(entryData as any, tenantId);

    if (userId) {
      await this.audit.log({
        action: "timetable.created",
        userId,
        tenantId,
        entityId: id,
        entityType: "timetable",
        metadata: { day: parsed.day, period: parsed.period, subject: parsed.subject },
      });
    }

    await invalidateCache(`dashboard:${tenantId}`);

    await eventBus.publish(EVENTS.TIMETABLE_CREATED, {
      tenantId,
      timetableId: id,
      day: parsed.day,
      period: parsed.period,
      subject: parsed.subject,
      createdBy: userId,
    }, tenantId);

    return id;
  }

  async deleteEntry(id: string, tenantId: string, userId?: string): Promise<void> {
    const entry = await this.repo.findById(id, tenantId);
    if (!entry) throw new Error("Timetable entry not found");

    await this.repo.delete(id, tenantId);

    if (userId) {
      await this.audit.log({
        action: "timetable.deleted",
        userId,
        tenantId,
        entityId: id,
        entityType: "timetable",
      });
    }

    await invalidateCache(`dashboard:${tenantId}`);

    await eventBus.publish(EVENTS.TIMETABLE_DELETED, {
      tenantId,
      timetableId: id,
      deletedBy: userId,
    }, tenantId);
  }
}
