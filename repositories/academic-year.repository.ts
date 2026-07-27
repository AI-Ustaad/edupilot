import { BaseRepository } from "./base.repository";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import type { IAcademicYearRepository } from "@/interfaces/IAcademicYearRepository";

export interface AcademicYear {
  name: string;
  startDate: string | any;
  endDate: string | any;
  isCurrent: boolean;
  tenantId: string;
  createdBy?: string;
}

export class AcademicYearRepository extends BaseRepository<AcademicYear> implements IAcademicYearRepository {
  constructor() {
    super("academicYears");
  }

  async findAllByTenant(tenantId: string): Promise<(AcademicYear & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .orderBy("startDate", "desc")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AcademicYear & { id: string }));
  }

  async setCurrent(id: string, tenantId: string): Promise<void> {
    // Unset all current flags for this tenant
    const all = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .get();
    const batch = this.db.batch();
    all.docs.forEach(doc => batch.update(doc.ref, { isCurrent: false }));
    await batch.commit();

    // Set the target as current
    await this.db.collection(this.collectionName).doc(id).update({ isCurrent: true });
  }
}
