// repositories/class.repository.ts
import { BaseRepository } from "./base.repository";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";

export interface ClassRecord {
  classGrade: string;
  sectionName: string;
  incharge?: string;
  tenantId: string;
  deleted?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export class ClassRepository extends BaseRepository<ClassRecord> {
  constructor() {
    super("sections");
  }

  async getAll(tenantId: string): Promise<(ClassRecord & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .get();
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as ClassRecord & { id: string }))
      .filter(r => !r.deleted);
  }

  async createClass(data: { classGrade: string; sectionName: string }, tenantId: string): Promise<string> {
    const id = await this.create(
      { ...data, tenantId, createdAt: dbTimestamp } as any,
      tenantId
    );
    return id;
  }

  async deleteClass(id: string, tenantId: string): Promise<void> {
    await this.update(id, { deleted: true, deletedAt: dbTimestamp } as any, tenantId);
  }
}

export const classRepository = new ClassRepository();
