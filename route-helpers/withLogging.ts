import { logger } from "@/lib/logger/logger";

export function withLogging(handler: Function) {
  return async (req: Request, context: any) => {
    logger.api(`API Call: ${req.method} ${req.url}`);
    return handler(req, context);
  };
}
