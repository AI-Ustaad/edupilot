// services/lesson-plan.service.ts
import { LessonPlanRepository } from "@/repositories/lesson-plan.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateLessonPlanSchema } from "@/validators/teacher";
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

    const createData = {
      ...parsed,
      tenantId,
      createdBy: userId,
    } as unknown as Omit<LessonPlan, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData as any, tenantId);
    const plan = await this.repo.findById(id, tenantId);
    if (!plan) throw new Error("Lesson plan created but could not be retrieved");

    await this.audit.log({
      action: "lesson_plan.created",
      userId,
      tenantId,
      entityId: id,
      entityType: "lesson_plan",
      metadata: { topic: parsed.topic, date: parsed.date },
    });

    return plan as LessonPlan;
  }

  async listLessonPlans(tenantId: string): Promise<(LessonPlan & { id: string })[]> {
    const plans = await this.repo.findAll(tenantId);
    plans.sort((a, b) => {
      const dateA = (a as any).createdAt?.toDate?.() || 0;
      const dateB = (b as any).createdAt?.toDate?.() || 0;
      return dateB - dateA;
    });
    return plans;
  }

  async getLessonPlanById(id: string, tenantId: string): Promise<(LessonPlan & { id: string }) | null> {
    return this.repo.findById(id, tenantId);
  }
}
