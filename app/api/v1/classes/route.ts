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
// 1. GET: Fetch Sections Securely
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const snap = await adminDb.collection("sections")
          .where("tenantId", "==", tenantId)
          .get();
        
        // ✅ FIX: Explicitly type as any[] because Firestore data has no strict schema
        const sections: any[] = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(s => !s.deleted);

        return NextResponse.json({ success: true, data: sections });
      })
    )
  )
);

// ==========================================
// 2. POST: Create New Section
// ==========================================
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const data = await req.json();
        const { classGrade, sectionName, subjects } = data;

        if (!classGrade || !sectionName) {
          return NextResponse.json({ success: false, message: "Class and Section name required" }, { status: 400 });
        }

        const docRef = adminDb.collection("sections").doc();
        await docRef.set({
          classGrade,
          sectionName,
          subjects: subjects || { core: [], electives: [] },
          tenantId,
          deleted: false,
          createdAt: FieldValue.serverTimestamp(),
          createdBy: user.uid,
        });

        // 🛡️ Audit Log
        await logAction({
          action: "class.create",
          userId: user.uid,
          tenantId,
          entityId: docRef.id,
          entityType: "section",
          metadata: { classGrade, sectionName },
        });

        return NextResponse.json({ success: true, id: docRef.id });
      })
    )
  )
);

// ==========================================
// 3. DELETE: Soft Delete Section
// ==========================================
export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const sectionId = searchParams.get("id");

        if (!sectionId) {
          return NextResponse.json({ success: false, message: "Section ID required" }, { status: 400 });
        }

        const docRef = adminDb.collection("sections").doc(sectionId);
        const snap = await docRef.get();

        // 🛡️ Verify ownership
        if (!snap.exists || snap.data()?.tenantId !== tenantId) {
          return NextResponse.json({ success: false, message: "Section not found" }, { status: 404 });
        }

        // 🛑 SOFT DELETE
        await docRef.update({
          deleted: true,
          deletedAt: FieldValue.serverTimestamp(),
          deletedBy: user.uid,
        });

        // 🛡️ Audit Log
        await logAction({
          action: "class.delete",
          userId: user.uid,
          tenantId,
          entityId: sectionId,
          entityType: "section",
        });

        return NextResponse.json({ success: true, message: "Section archived" });
      })
    )
  )
);
