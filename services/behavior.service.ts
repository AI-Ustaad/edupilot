// services/behavior.service.ts
import { BehaviorRepository } from "@/repositories/behavior.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { RecordBehaviorSchema } from "@/validators/teacher";
import { adminDb } from "@/lib/firebase-admin";
import type { IBehaviorRepository } from "@/interfaces/IBehaviorRepository";
import type { BehaviorLog } from "@/types/teacher";

export class BehaviorService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: IBehaviorRepository = new BehaviorRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
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

    // Update student's total behavior points
    const studentRef = adminDb.collection("students").doc(parsed.studentId);
    const studentDoc = await studentRef.get();
    if (studentDoc.exists) {
      const currentPoints = studentDoc.data()?.behaviorPoints || 0;
      await studentRef.update({ behaviorPoints: currentPoints + parsed.points });
    }

    await this.audit.log({
      action: "behavior.recorded",
      userId,
      tenantId,
      entityId: parsed.studentId,
      entityType: "behavior_log",
      metadata: { points: parsed.points, reason: parsed.reason },
    });

    return { success: true };
  }

  async getBehaviorLogs(studentId: string, tenantId: string): Promise<(BehaviorLog & { id: string })[]> {
    return this.repo.findByStudent(studentId, tenantId, 20);
  }
}
