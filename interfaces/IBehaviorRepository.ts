// interfaces/IBehaviorRepository.ts
import type { BehaviorLog } from "@/types/teacher";

export interface IBehaviorRepository {
  findAll(tenantId: string): Promise<(BehaviorLog & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(BehaviorLog & { id: string }) | null>;
  create(data: Omit<BehaviorLog, "id" | "createdAt">, tenantId: string): Promise<string>;
  findByStudent(studentId: string, tenantId: string, limit?: number): Promise<(BehaviorLog & { id: string })[]>;
}
