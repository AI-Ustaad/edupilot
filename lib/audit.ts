// lib/audit.ts

import { adminDb } from "@/lib/firebase-admin";

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
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}
