// interfaces/IAssignmentService.ts
import type { Assignment } from "@/types/teacher";

export interface IAssignmentService {
  createAssignment(data: unknown, tenantId: string, userId: string): Promise<Assignment>;
  listAssignments(tenantId: string, page?: number, limit?: number): Promise<{ data: (Assignment & { id: string })[]; total: number; page: number; totalPages: number }>;
  getAssignmentById(id: string, tenantId: string): Promise<(Assignment & { id: string }) | null>;
  updateAssignment(id: string, data: unknown, tenantId: string, userId: string): Promise<void>;
  deleteAssignment(id: string, tenantId: string, userId: string): Promise<void>;
  submitAssignment(assignmentId: string, studentId: string, studentName: string, fileUrl: string, fileName: string, tenantId: string, userId: string): Promise<string>;
  getSubmissions(assignmentId: string, tenantId: string): Promise<any[]>;
  uploadSubmissionFile(file: File, tenantId: string, assignmentId: string, studentId: string): Promise<string>;
}
