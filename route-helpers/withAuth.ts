import { getSessionUser } from '@/lib/auth/auth-server'; // اپنے درست راستے سے بدلیں
import { NextResponse } from 'next/server';

export function withAuth(handler: Function) {
  return async (req: Request, context: any = {}) => {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // 🚨 ضروری: صارف کو context میں ڈالیں تاکہ withPermission اور دیگر helpers استعمال کر سکیں
    context.user = user;
    return handler(req, context);
  };
}
