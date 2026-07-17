// repositories/lesson-plan.repository.ts
import { BaseRepository } from "./base.repository";
import type { LessonPlan } from "@/types/teacher";
import type { ILessonPlanRepository } from "@/interfaces/ILessonPlanRepository";

export class LessonPlanRepository extends BaseRepository<LessonPlan> implements ILessonPlanRepository {
  constructor() {
    super("lessonPlans");
  }
}
