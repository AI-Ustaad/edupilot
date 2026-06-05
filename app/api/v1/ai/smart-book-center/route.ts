export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler, withRateLimit } from "@/route-helpers";
import { aiRateLimit } from "@/lib/ratelimit";
import { BookCenterService } from "@/services/ai/book-center.service";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withRateLimit(aiRateLimit)(
      withTenant(async (req: Request, { tenantId }: TenantContext) => {
        const { query, grade, type } = await req.json();
        if (!query || !type) {
          return createApiResponse(400, null, "Missing query or type");
        }

        const service = new BookCenterService();
        const result = await service.process({ query, grade, type });
        return createApiResponse(200, { result });
      })
    )
  )
);
