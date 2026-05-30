import { NextResponse } from 'next/server';

export function withTenant(handler: Function) {
  return async (req: Request, context: any = {}) => {
    const user = context.user;
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 401 });
    }
    context.tenantId = user.tenantId;
    return handler(req, context);
  };
}
