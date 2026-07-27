// interfaces/IBehaviorService.ts
import type { BehaviorLog } from "@/types/teacher";

export interface IBehaviorService {
  recordBehavior(data: unknown, tenantId: string, userId: string): Promise<{ success: boolean }>;
  getBehaviorLogs(studentId: string, tenantId: string): Promise<(BehaviorLog & { id: string })[]>;
}
