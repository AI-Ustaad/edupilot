import { BaseRepository } from "./base.repository";
import type { GradingDocument } from "@/documents/GradingDocument";
import type { IGradingRepository } from "@/interfaces/IGradingRepository";

export class GradingRepository extends BaseRepository<GradingDocument> implements IGradingRepository {
  constructor() {
    super("grading_systems");
  }

  async getAll(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GradingDocument & { id: string }));
  }
}
