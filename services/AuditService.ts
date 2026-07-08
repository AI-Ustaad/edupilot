// services/AuditService.ts
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export interface AuditLogEntry {
  action: string;
  userId: string;
  tenantId: string;
  entityId?: string;
  entityType?: string;
  metadata?: any;
}

export class AuditService {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await adminDb.collection("logs").add({
        ...entry,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error("[AuditService] Failed to write audit log:", err);
    }
  }

  async queryByTenant(
    tenantId: string,
    options?: { limit?: number; action?: string; entityType?: string }
  ) {
    try {
      let query: FirebaseFirestore.Query = adminDb
        .collection("logs")
        .where("tenantId", "==", tenantId)
        .orderBy("createdAt", "desc");

      if (options?.action) query = query.where("action", "==", options.action);
      if (options?.entityType) query = query.where("entityType", "==", options.entityType);
      if (options?.limit) query = query.limit(options.limit);

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("[AuditService] Failed to query audit logs:", err);
      return [];
    }
  }
}
