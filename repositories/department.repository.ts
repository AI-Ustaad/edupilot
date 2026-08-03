import { BaseRepository } from "./base.repository";
import type { DepartmentDocument } from "@/documents/DepartmentDocument";
import type { IDepartmentRepository } from "@/interfaces/IDepartmentRepository";

export class DepartmentRepository extends BaseRepository<DepartmentDocument> implements IDepartmentRepository {
  constructor() {
    super("departments");
  }

  async getAll(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DepartmentDocument & { id: string }));
  }
}
