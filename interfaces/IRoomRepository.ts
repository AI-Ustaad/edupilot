import type { RoomDocument } from "@/documents/RoomDocument";

export interface IRoomRepository {
  getAll(tenantId: string): Promise<(RoomDocument & { id: string })[]>;
  findByBuilding(buildingId: string, tenantId: string): Promise<(RoomDocument & { id: string })[]>;
  create(data: RoomDocument, tenantId: string): Promise<string>;
  update(id: string, data: Partial<RoomDocument>, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<(RoomDocument & { id: string }) | null>;
}
