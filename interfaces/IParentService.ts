// interfaces/IParentService.ts
import type { ParentEntity } from "@/entities/parent.entity";
import type { CreateParentDTO, UpdateParentDTO } from "@/dto";
import type { Student } from "@/types/student";
import type { PaginatedResult } from "@/types/api";

export interface IParentService {
  getParent(userId: string, tenantId: string): Promise<ParentEntity | null>;
  getChildren(userId: string, tenantId: string): Promise<Student[]>;
  getChildIds(userId: string, tenantId: string): Promise<string[]>;
  isParentOf(userId: string, studentId: string, tenantId: string): Promise<boolean>;
  createParent(data: CreateParentDTO, tenantId: string, userId: string): Promise<string>;
  updateParent(userId: string, data: UpdateParentDTO, tenantId: string, updatedBy: string): Promise<void>;
  deleteParent(parentId: string, tenantId: string, userId: string): Promise<void>;
  paginate(tenantId: string, page: number, limit: number): Promise<PaginatedResult<ParentEntity>>;
}
