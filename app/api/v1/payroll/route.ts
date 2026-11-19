export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { PayrollService } from "@/services/PayrollService";
import type { TenantContext } from "@/types/api";

const payrollService = new PayrollService();

// ==========================================
// 1. GET: Fetch Monthly Payroll Summary & Staff Records
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month") || "November 2026";

        const summary = await payrollService.getMonthlyPayroll(tenantId, month);
        return NextResponse.json({
          success: true,
          data: summary,
        });
      })
    )
  )
);

// ==========================================
// 2. POST: Mark Paid or Bulk Mark Paid
// ==========================================
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const { staffId, month = "November 2026", status = "Paid", paymentMethod = "Bank Transfer", markAll } = body;

        if (markAll) {
          const count = await payrollService.markAllPaid(tenantId, month, paymentMethod, user.uid);
          return NextResponse.json({
            success: true,
            message: `Successfully marked ${count} staff payroll records as Paid`,
            count,
          });
        }

        if (!staffId) {
          return NextResponse.json({ success: false, error: "Staff ID is required" }, { status: 400 });
        }

        const updated = await payrollService.markPaid(
          tenantId,
          staffId,
          month,
          status as "Paid" | "Pending",
          paymentMethod,
          user.uid
        );

        return NextResponse.json({
          success: true,
          message: `Payroll marked as ${status}`,
          data: updated,
        });
      })
    )
  )
);
