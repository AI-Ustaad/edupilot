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
    const snapshot = await this.db
      .collection("submissions")
      .where("assignmentId", "==", assignmentId)
      .where("tenantId", "==", tenantId)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AssignmentSubmission & { id: string }));
  }

  async createSubmission(data: Omit<AssignmentSubmission, "id" | "createdAt">, _tenantId: string): Promise<string> {
    const docRef = await this.db.collection("submissions").add({
      ...data,
      createdAt: dbTimestamp,
    });
    return docRef.id;
  }
}
