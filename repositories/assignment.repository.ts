// repositories/assignment.repository.ts
import { BaseRepository } from "./base.repository";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import type { Assignment, AssignmentSubmission } from "@/types/teacher";
import type { IAssignmentRepository } from "@/interfaces/IAssignmentRepository";

export class AssignmentRepository extends BaseRepository<Assignment> implements IAssignmentRepository {
  constructor() {
    super("assignments");
  }

  async findSubmissionsByAssignment(assignmentId: string, tenantId: string): Promise<(AssignmentSubmission & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection("submissions")
        .where("assignmentId", "==", assignmentId)
        .where("tenantId", "==", tenantId)
        .get();
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AssignmentSubmission & { id: string }));
      return list.sort((a: any, b: any) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });
    } catch {
      return [];
    }
  }

  async createSubmission(data: Omit<AssignmentSubmission, "id" | "createdAt">, tenantId: string): Promise<string> {
    const docRef = await this.db.collection("submissions").add({
      ...data,
      tenantId: tenantId || (data as any).tenantId,
      schoolId: tenantId || (data as any).schoolId,
      createdAt: dbTimestamp,
      updatedAt: dbTimestamp,
    });
    return docRef.id;
  }
}
