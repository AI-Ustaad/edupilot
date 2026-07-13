import { BaseRepository } from "./base.repository";
import { adminDb } from "@/lib/firebase-admin";

export interface AuditLog {
  action: string;
  userId: string;
  tenantId: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
  createdAt?: any;
}

export class AuditRepository extends BaseRepository<AuditLog> {
  constructor() {
    super("logs");
  }

  async findRecent(tenantId: string, limit = 500): Promise<(AuditLog & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog & { id: string }));
  }

  async findByEntity(tenantId: string, entityType: string, entityId: string): Promise<(AuditLog & { id: string })[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("entityType", "==", entityType)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as AuditLog & { id: string }))
      .filter(log => log.entityId === entityId || log.metadata?.studentId === entityId);
  }
}
