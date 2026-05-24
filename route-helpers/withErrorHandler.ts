import { AppError } from "@/lib/errors/AppError";
import { createApiResponse } from "@/lib/response/apiResponse";

export function withErrorHandler(handler: Function) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error("[API Error]", {
        url: req.url,
        method: req.method,
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof AppError) {
        return createApiResponse(error.statusCode, null, error.message, error.details);
      }
      return createApiResponse(500, null, "Internal server error");
    }
  };
}
