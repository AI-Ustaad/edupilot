// lib/audit.ts
import { adminDb } from "@/lib/firebase-admin";
import { serverTimestamp } from "firebase-admin/firestore"; // ✅ Import serverTimestamp

export async function logAction({
  action,
  userId,
  tenantId,
  entityId,
  entityType,
  metadata = {},
}: {
  action: string;
  userId: string;
  tenantId: string;
  entityId?: string;
  entityType?: string;
  metadata?: any;
}) {
  try {
    await adminDb.collection("logs").add({
      action,
      userId,
      tenantId,
      entityId: entityId || null,
      entityType: entityType || null,
      metadata,
      createdAt: serverTimestamp(), // ✅ Changed from new Date()
    });
  } catch (err) {
    // Fail silently so it doesn't break the main user action (e.g., saving a mark)
    console.error("Audit log failed:", err);
  }
}
