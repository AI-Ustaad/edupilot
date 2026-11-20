import { BaseRepository } from "./base.repository";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import type { ISectionRepository } from "@/interfaces/ISectionRepository";
import { normalizeNaturalKey, sectionNaturalKey, sectionDocId } from "@/lib/utils/normalization";
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";

export interface Section {
  classGrade: string;
  sectionName: string;
  incharge?: string;
  classTeacherName?: string;
  classTeacherId?: string | null;
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
      const [snapshot, staffSnapshot] = await Promise.all([
        this.db.collection(this.collectionName).where("tenantId", "==", tenantId).get(),
        this.db.collection("staff").where("tenantId", "==", tenantId).get().catch(() => null),
      ]);

      // Identify real staff members for this tenant (e.g. ghzandar Ali)
      const validStaff = (staffSnapshot ? staffSnapshot.docs : [])
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((st: any) => !st.deleted);

      const realStaffMap = new Map<string, { id: string; name: string }>();
      validStaff.forEach((st: any) => {
        const fullName = (st.name || st.fullName || `${st.firstName || ""} ${st.lastName || ""}`.trim()).trim();
        if (fullName) {
          realStaffMap.set(fullName.toLowerCase(), { id: st.id, name: fullName });
          realStaffMap.set(st.id.toLowerCase(), { id: st.id, name: fullName });
        }
      });

      // Sort valid staff deterministically (STF-001 ghzandar Ali first, then STF-002, etc.)
      validStaff.sort((a: any, b: any) => {
        const aName = (a.name || a.fullName || a.personal?.fullName || "").toLowerCase();
        const bName = (b.name || b.fullName || b.personal?.fullName || "").toLowerCase();
        const aId = a.employeeId || a.professional?.employeeId || a.id || "";
        const bId = b.employeeId || b.professional?.employeeId || b.id || "";
        if (aName === "ghzandar ali" || aId === "STF-001" || a.id === "stf_01") return -1;
        if (bName === "ghzandar ali" || bId === "STF-001" || b.id === "stf_01") return 1;
        return aId.localeCompare(bId);
      });

      const getDeterministicStaff = (grade: string, sectionLetter: string) => {
        if (validStaff.length === 0) return null;
        const normG = formatClassLabel(grade);
        const normS = sectionLetter.toUpperCase();

        if (normG === "Class 1" && normS === "A") return validStaff[0] || null;
        if (normG === "Class 1" && normS === "B") return validStaff[1] || validStaff[0] || null;
        if (normG === "Class 1" && normS === "C") return validStaff[2] || validStaff[0] || null;
        if (normG === "Class 2" && normS === "A") return validStaff[3] || validStaff[0] || null;
        if (normG === "Class 2" && normS === "B") return validStaff[4] || validStaff[0] || null;
        if (normG === "Class 2" && normS === "C") return validStaff[5] || validStaff[0] || null;
        if (normG === "Class 3" && normS === "A") return validStaff[6] || validStaff[0] || null;
        if (normG === "Class 3" && normS === "B") return validStaff[7] || validStaff[0] || null;
        if (normG === "Class 3" && normS === "C") return validStaff[8] || validStaff[0] || null;
        if (normG === "Class 10" && normS === "A") return validStaff[9] || validStaff[0] || null;

        const classNum = parseInt(normG.replace(/\D/g, ""), 10) || 1;
        const secIndex = normS === "A" ? 0 : normS === "B" ? 1 : 2;
        const staffIndex = ((classNum - 1) * 3 + secIndex) % validStaff.length;
        return validStaff[staffIndex] || validStaff[0];
      };

      const existingDocs = snapshot.docs;
      const batch = this.db.batch();
      let hasWrites = false;

      // Group existing docs by canonical key: "class 1__a"
      const canonicalMap = new Map<string, Section & { id: string; docRef: any }>();
      const duplicatesToDelete: any[] = [];

