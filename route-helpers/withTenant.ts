import { NextResponse } from 'next/server';

export const withTenant = (handler: Function) => {
  return async (req: Request, context: any = {}) => {
    const user = context?.user;
    
    // 🟢 ENTERPRISE FIX: Read securely from the validated Session Context
    if (!user || !user.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID is required or User is not assigned to a tenant' }, 
        { status: 403 }
      );
    }
    
    context.tenantId = user.tenantId;
    return handler(req, context);
  };
}
