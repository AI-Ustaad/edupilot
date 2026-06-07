// lib/audit.ts
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore"; // ✅ Correct import for newer firebase-admin versions

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
      createdAt: FieldValue.serverTimestamp(), // ✅ Correct usage
    });
  } catch (err) {
    // Fail silently so it doesn't break the main user action
    console.error("Audit log failed:", err);
  }
}
