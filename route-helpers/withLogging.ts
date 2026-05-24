// route-helpers/withLogging.ts
import { logger } from "@/lib/logger/logger";

export function withLogging(handler: Function) {
  return async (req: Request, context?: any) => {
    const start = Date.now();
    try {
      const response = await handler(req, context);
      const duration = Date.now() - start;
      logger.logRequest(req, duration, response?.status);
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error("Request failed", {
        method: req.method,
        path: new URL(req.url).pathname,
        duration,
        metadata: { error: error instanceof Error ? error.message : error },
      });
      throw error;
    }
  };
}
