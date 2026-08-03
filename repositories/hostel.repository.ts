import { BaseRepository } from "./base.repository";
import type { HostelDocument } from "@/documents/HostelDocument";
import type { IHostelRepository } from "@/interfaces/IHostelRepository";

export class HostelRepository extends BaseRepository<HostelDocument> implements IHostelRepository {
  constructor() {
    super("hostel_config");
  }

  async getAll(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).limit(1).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HostelDocument & { id: string }));
  }
}
