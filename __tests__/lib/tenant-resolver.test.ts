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
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const mockLogger = require('@/lib/logger/logger');

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

    test('should derive tenantId from uid when tenantId is null', async () => {
      const context: TenantResolverContext = {
        user: {
          uid: 'tenant_already_started',
          email: 'admin@school.com',
          role: 'admin',
          tenantId: null,
        },
      };

      const result: ResolvedTenant = await resolver.resolve(context);

      expect(result.tenantId).toBe('tenant_already_started');
    });

    test('should derive tenantId from email hash when uid starts with tenant_', async () => {
      const context: TenantResolverContext = {
        user: {
          uid: 'tenant_already',
          email: 'test@example.com',
          role: 'admin',
          tenantId: null,
        },
      };

      const result: ResolvedTenant = await resolver.resolve(context);

      expect(result.tenantId).toBe('tenant_already');
    });

    test('should throw error when no user context is provided', async () => {
      const context: TenantResolverContext = {};

      await expect(resolver.resolve(context)).rejects.toThrow('No user context available for tenant resolution');
    });
  });

  describe('deriveTenantId', () => {
    test('should return uid unchanged when it starts with tenant_', async () => {
      const result = await resolver.resolve({
        user: { uid: 'tenant_existing', email: 'test@test.com', role: 'admin', tenantId: null }
      });
      expect(result.tenantId).toBe('tenant_existing');
    });

    test('should derive consistent hash from same email', async () => {
      const result1 = await resolver.resolve({
        user: { uid: 'uid1', email: 'same@example.com', role: 'admin', tenantId: null }
      });
      const result2 = await resolver.resolve({
        user: { uid: 'uid1', email: 'same@example.com', role: 'admin', tenantId: null }
      });
      expect(result1.tenantId).toBe(result2.tenantId);
    });
  });
});
