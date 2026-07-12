// services/parents.service.ts
import { ParentsRepository } from "@/repositories/parents.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { AuditService } from "./AuditService";
import type { IParentRepository } from "@/interfaces/IParentRepository";
import type { Parent } from "@/types/parents";
import type { Student } from "@/types/student";

export class ParentsService {
  private audit: AuditService;
  private studentRepo: StudentRepository;

  constructor(
    private parentRepo: IParentRepository = new ParentsRepository(),
    studentRepo?: StudentRepository
  ) {
    this.audit = new AuditService();
    this.studentRepo = studentRepo ?? new StudentRepository();
  }

  async getParent(userId: string, tenantId: string): Promise<(Parent & { id: string }) | null> {
    return this.parentRepo.findById(userId, tenantId);
  }

  async getChildren(userId: string, tenantId: string): Promise<Student[]> {
    const parent = await this.parentRepo.findById(userId, tenantId);
    if (!parent || !parent.studentIds || parent.studentIds.length === 0) {
      return [];
    }

    // Batch fetch all children in minimal queries (30 per batch) instead of N sequential queries
    const children = await this.studentRepo.batchFindByIds(tenantId, parent.studentIds);
    return children as Student[];
  }

  async getChildIds(userId: string, tenantId: string): Promise<string[]> {
    const parent = await this.parentRepo.findById(userId, tenantId);
    return parent?.studentIds || [];
  }

  async isParentOf(userId: string, studentId: string, tenantId: string): Promise<boolean> {
    const parent = await this.parentRepo.findById(userId, tenantId);
    return parent?.studentIds?.includes(studentId) ?? false;
  }

  async createParent(
    data: { email: string; fullName: string; phone?: string; studentIds: string[] },
    tenantId: string,
    userId: string
  ): Promise<string> {
    const parentData: Omit<Parent, "id" | "createdAt" | "updatedAt"> = {
      tenantId,
      studentIds: data.studentIds,
      name: data.fullName,
      email: data.email,
      phone: data.phone || "",
    };

    const parentId = await this.parentRepo.create(parentData, tenantId);

    await this.audit.log({
      action: "parent.created",
      userId,
      tenantId,
      entityId: parentId,
      entityType: "parent",
      metadata: { email: data.email, studentIds: data.studentIds },
    });

    return parentId;
  }

  async deleteParent(parentId: string, tenantId: string, userId: string): Promise<void> {
    await this.parentRepo.delete(parentId, tenantId);

    await this.audit.log({
      action: "parent.deleted",
      userId,
      tenantId,
      entityId: parentId,
      entityType: "parent",
    });
  }

  async paginate(
    tenantId: string,
    page: number = 1,
    limit: number = 50
  ) {
    return (this.parentRepo as ParentsRepository).paginate(tenantId, page, limit);
  }
}

