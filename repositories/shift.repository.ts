import { BaseRepository } from "./base.repository";
import type { ShiftDocument } from "@/documents/ShiftDocument";
import type { IShiftRepository } from "@/interfaces/IShiftRepository";

export class ShiftRepository extends BaseRepository<ShiftDocument> implements IShiftRepository {
  constructor() {
    super("shifts");
  }

  async getAll(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShiftDocument & { id: string }));
  }
}
