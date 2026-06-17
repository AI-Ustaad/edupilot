import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, context: TenantContext & { params: { jobId: string } }) => {
      const { tenantId, params } = context;
      const jobId = params.jobId;

      if (!jobId) {
        return NextResponse.json({ success: false, message: "Job ID required" }, { status: 400 });
      }

      // ڈیٹا بیس سے جاب کی لائیو صورتحال (Progress) نکالیں
      const jobSnap = await adminDb
        .collection("tenants")
        .doc(tenantId)
        .collection("jobs")
        .doc(jobId)
        .get();

      if (!jobSnap.exists) {
        return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, job: jobSnap.data() });
    })
  )
);
