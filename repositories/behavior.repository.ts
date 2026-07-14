import { BaseRepository, serializeDoc } from "./base.repository";
import { dbTimestamp } from "@/lib/firebase-admin";
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
      
    // 🟢 Using the Global Enterprise Serializer
    return snapshot.docs.map(doc => serializeDoc<BehaviorLog>(doc));
  }
}
