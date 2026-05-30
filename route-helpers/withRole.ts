import { NextResponse } from 'next/server';

export function withRole(roles: string[]) {
  return (handler: Function) => {
    return async (req: Request, context: any) => {
      const user = context.user;
      if (!user || !roles.includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return handler(req, context);
    };
  };
}
