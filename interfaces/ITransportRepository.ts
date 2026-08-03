import type { TransportDocument } from "@/documents/TransportDocument";

export interface ITransportRepository {
  getAll(tenantId: string): Promise<(TransportDocument & { id: string })[]>;
  create(data: TransportDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<TransportDocument>, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
