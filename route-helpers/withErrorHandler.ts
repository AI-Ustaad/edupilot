import { NextResponse } from 'next/server';

export function withErrorHandler(handler: Function) {
  return async (req: Request, context: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      console.error('API Error:', error);
      return NextResponse.json(
        { error: error.message || 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
