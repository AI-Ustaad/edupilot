// interfaces/IAssignmentRepository.ts
import type { Assignment, AssignmentSubmission } from "@/types/teacher";

export interface IAssignmentRepository {
  findAll(tenantId: string): Promise<(Assignment & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(Assignment & { id: string }) | null>;
  create(data: Omit<Assignment, "id" | "createdAt" | "updatedAt">, tenantId: string): Promise<string>;
  update(id: string, data: Partial<Assignment>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  paginate(tenantId: string, page: number, limit: number, orderBy?: string, direction?: "asc" | "desc"): Promise<{ data: (Assignment & { id: string })[]; total: number; page: number; totalPages: number }>;
  // Submissions
  findSubmissionsByAssignment(assignmentId: string, tenantId: string): Promise<(AssignmentSubmission & { id: string })[]>;
  createSubmission(data: Omit<AssignmentSubmission, "id" | "createdAt">, tenantId: string): Promise<string>;
}
