import { BaseRepository } from "./base.repository";
import type { RoomDocument } from "@/documents/RoomDocument";
import type { IRoomRepository } from "@/interfaces/IRoomRepository";
import type { TenantContext } from "@/types/api";

export class RoomRepository extends BaseRepository<RoomDocument> implements IRoomRepository {
  constructor() {
    super("rooms");
  }

  async getAll(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoomDocument & { id: string }));
  }

  async findByBuilding(buildingId: string, tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("buildingId", "==", buildingId).where("deleted", "==", false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoomDocument & { id: string }));
  }
}
