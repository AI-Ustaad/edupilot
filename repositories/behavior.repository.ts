import { BaseRepository, serializeDoc } from "./base.repository";
import { dbTimestamp } from "@/lib/firebase-admin";
import type { BehaviorLog } from "@/types/teacher";
import type { IBehaviorRepository } from "@/interfaces/IBehaviorRepository";

export class BehaviorRepository extends BaseRepository<BehaviorLog> implements IBehaviorRepository {
  constructor() {
    super("behavior_logs");
  }

  async create(data: Omit<BehaviorLog, "id" | "createdAt">, tenantId: string): Promise<string> {
    const docRef = await this.db.collection(this.collectionName).add({
      ...data,
      tenantId: tenantId || (data as any).tenantId,
      createdAt: dbTimestamp,
      updatedAt: dbTimestamp,
    });
    return docRef.id;
  }

  async findByStudent(studentId: string, tenantId: string, limit = 20): Promise<(BehaviorLog & { id: string })[]> {
    let query: FirebaseFirestore.Query = this.db
      .collection(this.collectionName)
      .where("studentId", "==", studentId)
      .where("tenantId", "==", tenantId);

    if (typeof limit === "number" && limit > 0) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
      
    // 🟢 Using the Global Enterprise Serializer
    const docs = snapshot.docs.map(doc => serializeDoc<BehaviorLog>(doc));
    docs.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    return docs;
  }

  // B14 (N15) — idempotency lookup: returns the log created with this client
  // key for the tenant, or null. Used to drop retried/duplicate submits.
  async findByIdempotencyKey(idempotencyKey: string, tenantId: string): Promise<(BehaviorLog & { id: string }) | null> {
    if (!idempotencyKey) return null;
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("idempotencyKey", "==", idempotencyKey)
      .where("tenantId", "==", tenantId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return serializeDoc<BehaviorLog>(snapshot.docs[0]);
  }
}
