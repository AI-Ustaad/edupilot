const activateSubscription = jest.fn();
const checkoutCreate = jest.fn();

jest.mock('@/route-helpers', () => ({
  withErrorHandler: (handler: any) => handler,
  withAuth: (handler: any) => handler,
  withTenant: (handler: any) => handler,
}));
jest.mock('@/lib/auth/rbac', () => ({
  withPermission: () => (handler: any) => handler,
}));
jest.mock('@/lib/stripe', () => ({
  PLANS: {
    free: { id: 'free', name: 'Free', price: 0 },
    pro: { id: 'pro', name: 'Pro', price: 20, priceId: 'price_pro', limits: {} },
  },
  stripe: { checkout: { sessions: { create: checkoutCreate } } },
}));
jest.mock('@/services/subscription.service', () => ({
  SubscriptionService: jest.fn().mockImplementation(() => ({ activateSubscription })),
}));
jest.mock('@/lib/api/response', () => ({
  createSuccessResponse: (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 }),
  createErrorResponse: (status: number, message: string) => new Response(JSON.stringify({ success: false, error: message }), { status }),
}));

import { POST } from '@/app/api/v1/stripe/create-checkout/route';

describe('POST /api/v1/stripe/create-checkout', () => {
  beforeEach(() => jest.clearAllMocks());

  test('activates a free subscription in-process rather than making an unauthenticated self-request', async () => {
    const response = await POST(
      new Request('https://example.test/api/v1/stripe/create-checkout', { method: 'POST', body: JSON.stringify({ planId: 'free' }) }),
      { tenantId: 'tenant-a', user: { uid: 'admin-1', role: 'admin' } }
    );

    expect(activateSubscription).toHaveBeenCalledWith('tenant-a', 'free', 'admin-1');
    expect(checkoutCreate).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ success: true, data: { url: '/settings/billing?success=true' } });
  });

  test('puts trusted tenant metadata on the Stripe subscription used by later webhook events', async () => {
    checkoutCreate.mockResolvedValue({ url: 'https://checkout.test/session' });
    await POST(
      new Request('https://example.test/api/v1/stripe/create-checkout', { method: 'POST', body: JSON.stringify({ planId: 'pro' }) }),
      { tenantId: 'tenant-a', user: { uid: 'admin-1', role: 'admin' } }
    );

    expect(checkoutCreate).toHaveBeenCalledWith(expect.objectContaining({
      metadata: { tenantId: 'tenant-a', planId: 'pro' },
      subscription_data: { metadata: { tenantId: 'tenant-a', planId: 'pro' } },
    }));
  });
});
