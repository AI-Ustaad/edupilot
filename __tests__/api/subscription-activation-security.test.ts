const activateSubscription = jest.fn();

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
    starter: { id: 'starter', name: 'Starter', price: 2000, priceId: 'price_starter' },
    professional: { id: 'professional', name: 'Professional', price: 3000, priceId: 'price_professional' },
    enterprise: { id: 'enterprise', name: 'Enterprise', price: 5000, priceId: 'price_enterprise' },
  },
}));
jest.mock('@/services/subscription.service', () => ({
  SubscriptionService: jest.fn().mockImplementation(() => ({ activateSubscription })),
}));
jest.mock('@/lib/api/response', () => ({
  createSuccessResponse: (data: unknown, extras?: any) => new Response(JSON.stringify({ success: true, data, ...extras }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
  createErrorResponse: (status: number, message: string) => new Response(JSON.stringify({ success: false, error: message }), { status, headers: { 'Content-Type': 'application/json' } }),
}));

import { POST as activatePost } from '@/app/api/v1/subscriptions/activate/route';
import { POST as subscriptionsPost } from '@/app/api/v1/subscriptions/route';

const mockContext = { tenantId: 'tenant-test', user: { uid: 'admin-1', role: 'admin' } };

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/v1/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('P0-02 — subscription activation security guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    activateSubscription.mockClear();
  });

  describe('/api/v1/subscriptions/activate', () => {
    it('allows free plan activation', async () => {
      const response = await activatePost(
        makeRequest({ planId: 'free' }),
        mockContext as any
      );
      expect(response.status).toBe(200);
      expect(activateSubscription).toHaveBeenCalledWith('tenant-test', 'free', 'admin-1');
    });

    it('blocks starter plan activation with 403', async () => {
      const response = await activatePost(
        makeRequest({ planId: 'starter' }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toBe('Paid plans must be activated through the billing checkout flow');
      expect(activateSubscription).not.toHaveBeenCalled();
    });

    it('blocks professional plan activation with 403', async () => {
      const response = await activatePost(
        makeRequest({ planId: 'professional' }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      expect(activateSubscription).not.toHaveBeenCalled();
    });

    it('blocks enterprise plan activation with 403', async () => {
      const response = await activatePost(
        makeRequest({ planId: 'enterprise' }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      expect(activateSubscription).not.toHaveBeenCalled();
    });

    it('blocks activation of unknown/invalid plan with 403', async () => {
      const response = await activatePost(
        makeRequest({ planId: 'nonexistent' }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      expect(activateSubscription).not.toHaveBeenCalled();
    });
  });

  describe('/api/v1/subscriptions (POST)', () => {
    it('allows free plan activation', async () => {
      const response = await subscriptionsPost(
        makeRequest({ planId: 'free' }),
        mockContext as any
      );
      expect(response.status).toBe(200);
      expect(activateSubscription).toHaveBeenCalledWith('tenant-test', 'free', 'admin-1');
    });

    it('blocks starter plan activation with 403', async () => {
      const response = await subscriptionsPost(
        makeRequest({ planId: 'starter' }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toBe('Paid plans must be activated through the billing checkout flow');
      expect(activateSubscription).not.toHaveBeenCalled();
    });

    it('blocks professional plan activation with 403', async () => {
      const response = await subscriptionsPost(
        makeRequest({ planId: 'professional' }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      expect(activateSubscription).not.toHaveBeenCalled();
    });

    it('blocks enterprise plan activation with 403', async () => {
      const response = await subscriptionsPost(
        makeRequest({ planId: 'enterprise' }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      expect(activateSubscription).not.toHaveBeenCalled();
    });

    it('blocks activation of unknown/invalid plan with 400 (plan validation happens before free check)', async () => {
      const response = await subscriptionsPost(
        makeRequest({ planId: 'nonexistent' }),
        mockContext as any
      );
      expect(response.status).toBe(400);
      expect(activateSubscription).not.toHaveBeenCalled();
    });
  });

  describe('exploit scenarios', () => {
    it('cannot bypass via planId case manipulation', async () => {
      const response = await activatePost(
        makeRequest({ planId: 'PROFESSIONAL' }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      expect(activateSubscription).not.toHaveBeenCalled();
    });

    it('cannot bypass via planId whitespace injection', async () => {
      const response = await activatePost(
        makeRequest({ planId: ' professional ' }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      expect(activateSubscription).not.toHaveBeenCalled();
    });

    it('cannot bypass via numeric planId that matches price=0 logic', async () => {
      const response = await activatePost(
        makeRequest({ planId: '0' }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      expect(activateSubscription).not.toHaveBeenCalled();
    });

    it('cannot bypass via planId injection in nested object', async () => {
      const response = await activatePost(
        makeRequest({ planId: { id: 'professional' } }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      expect(activateSubscription).not.toHaveBeenCalled();
    });

    it('cannot bypass via array planId', async () => {
      const response = await activatePost(
        makeRequest({ planId: ['professional'] }),
        mockContext as any
      );
      expect(response.status).toBe(403);
      expect(activateSubscription).not.toHaveBeenCalled();
    });
  });
});