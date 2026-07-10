// services/assignment.service.ts
import { AssignmentRepository } from "@/repositories/assignment.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateAssignmentSchema, UpdateAssignmentSchema } from "@/validators/teacher";
import { invalidateCache } from "@/lib/cache";
import type { IAssignmentRepository } from "@/interfaces/IAssignmentRepository";
import type { Assignment } from "@/types/teacher";
import { adminStorage } from "@/lib/firebase-admin";

export class AssignmentService {
  private audit: AuditService;
  private validation: ValidationService;

  constructor(private repo: IAssignmentRepository = new AssignmentRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
  }

  async createAssignment(data: unknown, tenantId: string, userId: string): Promise<Assignment> {
    const parsed = this.validation.validateOrThrow(CreateAssignmentSchema, data);

    const createData = {
      ...parsed,
      tenantId,
      createdBy: userId,
    } as unknown as Omit<Assignment, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData as any, tenantId);
    const assignment = await this.repo.findById(id, tenantId);
    if (!assignment) throw new Error("Assignment created but could not be retrieved");

    await invalidateCache(`dashboard:${tenantId}`);
    await this.audit.log({
      action: "assignment.created",
      userId,
      tenantId,
      entityId: id,
      entityType: "assignment",
      metadata: { title: parsed.title, classGrade: parsed.classGrade, subject: parsed.subject },
    });

    return assignment as Assignment;
  }

  async listAssignments(tenantId: string): Promise<(Assignment & { id: string })[]> {
    const assignments = await this.repo.findAll(tenantId);
    assignments.sort((a, b) => {
      const dateA = (a as any).createdAt?.toDate?.() || 0;
      const dateB = (b as any).createdAt?.toDate?.() || 0;
      return dateB - dateA;
    });
    return assignments;
  }

  async getAssignmentById(id: string, tenantId: string): Promise<(Assignment & { id: string }) | null> {
    return this.repo.findById(id, tenantId);
  }

  async deleteAssignment(id: string, tenantId: string, userId: string): Promise<void> {
    await this.repo.delete(id, tenantId);
    await invalidateCache(`dashboard:${tenantId}`);
    await this.audit.log({
      action: "assignment.deleted",
      userId,
      tenantId,
      entityId: id,
      entityType: "assignment",
    });
  }

  async submitAssignment(
    assignmentId: string,
    studentId: string,
    studentName: string,
    fileUrl: string,
    fileName: string,
    tenantId: string,
    userId: string
  ): Promise<string> {
    const id = await this.repo.createSubmission({
      assignmentId,
      studentId,
      studentName,
      fileUrl,
      fileName,
      submittedBy: userId,
      tenantId,
    }, tenantId);

    await this.audit.log({
      action: "assignment.submitted",
      userId,
      tenantId,
      entityId: id,
      entityType: "assignment_submission",
      metadata: { assignmentId, studentId },
    });

    return id;
  }

  async getSubmissions(assignmentId: string, tenantId: string) {
    return this.repo.findSubmissionsByAssignment(assignmentId, tenantId);
  }

  async uploadSubmissionFile(file: File, tenantId: string, assignmentId: string, studentId: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${tenantId}/submissions/${assignmentId}/${studentId}_${Date.now()}_${file.name}`;
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(fileName);
    await fileRef.save(buffer, { contentType: file.type });
    await fileRef.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  }
}
