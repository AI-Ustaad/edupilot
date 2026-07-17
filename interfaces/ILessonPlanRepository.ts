// interfaces/ILessonPlanRepository.ts
import type { LessonPlan } from "@/types/teacher";

export interface ILessonPlanRepository {
  findAll(tenantId: string): Promise<(LessonPlan & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(LessonPlan & { id: string }) | null>;
  create(data: Omit<LessonPlan, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  update(id: string, data: Partial<LessonPlan>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  paginate(tenantId: string, page: number, limit: number, orderBy?: string, direction?: "asc" | "desc"): Promise<{ data: (LessonPlan & { id: string })[]; total: number; page: number; totalPages: number }>;
}
