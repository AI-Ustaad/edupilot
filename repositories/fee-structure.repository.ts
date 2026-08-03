import { BaseRepository } from "./base.repository";
import type { FeeStructureDocument } from "@/documents/FeeStructureDocument";
import type { IFeeStructureRepository } from "@/interfaces/IFeeStructureRepository";

export class FeeStructureRepository extends BaseRepository<FeeStructureDocument> implements IFeeStructureRepository {
  constructor() {
    super("fee_structures");
  }

  async getFeeStructures(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeStructureDocument & { id: string }));
  }
}
