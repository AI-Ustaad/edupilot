import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

// 1. GET: Fetch marks securely
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const classGrade = searchParams.get("classGrade");
        const section = searchParams.get("section");
        const term = searchParams.get("term");
        const subject = searchParams.get("subject");

        let queryRef: any = adminDb.collection("marks").where("tenantId", "==", tenantId);
        if (classGrade) queryRef = queryRef.where("classGrade", "==", classGrade);
        if (section) queryRef = queryRef.where("section", "==", section);
        if (term) queryRef = queryRef.where("term", "==", term);
        if (subject) queryRef = queryRef.where("subject", "==", subject);

        const snapshot = await queryRef.get();
        const marks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        return NextResponse.json({ success: true, data: marks });
      })
    )
  )
);

// 2. POST: Save or Update a mark
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const data = await req.json();
        const { studentId, studentName, classGrade, section, term, subject, marksObtained, totalMarks, percentage, grade } = data;

        if (!studentId || !term || !subject) {
          return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Create a deterministic document ID to prevent duplicates
        const markDocId = `${studentId}_${term.replace(/\s+/g, '')}_${subject.replace(/\s+/g, '')}`;
        
        await adminDb.collection("marks").doc(markDocId).set({
          studentId,
          studentName,
          classGrade,
          section,
          term,
          subject,
          marksObtained: Number(marksObtained) || 0,
          totalMarks: Number(totalMarks) || 0,
          percentage: Number(percentage) || 0,
          grade: grade || "-",
          tenantId,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        }, { merge: true });

        // TODO: Phase 1.2 - Add Audit Log here: await logAudit({ action: 'marks.update', ... })

        return NextResponse.json({ success: true, message: "Mark saved successfully" });
      })
    )
  )
);

// 3. DELETE: Remove a mark securely
export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const markId = searchParams.get("id");

        if (!markId) {
          return NextResponse.json({ success: false, message: "Mark ID is required" }, { status: 400 });
        }

        // Verify ownership before delete (Defense in Depth)
        const docRef = adminDb.collection("marks").doc(markId);
        const docSnap = await docRef.get();

        if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
          return NextResponse.json({ success: false, message: "Mark not found or access denied" }, { status: 404 });
        }

        await docRef.delete();

        return NextResponse.json({ success: true, message: "Mark deleted successfully" });
      })
    )
  )
);
