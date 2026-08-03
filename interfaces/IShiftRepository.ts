import type { ShiftDocument } from "@/documents/ShiftDocument";

export interface IShiftRepository {
  getAll(tenantId: string): Promise<(ShiftDocument & { id: string })[]>;
  create(data: ShiftDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<ShiftDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
