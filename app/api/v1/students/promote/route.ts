export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { studentIds, newClassGrade, newSection, academicYear } = await req.json();

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
          return NextResponse.json({ success: false, error: "Student IDs array required" }, { status: 400 });
        }

        if (!newClassGrade) {
          return NextResponse.json({ success: false, error: "New class required" }, { status: 400 });
        }

        if (studentIds.length > 100) {
          return NextResponse.json({ success: false, error: "Maximum 100 students per batch" }, { status: 400 });
        }

        const service = new StudentService();
        const result = await service.promote(
          tenantId,
          studentIds,
          newClassGrade,
          newSection || "A",
          academicYear || "",
          user.uid
        );

        return NextResponse.json({
          success: true,
          promoted: result.promoted,
          errors: result.errors,
          message: `Successfully promoted ${result.promoted} students`,
        });
      })
    )
  )
);
