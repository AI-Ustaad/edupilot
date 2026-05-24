import { getSessionUser } from "@/lib/auth/auth-server";
import { createApiResponse } from "@/lib/response/apiResponse";

export function withAuth(handler: Function) {
  return async (req: Request, context?: any) => {
    const user = await getSessionUser();
    if (!user) {
      return createApiResponse(401, null, "Unauthorized");
    }
    return handler(req, { ...context, user });
  };
}
