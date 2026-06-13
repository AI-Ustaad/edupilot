// app/api/v1/students/promote/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logAction } from "@/lib/audit";
import { standardRateLimit } from "@/lib/ratelimit";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';

export const POST = withErrorHandler(
  standardRateLimit(
    withAuth(
      withTenant(
        withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
          const { studentIds, newClassGrade, newSection, academicYear } = await req.json();

          if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return NextResponse.json(
              { success: false, error: "Student IDs array required" },
              { status: 400 }
            );
          }

          if (!newClassGrade) {
            return NextResponse.json(
              { success: false, error: "New class required" },
              { status: 400 }
            );
          }

          // Validate batch size
          if (studentIds.length > 100) {
            return NextResponse.json(
              { success: false, error: "Maximum 100 students per batch" },
              { status: 400 }
            );
          }

          const batch = adminDb.batch();
          const promoted: string[] = [];
          const errors: string[] = [];

          for (const studentId of studentIds) {
            const docRef = adminDb.collection("students").doc(studentId);
            const snap = await docRef.get();

            if (!snap.exists || snap.data()?.tenantId !== tenantId || snap.data()?.deleted) {
              errors.push(`Student ${studentId} not found`);
              continue;
            }

            const oldClass = snap.data()?.classGrade;
            const oldSection = snap.data()?.section;

            batch.update(docRef, {
              classGrade: newClassGrade,
              section: newSection || "A",
              academicYear: academicYear || FieldValue.serverTimestamp(),
              previousClass: oldClass,
              previousSection: oldSection,
              promotedAt: FieldValue.serverTimestamp(),
              promotedBy: user.uid,
              updatedAt: FieldValue.serverTimestamp(),
              updatedBy: user.uid,
            });

            promoted.push(studentId);
          }

          if (promoted.length > 0) {
            await batch.commit();

            // Audit log
            await logAction({
              action: "students.promote",
              userId: user.uid,
              tenantId,
              entityType: "student",
              metadata: {
                count: promoted.length,
                newClassGrade,
                newSection: newSection || "A",
                academicYear,
                studentIds: promoted,
              },
            });
          }

          return NextResponse.json({
            success: true,
            promoted: promoted.length,
            errors,
            message: `Successfully promoted ${promoted.length} students`,
          });
        })
      )
    )
  )
);
