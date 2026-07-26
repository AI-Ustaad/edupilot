// services/parents.service.ts
import { ParentsRepository } from "@/repositories/parents.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { AuditService } from "./AuditService";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { invalidateCache } from "@/lib/cache";
import type { IParentRepository } from "@/interfaces/IParentRepository";
import type { IParentService } from "@/interfaces/IParentService";
import type { ParentEntity } from "@/entities/parent.entity";
import type { CreateParentDTO, UpdateParentDTO } from "@/dto";
import type { Student } from "@/types/student";
import type { PaginatedResult } from "@/types/api";
import { ParentPersistenceMapper } from "@/lib/mappers/ParentPersistenceMapper";

export class ParentsService implements IParentService {
  private audit: AuditService;
  private studentRepo: StudentRepository;
  private repository: IParentRepository;

  constructor(
    parentRepo?: IParentRepository,
    studentRepo?: StudentRepository
  ) {
    this.repository = parentRepo ?? new ParentsRepository();
    this.audit = new AuditService();
    this.studentRepo = studentRepo ?? new StudentRepository();
  }

  async getParent(userId: string, tenantId: string): Promise<ParentEntity | null> {
    const doc = await this.repository.findById(userId, tenantId);
    if (!doc) return null;
    return ParentPersistenceMapper.fromFirestore(doc);
  }

  async getChildren(userId: string, tenantId: string): Promise<Student[]> {
    const parent = await this.repository.findById(userId, tenantId);
    if (!parent || !parent.studentIds || parent.studentIds.length === 0) {
      return [];
    }

    const children = await this.studentRepo.batchFindByIds(tenantId, parent.studentIds);
    return children as unknown as Student[];
  }

  async getChildIds(userId: string, tenantId: string): Promise<string[]> {
    const parent = await this.repository.findById(userId, tenantId);
    return parent?.studentIds || [];
  }

  async isParentOf(userId: string, studentId: string, tenantId: string): Promise<boolean> {
    const parent = await this.repository.findById(userId, tenantId);
    return parent?.studentIds?.includes(studentId) ?? false;
  }

  async createParent(data: CreateParentDTO, tenantId: string, userId: string): Promise<string> {
    const entity = ParentPersistenceMapper.fromDTO(data);
    const document = ParentPersistenceMapper.toFirestore(entity, userId);
    document.tenantId = tenantId;

    const savedDoc = await this.repository.save(document, tenantId);
    const parentId = savedDoc.id || "";

    await this.audit.log({
      action: "parent.created",
      userId,
      tenantId,
      entityId: parentId,
      entityType: "parent",
      metadata: { email: data.email, studentIds: data.studentIds },
    });

    await invalidateCache(`dashboard:${tenantId}`);

    await eventBus.publish(EVENTS.PARENT_CREATED, {
      tenantId,
      parentId,
      email: data.email,
      studentIds: data.studentIds,
      createdBy: userId,
    }, tenantId);

    return parentId;
  }

  async updateParent(userId: string, data: UpdateParentDTO, tenantId: string, updatedBy: string): Promise<void> {
    const entity = ParentPersistenceMapper.fromDTO(data);
    const document = ParentPersistenceMapper.toFirestore(entity, updatedBy);
    
    const updatePayload: Record<string, unknown> = { ...document, updatedBy };
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key as keyof typeof updatePayload] === undefined) {
        delete updatePayload[key as keyof typeof updatePayload];
      }
    });

    await this.repository.update(userId, updatePayload, tenantId);

    await this.audit.log({
      action: "parent.updated",
      userId: updatedBy,
      tenantId,
      entityId: userId,
      entityType: "parent",
      metadata: { updatedFields: Object.keys(data) },
    });

    await eventBus.publish(EVENTS.PARENT_UPDATED, {
      tenantId,
      parentId: userId,
      updatedBy,
    }, tenantId);
  }

  async deleteParent(parentId: string, tenantId: string, userId: string): Promise<void> {
    await this.repository.delete(parentId, tenantId);

    await this.audit.log({
      action: "parent.deleted",
      userId,
      tenantId,
      entityId: parentId,
      entityType: "parent",
    });

    await invalidateCache(`dashboard:${tenantId}`);

    await eventBus.publish(EVENTS.PARENT_DELETED, {
      tenantId,
      parentId,
      deletedBy: userId,
    }, tenantId);
  }

  async paginate(tenantId: string, page: number = 1, limit: number = 50): Promise<PaginatedResult<ParentEntity>> {
    const result = await (this.repository as ParentsRepository).paginate(tenantId, page, limit);
    return {
      ...result,
      data: result.data.map(doc => ParentPersistenceMapper.fromFirestore(doc))
    };
  }
}
