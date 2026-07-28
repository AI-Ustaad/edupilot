export const dynamic = 'force-dynamic';
// app/api/ledger/route.ts
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { logger } from "@/lib/logger/logger";
import { LedgerService } from "@/services/ledger.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      try {
        const service = new LedgerService();
        const data = await service.findByTenant(tenantId);
        return createSuccessResponse(data);
      } catch (err: any) {
        logger.error("Error fetching ledger:", { metadata: { error: err.message } });
        return createErrorResponse(500, "Failed to fetch ledger");
      }
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      try {
        const body = await req.json();
        if (!body.type || !body.description || !body.amount) {
          return createErrorResponse(400, "Missing required fields");
        }

        const service = new LedgerService();
        const id = await service.createEntry({
          type: body.type,
          description: body.description,
          amount: Number(body.amount),
          tenantId,
          createdBy: user.uid,
        }, tenantId);

        return createApiResponse(201, { id }, "Ledger entry added");
      } catch (err: any) {
        logger.error("Error adding ledger entry:", { metadata: { error: err.message } });
        return createErrorResponse(500, "Failed to add ledger entry");
      }
    })
  )
);
