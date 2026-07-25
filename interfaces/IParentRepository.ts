// interfaces/IParentRepository.ts
import type { ParentDocument } from "@/documents/ParentDocument";
import type { PaginatedResult } from "@/types/api";

export interface IParentRepository {
  findAll(tenantId: string): Promise<(ParentDocument & { id: string })[]>;
  findById(id: string, tenantId: string): Promise<(ParentDocument & { id: string }) | null>;
  create(data: Omit<ParentDocument, 'id' | 'createdAt' | 'updatedAt'>, tenantId: string): Promise<string>;
  save(document: ParentDocument, tenantId: string): Promise<ParentDocument>;
  update(id: string, document: Partial<ParentDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  count(tenantId: string): Promise<number>;
  exists(id: string, tenantId: string): Promise<boolean>;
  paginate(
    tenantId: string,
    page: number,
    limit: number,
    orderBy?: string,
    direction?: "asc" | "desc"
  ): Promise<PaginatedResult<ParentDocument>>;
}
