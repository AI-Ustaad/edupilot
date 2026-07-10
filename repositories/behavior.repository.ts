// repositories/behavior.repository.ts
import { BaseRepository } from "./base.repository";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import type { BehaviorLog } from "@/types/teacher";
import type { IBehaviorRepository } from "@/interfaces/IBehaviorRepository";

export class BehaviorRepository extends BaseRepository<BehaviorLog> implements IBehaviorRepository {
  constructor() {
    super("behavior_logs");
  }

  async create(data: Omit<BehaviorLog, "id" | "createdAt">, _tenantId: string): Promise<string> {
    const docRef = await this.db.collection(this.collectionName).add({
      ...data,
      createdAt: dbTimestamp,
    });
    return docRef.id;
  }

  async findByStudent(studentId: string, tenantId: string, limit = 20): Promise<(BehaviorLog & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("studentId", "==", studentId)
      .where("tenantId", "==", tenantId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BehaviorLog & { id: string }));
  }
}
