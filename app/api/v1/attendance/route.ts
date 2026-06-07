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
// 1. GET: Fetch Attendance Securely
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const classGrade = searchParams.get("classGrade");
        const section = searchParams.get("section");
        const date = searchParams.get("date");

        let queryRef: any = adminDb.collection("attendance").where("tenantId", "==", tenantId);
        if (classGrade) queryRef = queryRef.where("classGrade", "==", classGrade);
        if (section) queryRef = queryRef.where("section", "==", section);
        if (date) queryRef = queryRef.where("date", "==", date);

        const snap = await queryRef.get();
        const attendance = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((a: any) => !a.deleted); // Soft Delete support

        return NextResponse.json({ success: true, data: attendance });
      })
    )
  )
);

// ==========================================
// 2. POST: Mark/Update Attendance
// ==========================================
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.attendance.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const data = await req.json();
        const { studentId, studentName, classGrade, section, date, status } = data;

        if (!studentId || !date || !status) {
          return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
        }

        // Idempotent ID: Prevents duplicate entries for same student/date
        const docId = `${studentId}_${date.replace(/-/g, '')}`;
        const docRef = adminDb.collection("attendance").doc(docId);
        
        const snap = await docRef.get();
        const isNew = !snap.exists;

        await docRef.set({
          studentId, studentName, classGrade, section, date, status,
          tenantId,
          deleted: false,
          createdAt: isNew ? FieldValue.serverTimestamp() : (snap.data()?.createdAt || FieldValue.serverTimestamp()),
          createdBy: isNew ? user.uid : (snap.data()?.createdBy || user.uid),
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: user.uid,
        }, { merge: true });

        // 🛡️ Audit Log
        await logAction({
          action: isNew ? "attendance.create" : "attendance.update",
          userId: user.uid,
          tenantId,
          entityId: docId,
          entityType: "attendance",
          metadata: { studentId, date, status },
        });

        return NextResponse.json({ success: true, message: "Attendance saved" });
      })
    )
  )
);
