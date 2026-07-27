// services/homework.service.ts
import { HomeworkRepository } from "@/repositories/homework.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { createHomeworkSchema, updateHomeworkSchema } from "@/lib/validation/homework.schema";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";
import type { IHomeworkRepository } from "@/interfaces/IHomeworkRepository";
import type { Homework } from "@/types/homework";
import type { IHomeworkService } from "@/interfaces/IHomeworkService";

export class HomeworkService implements IHomeworkService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: IHomeworkRepository = new HomeworkRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async createHomework(data: unknown, tenantId: string, userId: string): Promise<Homework> {
    const parsed = this.validation.validateOrThrow(createHomeworkSchema, data);

    const createData = {
      ...parsed,
      tenantId,
      createdBy: userId,
    } as Omit<Homework, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData, tenantId);
    const record = await this.repo.findById(id, tenantId);
    if (!record) throw new Error("Homework not found after creation");

    await invalidateCache(`homework:${tenantId}`);
    await this.audit.log({
      action: "homework.created",
      userId,
      tenantId,
      entityId: id,
      entityType: "homework",
      metadata: { title: parsed.title, classGrade: parsed.classGrade, subject: parsed.subject },
    });

    await eventBus.publish(EVENTS.HOMEWORK_CREATED, {
      tenantId,
      homeworkId: id,
      title: parsed.title,
      classGrade: parsed.classGrade,
      subject: parsed.subject,
      createdBy: userId,
    }, tenantId);

    return record as Homework;
  }

  async listHomework(tenantId: string): Promise<Homework[]> {
    return (await this.repo.findAll(tenantId)) as Homework[];
  }

  async getById(id: string, tenantId: string): Promise<Homework | null> {
    return this.repo.findById(id, tenantId);
  }

  async updateHomework(id: string, data: unknown, tenantId: string, userId: string): Promise<Homework> {
    const parsed = this.validation.validateOrThrow(updateHomeworkSchema, data);
    await this.repo.update(id, parsed, tenantId);

    const updated = await this.repo.findById(id, tenantId);
    if (!updated) throw new Error("Homework not found after update");

    await invalidateCache(`homework:${tenantId}`);
    await this.audit.log({
      action: "homework.updated",
      userId,
      tenantId,
      entityId: id,
      entityType: "homework",
      metadata: { updates: parsed },
    });

    await eventBus.publish(EVENTS.HOMEWORK_UPDATED, {
      tenantId,
      homeworkId: id,
      updates: parsed,
      updatedBy: userId,
    }, tenantId);

    return updated as Homework;
  }

  async deleteHomework(id: string, tenantId: string, userId: string): Promise<void> {
    await this.repo.delete(id, tenantId);

    await invalidateCache(`homework:${tenantId}`);
    await this.audit.log({
      action: "homework.deleted",
      userId,
      tenantId,
      entityId: id,
      entityType: "homework",
    });

    await eventBus.publish(EVENTS.HOMEWORK_DELETED, {
      tenantId,
      homeworkId: id,
      deletedBy: userId,
    }, tenantId);
  }
}