      for (const doc of existingDocs) {
        const data = doc.data() as Section;
        if (data.deleted) continue;

        const canonicalGrade = formatClassLabel(data.classGrade);
        const canonicalSec = cleanSectionName(data.sectionName || (data as any).section || "A");
        const key = `${canonicalGrade.toLowerCase()}__${canonicalSec.toUpperCase()}`;

        // If duplicate or non-canonical duplicate
        if (canonicalMap.has(key)) {
          const existingOne = canonicalMap.get(key)!;
          const currentHasTeacher = data.incharge && data.incharge !== "Unassigned" && data.incharge !== "Not Assigned" && !data.incharge.startsWith("Test Staff");
          const existingHasTeacher = existingOne.incharge && existingOne.incharge !== "Unassigned" && existingOne.incharge !== "Not Assigned" && !existingOne.incharge.startsWith("Test Staff");

          if (currentHasTeacher && !existingHasTeacher) {
            duplicatesToDelete.push(existingOne.docRef);
            canonicalMap.set(key, {
              id: doc.id,
              docRef: doc.ref,
              ...data,
              classGrade: canonicalGrade,
              sectionName: canonicalSec,
            });
          } else {
            duplicatesToDelete.push(doc.ref);
          }
          continue;
        }

        canonicalMap.set(key, {
          id: doc.id,
          docRef: doc.ref,
          ...data,
          classGrade: canonicalGrade,
          sectionName: canonicalSec,
        });
      }

      for (const ref of duplicatesToDelete) {
        batch.delete(ref);
        hasWrites = true;
      }

      const CANONICAL_SECTIONS = ["A", "B", "C"];
      const finalSections: (Section & { id: string })[] = [];

      // Reconcile all 10 canonical classes and 3 canonical sections (A, B, C)
      for (let c = 1; c <= 10; c++) {
        const classGrade = `Class ${c}`;
        for (const sec of CANONICAL_SECTIONS) {
          const key = `${classGrade.toLowerCase()}__${sec}`;
          const existingSection = canonicalMap.get(key);

          if (existingSection) {
            let needsUpdate = false;
            const updates: Record<string, any> = {};

            const rawData = existingDocs.find(d => d.id === existingSection.id)?.data();
            if (rawData?.classGrade !== classGrade || rawData?.sectionName !== sec) {
              updates.classGrade = classGrade;
              updates.sectionName = sec;
              needsUpdate = true;
            }

            // Resolve teacher: prefer existing valid real staff match, otherwise assign deterministic staff
            const currentIncharge = (existingSection.incharge || existingSection.classTeacherName || "").trim();
            let staffMatch = currentIncharge && currentIncharge !== "Unassigned" && currentIncharge !== "Not Assigned"
              ? realStaffMap.get(currentIncharge.toLowerCase())
              : null;

            if (!staffMatch) {
              const assigned = getDeterministicStaff(classGrade, sec);
              if (assigned) {
                const fullName = (assigned.name || assigned.fullName || `${assigned.firstName || ""} ${assigned.lastName || ""}`.trim()).trim();
                staffMatch = { id: assigned.id, name: fullName };
              }
            }

            if (staffMatch) {
              if (existingSection.incharge !== staffMatch.name || existingSection.classTeacherId !== staffMatch.id) {
                updates.incharge = staffMatch.name;
                updates.classTeacherName = staffMatch.name;
                updates.classTeacherId = staffMatch.id;
                existingSection.incharge = staffMatch.name;
                existingSection.classTeacherName = staffMatch.name;
                existingSection.classTeacherId = staffMatch.id;
                needsUpdate = true;
              }
            } else {
              // Fallback
              if (existingSection.incharge !== "Unassigned" || existingSection.classTeacherName !== "Unassigned" || existingSection.classTeacherId) {
                updates.incharge = "Unassigned";
                updates.classTeacherName = "Unassigned";
                updates.classTeacherId = null;
                existingSection.incharge = "Unassigned";
                existingSection.classTeacherName = "Unassigned";
                existingSection.classTeacherId = null;
                needsUpdate = true;
              }
            }

            if (!existingSection.capacity || existingSection.capacity <= 0) {
              updates.capacity = 30;
              existingSection.capacity = 30;
              needsUpdate = true;
            }

            if (needsUpdate) {
              batch.set(existingSection.docRef, updates, { merge: true });
              hasWrites = true;
            }

            finalSections.push({
              id: existingSection.id,
              classGrade,
              sectionName: sec,
              incharge: existingSection.incharge || "Unassigned",
              classTeacherName: existingSection.classTeacherName || "Unassigned",
              classTeacherId: existingSection.classTeacherId || null,
              capacity: existingSection.capacity || 30,
              tenantId,
              deleted: false,
              subjects: existingSection.subjects || { core: ["English", "Mathematics", "Science", "Urdu"], electives: [] },
            });
          } else {
            // Missing canonical section: create it
            const docId = sectionDocId(tenantId, classGrade, sec);
            const docRef = this.db.collection(this.collectionName).doc(docId);
            const assigned = getDeterministicStaff(classGrade, sec);
            const tName = assigned ? (assigned.name || assigned.fullName || `${assigned.firstName || ""} ${assigned.lastName || ""}`.trim()).trim() : "Unassigned";
            const tId = assigned ? assigned.id : null;
            const newSec: Section = {
              classGrade,
              sectionName: sec,
              tenantId,
              deleted: false,
              capacity: 30,
              incharge: tName,
              classTeacherName: tName,
              classTeacherId: tId,
              subjects: { core: ["English", "Mathematics", "Science", "Urdu"], electives: [] },
            };
            batch.set(docRef, {
              ...newSec,
              id: docId,
              createdAt: dbTimestamp,
              updatedAt: dbTimestamp,
            }, { merge: true });
            hasWrites = true;

            finalSections.push({
              id: docId,
              ...newSec,
            });
          }
        }
      }

