export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("id");

        if (!studentId) {
          return NextResponse.json(
            { success: false, error: "Student ID required" },
            { status: 400 }
          );
        }

        // 🔒 CRITICAL: Tenant isolation check
        const docRef = adminDb.collection("students").doc(studentId);
        const snap = await docRef.get();

        if (!snap.exists) {
          return NextResponse.json(
            { success: false, error: "Student not found" },
            { status: 404 }
          );
        }

        const data = snap.data();

        // 🔒 Verify this student belongs to current tenant
        if (data?.tenantId !== tenantId) {
          return NextResponse.json(
            { success: false, error: "Access denied" },
            { status: 403 }
          );
        }

        // 🔒 Filter out soft-deleted
        if (data?.deleted) {
          return NextResponse.json(
            { success: false, error: "Student not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            id: snap.id,
            ...data,
          },
        });
      })
    )
  )
);
