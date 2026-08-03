import type { HouseDocument } from "@/documents/HouseDocument";

export interface IHouseRepository {
  getAll(tenantId: string): Promise<(HouseDocument & { id: string })[]>;
  create(data: HouseDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<HouseDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