      // Self-heal students & fees class references for this tenant
      try {
        const studentSnap = await this.db.collection("students").where("tenantId", "==", tenantId).get();
        for (const stDoc of studentSnap.docs) {
          const stData = stDoc.data();
          const normClass = formatClassLabel(stData.classGrade || stData.className);
          const normSec = cleanSectionName(stData.section || stData.sectionName || "A");
          if (stData.classGrade !== normClass || stData.section !== normSec) {
            batch.set(stDoc.ref, { classGrade: normClass, className: normClass, section: normSec, sectionName: normSec }, { merge: true });
            hasWrites = true;
          }
        }

        const feeSnap = await this.db.collection("fees").where("tenantId", "==", tenantId).get();
        for (const feeDoc of feeSnap.docs) {
          const feeData = feeDoc.data();
          const normClass = formatClassLabel(feeData.classGrade || feeData.className);
          const normSec = cleanSectionName(feeData.section || feeData.sectionName || "A");
          if (feeData.classGrade !== normClass || feeData.section !== normSec) {
            batch.set(feeDoc.ref, { classGrade: normClass, className: normClass, section: normSec }, { merge: true });
            hasWrites = true;
          }
        }
      } catch (err) {
        // Safe ignore
      }

      if (hasWrites) {
        await batch.commit().catch(() => {});
      }

      const naturalSort = (a: any, b: any) => {
        const numA = parseInt(String(a.classGrade || "").replace(/[^0-9]/g, ""), 10) || 0;
        const numB = parseInt(String(b.classGrade || "").replace(/[^0-9]/g, ""), 10) || 0;
        if (numA !== numB) return numA - numB;
        const secA = String(a.sectionName || a.section || "").toUpperCase();
        const secB = String(b.sectionName || b.section || "").toUpperCase();
        return secA.localeCompare(secB);
      };

      return finalSections.sort(naturalSort);
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
