import { BaseRepository } from "./base.repository";
import type { TransportDocument } from "@/documents/TransportDocument";
import type { ITransportRepository } from "@/interfaces/ITransportRepository";

export class TransportRepository extends BaseRepository<TransportDocument> implements ITransportRepository {
  constructor() {
    super("transport_config");
  }

  async getAll(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).limit(1).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransportDocument & { id: string }));
  }
}
