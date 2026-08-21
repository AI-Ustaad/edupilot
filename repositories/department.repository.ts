import { BaseRepository } from "./base.repository";
import type { DepartmentDocument } from "@/documents/DepartmentDocument";
import type { IDepartmentRepository } from "@/interfaces/IDepartmentRepository";
import { normalizeNaturalKey } from "@/lib/utils/normalization";

export class DepartmentRepository extends BaseRepository<DepartmentDocument> implements IDepartmentRepository {
  constructor() {
    super("departments");
  }

  async getAll(tenantId: string) {
    const snapshot = await this.db.collection(this.collectionName).where("tenantId", "==", tenantId).where("deleted", "==", false).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DepartmentDocument & { id: string }));
  }

  // Design decision: create-if-absent (Option A).
  //
  // Provisioning is intentionally additive and never mutates operational
  // department fields (e.g. headOfDepartment set by operators). On a matching
  // natural key (tenantId + name, canonical-normalized), the existing document
  // is reused and NO write occurs. Only genuinely absent departments are
  // created. This is NOT a field-updating upsert.
  async createAbsentByName(
    tenantId: string,
    name: string,
    data: { code: string; description?: string; deleted: boolean; createdBy?: string }
  ): Promise<{ id: string; created: boolean }> {
    const existing = await this.getAll(tenantId);
    const normalized = normalizeNaturalKey(name);
    const found = existing.find((dept) => normalizeNaturalKey(dept.name) === normalized);
    if (found) {
      return { id: found.id, created: false };
    }

    const id = await this.create(
      { name, ...data, tenantId } as any,
      tenantId
    );
    return { id, created: true };
  }
}
