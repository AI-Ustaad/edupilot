import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logAction } from "@/lib/audit";
import type { TenantContext } from "@/types/api";

// ==========================================
// 1. GET: Fetch Marks Securely
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const classGrade = searchParams.get("classGrade");
        const section = searchParams.get("section");
        const term = searchParams.get("term");
        const subject = searchParams.get("subject");
        const studentId = searchParams.get("studentId");

        let queryRef: any = adminDb.collection("marks").where("tenantId", "==", tenantId);
        
        if (classGrade) queryRef = queryRef.where("classGrade", "==", classGrade);
        if (section) queryRef = queryRef.where("section", "==", section);
        if (term) queryRef = queryRef.where("term", "==", term);
        if (subject) queryRef = queryRef.where("subject", "==", subject);
        if (studentId) queryRef = queryRef.where("studentId", "==", studentId);

        const snapshot = await queryRef.get();
        
        // 🛡️ Filter out soft-deleted records (since Firestore doesn't easily support != true without indexes)
        const marks = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(mark => !mark.deleted); 
        
        return NextResponse.json({ success: true, data: marks });
      })
    )
  )
);

// ==========================================
// 2. POST: Save or Update a Mark (Idempotent)
// ==========================================
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const data = await req.json();
        const { studentId, studentName, classGrade, section, term, subject, marksObtained, totalMarks, percentage, grade } = data;

        if (!studentId || !term || !subject) {
          return NextResponse.json({ success: false, message: "Missing required fields (studentId, term, subject)" }, { status: 400 });
        }

        // 🛡️ Idempotency: Create a deterministic document ID to prevent duplicate entries
        const markDocId = `${studentId}_${term.replace(/\s+/g, '')}_${subject.replace(/\s+/g, '')}`;
        const docRef = adminDb.collection("marks").doc(markDocId);
        
        // Check if document already exists to preserve createdAt/createdBy
        const docSnap = await docRef.get();
        const isNew = !docSnap.exists;

        await docRef.set({
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
          deleted: false, // Ensure it's marked as active
          createdAt: isNew ? FieldValue.serverTimestamp() : (docSnap.data()?.createdAt || FieldValue.serverTimestamp()),
          createdBy: isNew ? user.uid : (docSnap.data()?.createdBy || user.uid),
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: user.uid,
        }, { merge: true });

        // 🛡️ AUDIT LOG: Track who created/updated the marks
        await logAction({
          action: isNew ? "marks.create" : "marks.update",
          userId: user.uid,
          tenantId,
          entityId: markDocId,
          entityType: "mark",
          metadata: {
            studentId,
            studentName,
            subject,
            term,
            marksObtained: Number(marksObtained),
            totalMarks: Number(totalMarks),
          },
        });

        return NextResponse.json({ success: true, message: "Mark saved successfully" });
      })
    )
  )
);

// ==========================================
// 3. DELETE: Soft Delete a Mark (Never Hard Delete)
// ==========================================
export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const markId = searchParams.get("id");

        if (!markId) {
          return NextResponse.json({ success: false, message: "Mark ID is required" }, { status: 400 });
        }

        const docRef = adminDb.collection("marks").doc(markId);
        const docSnap = await docRef.get();

        // 🛡️ Verify ownership before modifying (Defense in Depth)
        if (!docSnap.exists || docSnap.data()?.tenantId !== tenantId) {
          return NextResponse.json({ success: false, message: "Mark not found or access denied" }, { status: 404 });
        }

        // 🛑 SOFT DELETE: School ERP data is NEVER hard deleted.
        await docRef.update({
          deleted: true,
          deletedAt: FieldValue.serverTimestamp(),
          deletedBy: user.uid,
        });

        // 🛡️ AUDIT LOG: Track who deleted (archived) the marks
        await logAction({
          action: "marks.delete", // Logically deleted
          userId: user.uid,
          tenantId,
          entityId: markId,
          entityType: "mark",
          metadata: {
            studentId: docSnap.data()?.studentId,
            subject: docSnap.data()?.subject,
            term: docSnap.data()?.term,
            reason: "Soft deleted via UI",
          },
        });

        return NextResponse.json({ success: true, message: "Mark archived successfully" });
      })
    )
  )
);
