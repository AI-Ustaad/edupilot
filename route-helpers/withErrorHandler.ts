import { NextResponse } from 'next/server';
import { logger } from "@/lib/logger/logger";
import { AppError } from "@/errors/AppError";

export function withErrorHandler(handler: Function) {
  return async (req: Request, context: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      // Structured logging with full context
      const requestId = req.headers.get("x-request-id") || "unknown";
      const tenantId = context?.tenantId || context?.user?.tenantId || "unknown";
      const userId = context?.user?.uid || "unknown";

      logger.error("[API Error]", {
        metadata: {
          requestId,
          tenantId,
          userId,
          error: error.message,
          stack: error.stack,
          path: req.url,
          method: req.method,
        },
      });

      // If it's a known AppError, use its status code
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
            data: null,
            errors: error.details ? [error.details] : null,
            code: error.code,
            traceId: `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
          },
          { status: error.statusCode }
        );
      }

      // Unknown errors → 500
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Internal Server Error",
          data: null,
          errors: null,
          traceId: `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
}
