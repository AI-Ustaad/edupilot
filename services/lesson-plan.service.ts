// services/lesson-plan.service.ts
import { LessonPlanRepository } from "@/repositories/lesson-plan.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateLessonPlanSchema, UpdateLessonPlanSchema } from "@/validators/teacher";
import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";
import type { ILessonPlanRepository } from "@/interfaces/ILessonPlanRepository";
import type { LessonPlan } from "@/types/teacher";

export class LessonPlanService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: ILessonPlanRepository = new LessonPlanRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async createLessonPlan(data: unknown, tenantId: string, userId: string): Promise<LessonPlan> {
    const parsed = this.validation.validateOrThrow(CreateLessonPlanSchema, data);

    const createData: Omit<LessonPlan, "id" | "createdAt" | "updatedAt"> = {
      ...parsed,
      tenantId,
      createdBy: userId,
    } as Omit<LessonPlan, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData, tenantId);
    const plan = await this.repo.findById(id, tenantId);
    if (!plan) throw new Error("Lesson plan created but could not be retrieved");
    await invalidateCache(`lessonPlans:${tenantId}`);

    await this.audit.log({
      action: "lesson_plan.created",
      userId,
      tenantId,
      entityId: id,
      entityType: "lesson_plan",
      metadata: { topic: parsed.topic, date: parsed.date },
    });

    eventBus.publish(EVENTS.LESSON_PLAN_CREATED, {
      tenantId,
      lessonPlanId: id,
      topic: parsed.topic,
      date: parsed.date,
      createdBy: userId,
    });

    return plan as LessonPlan;
  }

  async listLessonPlans(tenantId: string, page = 1, limit = 50): Promise<{ data: (LessonPlan & { id: string })[]; total: number; page: number; totalPages: number }> {
    return this.repo.paginate(tenantId, page, limit, "createdAt", "desc");
  }

  async getLessonPlanById(id: string, tenantId: string): Promise<(LessonPlan & { id: string }) | null> {
    return this.repo.findById(id, tenantId);
  }

  async updateLessonPlan(id: string, data: unknown, tenantId: string, userId: string): Promise<void> {
    const parsed = this.validation.validateOrThrow(UpdateLessonPlanSchema, data);
    await this.repo.update(id, parsed, tenantId);
    await invalidateCache(`lessonPlans:${tenantId}`);

    await this.audit.log({
      action: "lesson_plan.updated",
      userId,
      tenantId,
      entityId: id,
      entityType: "lesson_plan",
      metadata: { updates: parsed },
    });

    eventBus.publish(EVENTS.LESSON_PLAN_UPDATED, {
      tenantId,
      lessonPlanId: id,
      topic: parsed.topic,
      date: parsed.date,
      updatedBy: userId,
    });
  }

  async deleteLessonPlan(id: string, tenantId: string, userId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
    await invalidateCache(`lessonPlans:${tenantId}`);

    await this.audit.log({
      action: "lesson_plan.deleted",
      userId,
      tenantId,
      entityId: id,
      entityType: "lesson_plan",
    });

    eventBus.publish(EVENTS.LESSON_PLAN_DELETED, {
      tenantId,
      lessonPlanId: id,
      deletedBy: userId,
    });
  }
}
