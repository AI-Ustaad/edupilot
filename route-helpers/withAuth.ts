import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";
import { logger } from "@/lib/logger/logger";

export function withAuth(handler: Function) {
  return async (
    req: Request,
    context: any = {}
  ) => {
    try {
      const user = await getSessionUser();

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          {
            status: 401,
          }
        );
      }

      context.user = user;
      return handler(req, context);
    } catch (error) {
      logger.error(
        "Authentication failed:",
        { metadata: { error } }
      );

      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
        },
        {
          status: 401,
        }
      );
    }
  };
}
