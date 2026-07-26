import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { IAuditRepository } from "@/interfaces/IAuditRepository";
import { BaseRepository } from "./base.repository";

export interface AuditLog {
  id?: string;
  action: string;
  userId: string;
  tenantId: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
  createdAt?: any;
}

export class AuditRepository extends BaseRepository<AuditLog> implements IAuditRepository {
  constructor() {
    super("logs");
  }

  async create(entry: Omit<AuditLog, "id" | "createdAt">, tenantId: string): Promise<string> {
    const docRef = await this.db.collection(this.collectionName).add({
      ...entry,
      tenantId,
      createdAt: dbTimestamp,
    });
    return docRef.id;
  }

  async findByTenant(tenantId: string, options?: { limit?: number; action?: string; entityType?: string }): Promise<AuditLog[]> {
    let query = this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .orderBy("createdAt", "desc");

    if (options?.action) query = query.where("action", "==", options.action);
    if (options?.entityType) query = query.where("entityType", "==", options.entityType);
    if (options?.limit) query = query.limit(options.limit);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
  }

  async findByEntity(tenantId: string, entityType: string, entityId: string): Promise<AuditLog[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tenantId", "==", tenantId)
      .where("entityType", "==", entityType)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as AuditLog))
      .filter(log => log.entityId === entityId || log.metadata?.studentId === entityId);
  }

  async findRecent(tenantId: string, limit = 50): Promise<AuditLog[]> {
    return this.findByTenant(tenantId, { limit });
  }
}
