export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import type { TenantContext } from "@/types/api";
import { JobRepository } from "@/repositories/job.repository";

const jobRepo = new JobRepository();

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, context: TenantContext & { params: { jobId: string } }) => {
      const { tenantId, params } = context;
      const jobId = params.jobId;

      if (!jobId) {
        return new NextResponse(JSON.stringify({ success: false, message: "Job ID required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      const job = await jobRepo.findById(tenantId, jobId);

      if (!job) {
        return new NextResponse(JSON.stringify({ success: false, message: "Job not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
      }

      return new NextResponse(JSON.stringify({ success: true, job }), { status: 200, headers: { "Content-Type": "application/json" } });
    })
  )
);
