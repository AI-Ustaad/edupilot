import { NextResponse } from 'next/server';
import { logger } from "@/lib/logger/logger";

export function withErrorHandler(handler: Function) {
  return async (req: Request, context: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      logger.error('API Error:', { metadata: { error: error.message, stack: error.stack } });
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
