import type { GradingDocument } from "@/documents/GradingDocument";

export interface IGradingRepository {
  getAll(tenantId: string): Promise<(GradingDocument & { id: string })[]>;
  create(data: GradingDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<GradingDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
