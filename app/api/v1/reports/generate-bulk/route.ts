export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { JobService } from "@/services/job.service";
import { Queue } from "@/lib/queue/publisher";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const studentIds = body.studentIds || [];
        const term = body.term || "Final Exams";

        if (!studentIds || studentIds.length === 0) {
          return NextResponse.json({ success: false, message: "Please provide student IDs" }, { status: 400 });
        }

        const totalStudents = studentIds.length;
        const userId = user?.uid || "system";

        // 1. ڈیٹا بیس میں جاب رجسٹر کریں (Progress 0%)
        const jobService = new JobService();
        const jobId = await jobService.createJob(tenantId, "REPORT_GENERATION", userId, totalStudents);

        // 2. QStash کو بیک گراؤنڈ میں کام کرنے کا آرڈر دیں
        await Queue.publishJob("REPORT_GENERATION", {
          tenantId,
          jobId,
          studentIds,
          term
        });

        // 3. یوزر کو فوراً 0.2 سیکنڈ میں بتا دیں کہ کام شروع ہو گیا ہے!
        return NextResponse.json({
          success: true,
          jobId,
          status: "pending",
          message: `${totalStudents} reports generation started in background.`
        }, { status: 202 });
      })
    )
  )
);
