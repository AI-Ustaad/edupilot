// Force dynamic rendering - uses session cookies for auth
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logAction } from "@/lib/audit";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';

// ==========================================
// 1. GET: Fetch Fees Securely
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.fees.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const month = searchParams.get("month");
        const status = searchParams.get("status");

        let queryRef: any = adminDb.collection("fees").where("tenantId", "==", tenantId);
        
        if (studentId) queryRef = queryRef.where("studentId", "==", studentId);
        if (month) queryRef = queryRef.where("month", "==", month);
        if (status) queryRef = queryRef.where("status", "==", status);

        const snap = await queryRef.get();
        
        // 🛡️ Filter out soft-deleted records
        const fees: any[] = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((f: any) => !f.deleted);

        return NextResponse.json({ success: true, data: fees });
      })
    )
  )
);

// ==========================================
// 2. POST: Create/Update Fee Record
// ==========================================
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.fees.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const data = await req.json();
        const { studentId, studentName, classGrade, section, month, amount, status, paymentMethod, transactionId } = data;

        if (!studentId || !month || !amount) {
          return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // 🛡️ Idempotency: Prevent duplicate entries
        const feeDocId = `${studentId}_${month.replace(/\s+/g, '')}`;
        const docRef = adminDb.collection("fees").doc(feeDocId);
        
        const snap = await docRef.get();
        const isNew = !snap.exists;

        await docRef.set({
          studentId,
          studentName,
          classGrade,
          section,
          month,
          amount: Number(amount),
          status: status || "pending",
          paymentMethod: paymentMethod || "cash",
          transactionId: transactionId || null,
          tenantId,
          deleted: false,
          createdAt: isNew ? FieldValue.serverTimestamp() : (snap.data()?.createdAt || FieldValue.serverTimestamp()),
          createdBy: isNew ? user.uid : (snap.data()?.createdBy || user.uid),
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: user.uid,
        }, { merge: true });

        // 🛡️ Audit Log
        await logAction({
          action: isNew ? "fees.create" : "fees.update",
          userId: user.uid,
          tenantId,
          entityId: feeDocId,
          entityType: "fee",
          metadata: {
            studentId,
            studentName,
            month,
            amount: Number(amount),
            status: status || "pending",
          },
        });

        return NextResponse.json({ success: true, id: feeDocId, message: "Fee record saved" });
      })
    )
  )
);

// ==========================================
// 3. DELETE: Soft Delete Fee Record
// ==========================================
export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.fees.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const feeId = searchParams.get("id");

        if (!feeId) {
          return NextResponse.json({ success: false, message: "Fee ID required" }, { status: 400 });
        }

        const docRef = adminDb.collection("fees").doc(feeId);
        const snap = await docRef.get();

        // 🛡️ Verify ownership
        if (!snap.exists || snap.data()?.tenantId !== tenantId) {
          return NextResponse.json({ success: false, message: "Fee not found" }, { status: 404 });
        }

        // 🛑 SOFT DELETE
        await docRef.update({
          deleted: true,
          deletedAt: FieldValue.serverTimestamp(),
          deletedBy: user.uid,
        });

        // 🛡️ Audit Log
        await logAction({
          action: "fees.delete",
          userId: user.uid,
          tenantId,
          entityId: feeId,
          entityType: "fee",
          metadata: {
            studentId: snap.data()?.studentId,
            month: snap.data()?.month,
            amount: snap.data()?.amount,
          },
        });

        return NextResponse.json({ success: true, message: "Fee record archived" });
      })
    )
  )
);
