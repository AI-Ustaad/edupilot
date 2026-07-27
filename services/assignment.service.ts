// services/assignment.service.ts
import { AssignmentRepository } from "@/repositories/assignment.repository";
import { StorageRepository } from "@/repositories/storage.repository";
import { AuditService } from "./AuditService";
import { ValidationService } from "./ValidationService";
import { CreateAssignmentSchema, UpdateAssignmentSchema } from "@/validators/teacher";
import { invalidateCache } from "@/lib/cache";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import type { IAssignmentRepository } from "@/interfaces/IAssignmentRepository";
import type { Assignment } from "@/types/teacher";
import type { IAssignmentService } from "@/interfaces/IAssignmentService";

export class AssignmentService implements IAssignmentService {
  private audit: AuditService;
  private validation: ValidationService;
  private storageRepo: StorageRepository;

  constructor(private repo: IAssignmentRepository = new AssignmentRepository()) {
    this.audit = new AuditService();
    this.validation = new ValidationService();
    this.storageRepo = new StorageRepository();
  }

  async createAssignment(data: unknown, tenantId: string, userId: string): Promise<Assignment> {
    const parsed = this.validation.validateOrThrow(CreateAssignmentSchema, data);

    const createData: Omit<Assignment, "id" | "createdAt" | "updatedAt"> = {
      ...parsed,
      tenantId,
      createdBy: userId,
    } as Omit<Assignment, "id" | "createdAt" | "updatedAt">;

    const id = await this.repo.create(createData, tenantId);
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

    await eventBus.publish(EVENTS.ASSIGNMENT_CREATED, {
      tenantId,
      assignmentId: id,
      title: parsed.title,
      classGrade: parsed.classGrade,
      subject: parsed.subject,
      createdBy: userId,
    }, tenantId);

    return assignment as Assignment;
  }

  async listAssignments(tenantId: string, page = 1, limit = 50): Promise<{ data: (Assignment & { id: string })[]; total: number; page: number; totalPages: number }> {
    return this.repo.paginate(tenantId, page, limit, "createdAt", "desc");
  }

  async getAssignmentById(id: string, tenantId: string): Promise<(Assignment & { id: string }) | null> {
    return this.repo.findById(id, tenantId);
  }

  async updateAssignment(id: string, data: unknown, tenantId: string, userId: string): Promise<void> {
    const parsed = this.validation.validateOrThrow(UpdateAssignmentSchema, data);
    await this.repo.update(id, parsed, tenantId);
    await invalidateCache(`dashboard:${tenantId}`);

    await this.audit.log({
      action: "assignment.updated",
      userId,
      tenantId,
      entityId: id,
      entityType: "assignment",
      metadata: { updates: parsed },
    });

    await eventBus.publish(EVENTS.ASSIGNMENT_UPDATED, {
      tenantId,
      assignmentId: id,
      updates: parsed,
      updatedBy: userId,
    }, tenantId);
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

    await eventBus.publish(EVENTS.ASSIGNMENT_DELETED, {
      tenantId,
      assignmentId: id,
      deletedBy: userId,
    }, tenantId);
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

    await eventBus.publish(EVENTS.ASSIGNMENT_SUBMITTED, {
      tenantId,
      assignmentId,
      studentId,
      submissionId: id,
    }, tenantId);

    return id;
  }

  async getSubmissions(assignmentId: string, tenantId: string) {
    return this.repo.findSubmissionsByAssignment(assignmentId, tenantId);
  }

  async uploadSubmissionFile(file: File, tenantId: string, assignmentId: string, studentId: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${tenantId}/submissions/${assignmentId}/${studentId}_${Date.now()}_${file.name}`;
    return this.storageRepo.uploadFile(buffer, fileName, file.type);
  }
}
