// interfaces/ILessonPlanService.ts
import type { LessonPlan } from "@/types/teacher";

export interface ILessonPlanService {
  createLessonPlan(data: unknown, tenantId: string, userId: string): Promise<LessonPlan>;
  listLessonPlans(tenantId: string, page?: number, limit?: number): Promise<{ data: (LessonPlan & { id: string })[]; total: number; page: number; totalPages: number }>;
  getLessonPlanById(id: string, tenantId: string): Promise<(LessonPlan & { id: string }) | null>;
  updateLessonPlan(id: string, data: unknown, tenantId: string, userId: string): Promise<void>;
  deleteLessonPlan(id: string, tenantId: string, userId: string): Promise<void>;
}
