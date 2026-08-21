import type { DepartmentDocument } from "@/documents/DepartmentDocument";

export interface IDepartmentRepository {
  getAll(tenantId: string): Promise<(DepartmentDocument & { id: string })[]>;
  create(data: DepartmentDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<DepartmentDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
  // Create-if-absent by tenant-scoped normalized name (Option A semantics).
  // Returns the document id and whether a new document was created.
  // On match, the existing document is reused and NO write occurs.
  createAbsentByName(
    tenantId: string,
    name: string,
    data: { code: string; description?: string; deleted: boolean; createdBy?: string }
  ): Promise<{ id: string; created: boolean }>;
}
