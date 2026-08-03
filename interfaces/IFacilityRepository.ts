import type { FacilityDocument } from "@/documents/FacilityDocument";

export interface IFacilityRepository {
  getAll(tenantId: string): Promise<(FacilityDocument & { id: string })[]>;
  create(data: FacilityDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<FacilityDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
