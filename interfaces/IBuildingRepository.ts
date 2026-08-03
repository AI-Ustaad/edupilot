import type { BuildingDocument } from "@/documents/BuildingDocument";

export interface IBuildingRepository {
  getAll(tenantId: string): Promise<(BuildingDocument & { id: string })[]>;
  create(data: BuildingDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<BuildingDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<(BuildingDocument & { id: string }) | null>;
}
