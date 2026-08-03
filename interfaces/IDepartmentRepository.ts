import type { DepartmentDocument } from "@/documents/DepartmentDocument";

export interface IDepartmentRepository {
  getAll(tenantId: string): Promise<(DepartmentDocument & { id: string })[]>;
  create(data: DepartmentDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<DepartmentDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
