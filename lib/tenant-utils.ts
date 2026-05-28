// lib/tenant-utils.ts
import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth/auth-server';

export async function getTenantIdFromRequest(req: NextRequest): Promise<string | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return user.tenantId || null;
}
