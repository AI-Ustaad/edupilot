import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";

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

      // ✅ Inject authenticated user
      context.user = user;

      return handler(req, context);
    } catch (error) {
      console.error(
        "Authentication failed:",
        error
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
