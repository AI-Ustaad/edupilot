import { BaseRepository } from "./base.repository";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";

export interface Section {
  classGrade: string;
  sectionName: string;
  incharge?: string;
  subjects?: { core: string[]; electives: string[] };
  tenantId: string;
  deleted?: boolean;
  deletedAt?: any;
  deletedBy?: string;
  createdBy?: string;
}

export class SectionRepository extends BaseRepository<Section> {
  constructor() {
    super("sections");
  }

  async findAllActive(tenantId: string): Promise<(Section & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .get();
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Section & { id: string }))
      .filter(s => !s.deleted);
  }

  async softDeleteBySectionId(id: string, tenantId: string, userId: string): Promise<void> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
      throw new Error("Section not found or unauthorized");
    }
    await docRef.update({
      deleted: true,
      deletedAt: dbTimestamp,
      deletedBy: userId,
      updatedAt: dbTimestamp,
    });
  }

  async deleteAllForTenant(tenantId: string): Promise<void> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .get();
    const batch = this.db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}
