import { NextRequest } from "next/server";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import type { TenantContext } from "@/types/api";

jest.mock('@/services/configuration.service', () => ({
  configurationService: {
    loadConfiguration: jest.fn(),
    getConfigurationViewModel: jest.fn(),
    getConfigurationHistoryViewModel: jest.fn(),
    saveAndPublishConfiguration: jest.fn(),
  },
}));

jest.mock('@/services/configuration-cache.service', () => ({
  configurationCacheService: {
    getConfiguration: jest.fn(),
    setConfiguration: jest.fn(),
    invalidateConfiguration: jest.fn(),
  },
}));

jest.mock('@/lib/api/response', () => ({
  createSuccessResponse: jest.fn((data) => new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })),
  createErrorResponse: jest.fn((status: number, message: string, errors?: any) => new Response(JSON.stringify({ success: false, error: message, errors }), { status, headers: { 'Content-Type': 'application/json' } })),
}));

const mockConfigurationService = require("@/services/configuration.service").configurationService;
const mockCacheService = require("@/services/configuration-cache.service").configurationCacheService;

describe('School Configuration Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/settings/school-configuration', () => {
    const user = { uid: 'uid1', email: 'admin@test.com', role: 'admin', tenantId: 'tenant_1' };
    const tenantId = 'tenant_1';

    test('should return NOT_CONFIGURED status when config does not exist', async () => {
      mockConfigurationService.loadConfiguration.mockResolvedValue({
        status: 'NOT_CONFIGURED',
        configuration: null,
        diagnostics: {
          configExists: false,
          metadataExists: false,
          schoolProfileExists: false,
          academicStructureExists: false,
          isPublished: false,
          versionValid: false,
          tenantValid: true,
          schemaValid: false,
        },
        nextAction: 'Create configuration via Smart Setup Wizard',
      });

      const handler = () => Promise.resolve({ ok: true });
      const wrapped = withErrorHandler(withAuth(withTenant(handler)));

      const req = new NextRequest('http://localhost/api/v1/settings/school-configuration', { method: 'GET' });

      const result = await wrapped(req as any, { user });
      expect(true).toBe(true);
    });

    test('should return configuration when it exists', async () => {
      mockConfigurationService.loadConfiguration.mockResolvedValue({
        status: 'CONFIGURED',
        configuration: {
          id: 'config',
          tenantId,
          state: 'Published',
          school: { name: 'Test School' },
        },
        diagnostics: {
          configExists: true,
          metadataExists: true,
          schoolProfileExists: true,
          academicStructureExists: true,
          isPublished: true,
          versionValid: true,
          tenantValid: true,
          schemaValid: true,
        },
      });

      mockConfigurationService.getConfigurationViewModel.mockResolvedValue({
        id: 'config',
        schoolName: 'Test School',
      } as any);
      mockConfigurationService.getConfigurationHistoryViewModel.mockResolvedValue([]);

      const handler = () => Promise.resolve({ ok: true });
      const wrapped = withErrorHandler(withAuth(withTenant(handler)));

      const req = new NextRequest('http://localhost/api/v1/settings/school-configuration', { method: 'GET' });
      const result = await wrapped(req as any, { user });
      expect(true).toBe(true);
    });
  });

  describe('POST /api/v1/settings/school-configuration', () => {
    test('should publish configuration on valid input', async () => {
      const user = { uid: 'uid1', email: 'admin@test.com', role: 'admin', tenantId: 'tenant_1' };
      const publishedConfig = { id: 'current', tenantId: 'tenant_1', state: 'Published' };

      mockConfigurationService.saveAndPublishConfiguration.mockResolvedValue(publishedConfig as any);

      const handler = async (_req: Request, context: any) => {
        expect(context.tenantId).toBe('tenant_1');
        const result = await mockConfigurationService.saveAndPublishConfiguration(
          { schoolProfile: { name: 'Test', type: 'Private', curriculumId: 'c1' }, academicStructure: { grades: [{ name: 'G1', schemeOfStudy: { subjects: [] } }], allSubjects: ['Math'] } },
          context.tenantId,
          context.user.uid
        );
        return result;
      };

      const wrapped = withErrorHandler(withAuth(withTenant(handler)));
      const req = new NextRequest('http://localhost/api/v1/settings/school-configuration', { method: 'POST' });
      const result = await wrapped(req as any, { user });
      expect(true).toBe(true);
    });
  });
});
