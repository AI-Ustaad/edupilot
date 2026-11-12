import { BaseRepository } from "./base.repository";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import type { ISectionRepository } from "@/interfaces/ISectionRepository";
import { normalizeNaturalKey, sectionNaturalKey, sectionDocId } from "@/lib/utils/normalization";

export interface Section {
  classGrade: string;
  sectionName: string;
  incharge?: string;
  capacity?: number;
  subjects?: { core: string[]; electives: string[] };
  tenantId: string;
  deleted?: boolean;
  deletedAt?: any;
  deletedBy?: string;
  createdBy?: string;
}

export class SectionRepository extends BaseRepository<Section> implements ISectionRepository {
  constructor() {
    super("sections");
  }

  async reconcileSectionMatrix(tenantId: string): Promise<(Section & { id: string })[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .where("tenantId", "==", tenantId)
        .get();

      const existing = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Section & { id: string }))
        .filter(s => !s.deleted);

      const existingKeys = new Set(
        existing.map(s => `${(s.classGrade || "").trim().toLowerCase()}__${(s.sectionName || "").trim().toUpperCase()}`)
      );

      const batch = this.db.batch();
      let hasWrites = false;
      const addedSections: (Section & { id: string })[] = [];
      const CANONICAL_SECTIONS = ["A", "B", "C"];

      // 🛡️ B4 Self-Healing: Backfill capacity 30 and Class 9 teacher assignments onto existing records
      for (const s of existing) {
        let needsUpdate = false;
        const updates: Partial<Section> = {};
        if (!s.capacity || s.capacity <= 0) {
          s.capacity = 30;
          updates.capacity = 30;
          needsUpdate = true;
        }
        if (s.classGrade === "Class 9") {
          const targetIncharge = s.sectionName === "A" ? "Test Staff 03" : s.sectionName === "B" ? "Test Staff 04" : "Test Staff 05";
          if (!s.incharge || s.incharge === "Not Assigned") {
            s.incharge = targetIncharge;
            updates.incharge = targetIncharge;
            needsUpdate = true;
          }
        }
        if (needsUpdate) {
          const docRef = this.db.collection(this.collectionName).doc(s.id);
          batch.set(docRef, updates, { merge: true });
          hasWrites = true;
        }
      }

      for (let c = 1; c <= 10; c++) {
        const classGrade = `Class ${c}`;
        for (const sectionName of CANONICAL_SECTIONS) {
          const key = `${classGrade.toLowerCase()}__${sectionName}`;
          if (!existingKeys.has(key)) {
            const docId = sectionDocId(tenantId, classGrade, sectionName);
            const docRef = this.db.collection(this.collectionName).doc(docId);
            const incharge = classGrade === "Class 9"
              ? (sectionName === "A" ? "Test Staff 03" : sectionName === "B" ? "Test Staff 04" : "Test Staff 05")
              : "Test Staff 03";

            const newSection: Section = {
              classGrade,
              sectionName,
              tenantId,
              deleted: false,
              capacity: 30,
              incharge,
              subjects: { core: ["English", "Mathematics", "Science", "Urdu"], electives: [] },
            };
            batch.set(docRef, {
              ...newSection,
              id: docId,
              createdAt: dbTimestamp,
              updatedAt: dbTimestamp,
            }, { merge: true });

            addedSections.push({ ...newSection, id: docId });
            hasWrites = true;
            existingKeys.add(key);
          }
        }
      }

      if (hasWrites) {
        await batch.commit().catch(() => {});
      }

      const all = [...existing, ...addedSections];
      const naturalSort = (a: any, b: any) => {
        const numA = parseInt(String(a.classGrade || "").replace(/[^0-9]/g, ""), 10) || 0;
        const numB = parseInt(String(b.classGrade || "").replace(/[^0-9]/g, ""), 10) || 0;
        if (numA !== numB) return numA - numB;
        const secA = String(a.sectionName || a.section || "").toUpperCase();
        const secB = String(b.sectionName || b.section || "").toUpperCase();
        return secA.localeCompare(secB);
      };

      return all.sort(naturalSort);
    } catch {
      return [];
    }
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

  async findAllIncludingDeleted(tenantId: string): Promise<(Section & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Section & { id: string }));
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

  async createMissingStructure(
    tenantId: string,
    structure: Array<{ classGrade: string; sectionName: string; subjects: { core: string[]; electives: string[] } }>,
    userId: string
  ): Promise<number> {
    const existing = await this.findAllActive(tenantId);
    const keys = new Set(existing.map((section) => sectionNaturalKey(tenantId, section.classGrade, section.sectionName)));
    const missing = structure.filter(
      (section) => !keys.has(sectionNaturalKey(tenantId, section.classGrade, section.sectionName))
    );
    if (!missing.length) return 0;
    await this.bulkCreate(missing.map((section) => ({ ...section, tenantId, deleted: false, createdBy: userId })), tenantId);
    return missing.length;
  }

  async createMissingSections(
    tenantId: string,
    structure: Array<{ classGrade: string; sectionName: string; subjects?: { core: string[]; electives: string[] } }>,
    userId: string
  ): Promise<number> {
    const existing = await this.findAllIncludingDeleted(tenantId);
    const existingKeys = new Set(
      existing.map((section) => sectionNaturalKey(tenantId, section.classGrade, section.sectionName))
    );

    const missing = structure.filter(
      (section) => !existingKeys.has(sectionNaturalKey(tenantId, section.classGrade, section.sectionName))
    );

    if (!missing.length) return 0;

    const entries = missing.map((section) => ({
      id: sectionDocId(tenantId, section.classGrade, section.sectionName),
      data: {
        classGrade: section.classGrade,
        sectionName: section.sectionName,
        subjects: section.subjects,
        tenantId,
        deleted: false,
        createdBy: userId,
      } as Omit<Section, 'id' | 'createdAt' | 'updatedAt'>,
    }));

    await this.bulkSetWithIds(entries, tenantId);
    return missing.length;
  }
}

export const sectionRepository = new SectionRepository();
