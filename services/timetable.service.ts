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

export class TimetableService {
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
    });

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
    });
  }
}
