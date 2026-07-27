// services/behavior.service.ts
import { BehaviorRepository } from "@/repositories/behavior.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { RecordBehaviorSchema } from "@/validators/teacher";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";
import type { IBehaviorRepository } from "@/interfaces/IBehaviorRepository";
import type { BehaviorLog } from "@/types/teacher";
import type { IBehaviorService } from "@/interfaces/IBehaviorService";

export class BehaviorService implements IBehaviorService {
  private audit: AuditService;
  private validation: ValidationService;
  private studentRepo: StudentRepository;

  constructor(private repo: IBehaviorRepository = new BehaviorRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
    this.studentRepo = new StudentRepository();
  }

  async recordBehavior(data: unknown, tenantId: string, userId: string): Promise<{ success: boolean }> {
    const parsed = this.validation.validateOrThrow(RecordBehaviorSchema, data);

    await this.repo.create({
      studentId: parsed.studentId,
      points: parsed.points,
      reason: parsed.reason,
      recordedBy: userId,
      tenantId,
    }, tenantId);
    await invalidateCache(`behavior:${tenantId}:${parsed.studentId}`);

    // Update student's total behavior points via repository
    const student = await this.studentRepo.findById(parsed.studentId, tenantId);
    if (student) {
      const currentPoints = (student as any).behaviorPoints || 0;
      await this.studentRepo.update(parsed.studentId, { behaviorPoints: currentPoints + parsed.points } as any, tenantId);
    }

    await this.audit.log({
      action: "behavior.recorded",
      userId,
      tenantId,
      entityId: parsed.studentId,
      entityType: "behavior_log",
      metadata: { points: parsed.points, reason: parsed.reason },
    });

    await eventBus.publish(EVENTS.BEHAVIOR_RECORDED, {
      tenantId,
      studentId: parsed.studentId,
      points: parsed.points,
      reason: parsed.reason,
      recordedBy: userId,
    }, tenantId);

    return { success: true };
  }

  async getBehaviorLogs(studentId: string, tenantId: string): Promise<(BehaviorLog & { id: string })[]> {
    return this.repo.findByStudent(studentId, tenantId, 20);
  }
}
