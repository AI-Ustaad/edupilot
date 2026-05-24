import { getSessionUser } from "@/lib/auth/auth-server";
import { createApiResponse } from "@/lib/response/apiResponse";

export function withRole(allowedRoles: string[]) {
  return (handler: Function) => async (req: Request, context?: any) => {
    const user = await getSessionUser();
    if (!user || !allowedRoles.includes(user.role)) {
      return createApiResponse(403, null, "Insufficient permissions");
    }
    return handler(req, { ...context, user });
  };
}
