// repositories/behavior.repository.ts
import { BaseRepository } from "./base.repository";
import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import type { BehaviorLog } from "@/types/teacher";
import type { IBehaviorRepository } from "@/interfaces/IBehaviorRepository";

// 🟢 Enterprise Safe Serializer
function serializeDoc<T>(doc: any): T & { id: string } {
  const data = doc.data() || {};
  for (const key in data) {
    if (data[key] && typeof data[key].toDate === 'function') {
      data[key] = data[key].toDate().toISOString();
    } else if (data[key] && data[key]._seconds !== undefined) {
      data[key] = new Date(data[key]._seconds * 1000).toISOString();
    }
  }
  return { id: doc.id, ...data } as T & { id: string };
}

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
    return snapshot.docs.map(doc => serializeDoc<BehaviorLog>(doc));
  }
}
