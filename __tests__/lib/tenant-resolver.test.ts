import { TenantResolver } from "@/services/tenant.resolver";
import type { TenantResolverContext, ResolvedTenant } from "@/types/tenant/tenant-resolver";
import { adminDb } from "@/lib/firebase-admin";

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn(),
      }),
    }),
  },
}));

jest.mock('@/lib/logger/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('TenantResolver', () => {
  let resolver: TenantResolver;

  beforeEach(() => {
    jest.clearAllMocks();
    resolver = new TenantResolver();
  });

  describe('resolve', () => {
    test('should resolve from user.tenantId when available', async () => {
      const context: TenantResolverContext = {
        user: {
          uid: 'user1',
          email: 'admin@school.com',
          role: 'admin',
          tenantId: 'tenant_123',
        },
      };

      const result: ResolvedTenant = await resolver.resolve(context);

      expect(result.tenantId).toBe('tenant_123');
      expect(result.source).toBe('user_document');
      expect(result.confidence).toBe('high');
    });

    test('should reject with TenantResolutionError when tenantId is null (tenantless user)', async () => {
      const context: TenantResolverContext = {
        user: {
          uid: 'tenant_already_started',
          email: 'admin@school.com',
          role: 'admin',
          tenantId: null,
        },
      };

      await expect(resolver.resolve(context)).rejects.toThrow('User is not assigned to a tenant');
    });

    test('should reject with TenantResolutionError when tenantId is empty string', async () => {
      const context: TenantResolverContext = {
        user: {
          uid: 'tenant_already',
          email: 'test@example.com',
          role: 'admin',
          tenantId: '   ',
        },
      };

      await expect(resolver.resolve(context)).rejects.toThrow('User is not assigned to a tenant');
    });

    test('should throw error when no user context is provided', async () => {
      const context: TenantResolverContext = {};

      await expect(resolver.resolve(context)).rejects.toThrow('No user context available for tenant resolution');
    });
  });

  describe('Security invariants', () => {
    test('never fabricates synthetic tenant IDs for tenantless users', async () => {
      await expect(
        resolver.resolve({
          user: { uid: 'tenant_existing', email: 'test@test.com', role: 'admin', tenantId: null }
        })
      ).rejects.toThrow('User is not assigned to a tenant');
    });

    test('rejects tenantless users in resolveFromContext', async () => {
      const mockReqContext = {
        requestId: 'req_123',
        traceId: null,
        spanId: null,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        referer: 'none',
        origin: 'http://localhost',
        requestTime: new Date().toISOString(),
      };

      await expect(
        resolver.resolveFromContext(
          mockReqContext,
          { uid: 'uid1', email: 'same@example.com', role: 'admin', tenantId: null }
        )
      ).rejects.toThrow('User is not assigned to a tenant');
    });
  });
});
