import type { HostelDocument } from "@/documents/HostelDocument";

export interface IHostelRepository {
  getAll(tenantId: string): Promise<(HostelDocument & { id: string })[]>;
  create(data: HostelDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<HostelDocument>, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
