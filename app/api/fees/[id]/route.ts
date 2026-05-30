// app/api/fees/[id]/route.ts
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { FeesService } from "@/services/fees.service";
import { FeesRepository } from "@/repositories/fees.repository";
import { logAction } from "@/lib/audit";

interface WithTenantContext {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: WithTenantContext) => {
      const id = getIdFromUrl(req);
      const service = new FeesService(new FeesRepository());
      const fee = await service.getFeeById(id, tenantId);
      if (!fee) {
        return createApiResponse(404, null, "Fee record not found");
      }
      return createApiResponse(200, fee);
    })
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
      if (user.role !== "admin" && user.role !== "accountant") {
        return createApiResponse(403, null, "Forbidden");
      }
      const id = getIdFromUrl(req);
      const body = await req.json();
      const service = new FeesService(new FeesRepository());
      await service.updateFee(id, body, tenantId);
      return createApiResponse(200, null, "Fee record updated successfully");
    })
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
      if (user.role !== "admin" && user.role !== "accountant") {
        return createApiResponse(403, null, "Forbidden");
      }
      const id = getIdFromUrl(req);
      const service = new FeesService(new FeesRepository());
      const fee = await service.getFeeById(id, tenantId);
      if (!fee) {
        return createApiResponse(404, null, "Fee record not found");
      }
      await service.deleteFee(id, tenantId);

      await logAction({
        action: "FEE_DELETED",
        userId: user.uid,
        tenantId,
        entityId: id,
        entityType: "fee",
        metadata: { studentName: (fee as any).studentName, amount: (fee as any).amountPaid },
      });

      return createApiResponse(200, null, "Fee record deleted successfully");
    })
  )
);
