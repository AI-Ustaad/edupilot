import type { FeeStructureDocument } from "@/documents/FeeStructureDocument";

export interface IFeeStructureRepository {
  getFeeStructures(tenantId: string): Promise<(FeeStructureDocument & { id: string })[]>;
  create(data: FeeStructureDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<FeeStructureDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
