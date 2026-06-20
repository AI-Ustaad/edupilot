export const dynamic = 'force-dynamic';
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { FeesService } from "@/services/fees.service";
import { FeesRepository } from "@/repositories/fees.repository";
import { successResponse } from "@/lib/utils/api-response";

const feesService = new FeesService(new FeesRepository());

export const GET = withAuthAndPermission(
  PERMISSIONS.fees.view,
  async (req: Request, context: any) => {
    const tenantId = context.user.tenantId;
    const fees = await feesService.listFees(tenantId);
    return successResponse(fees);
  }
);

export const POST = withAuthAndPermission(
  PERMISSIONS.fees.create,
  async (req: Request, context: any) => {
    const tenantId = context.user.tenantId;
    const body = await req.json();
    const fee = await feesService.createFee(body, tenantId);
    return successResponse(fee, "Fee collected", 201);
  }
);
