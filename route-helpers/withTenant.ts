import { getSessionUser } from "@/lib/auth/auth-server";
import { createApiResponse } from "@/lib/response/apiResponse";

export function withTenant(handler: Function) {
  return async (req: Request, context?: any) => {
    const user = await getSessionUser();
    if (!user?.tenantId) {
      return createApiResponse(403, null, "Forbidden: No school access");
    }
    // context میں اضافی معلومات پاس کریں
    return handler(req, { ...context, tenantId: user.tenantId, user });
  };
}
