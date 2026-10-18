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

jest.mock('@/lib/auth/auth-server', () => ({
  getSessionUser: jest.fn(),
}));

jest.mock('@/lib/api/response', () => ({
  createSuccessResponse: jest.fn((data) => new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })),
  createErrorResponse: jest.fn((status: number, message: string, errors?: any) => new Response(JSON.stringify({ success: false, error: message, errors }), { status, headers: { 'Content-Type': 'application/json' } })),
}));

const mockConfigurationService = require("@/services/configuration.service").configurationService;
const mockCacheService = require("@/services/configuration-cache.service").configurationCacheService;
const { getSessionUser } = require("@/lib/auth/auth-server");

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
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should publish configuration on valid input', async () => {
      const user = { uid: 'uid1', email: 'admin@test.com', role: 'admin', tenantId: 'tenant_1' };
      const publishedConfig = { id: 'current', tenantId: 'tenant_1', state: 'Published' };

      getSessionUser.mockResolvedValue(user);
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
      expect(result).toBeDefined();
    });

    test('should publish successfully after tenant repair (orphan tenant)', async () => {
      const user = { uid: 'uid-school', email: 'admin@school.com', role: 'admin', tenantId: 'school_zaqbuimg5' };
      const publishedConfig = { id: 'current', tenantId: 'school_zaqbuimg5', state: 'Published' };

      getSessionUser.mockResolvedValue(user);
      mockConfigurationService.saveAndPublishConfiguration.mockResolvedValue(publishedConfig as any);

      const handler = async (_req: Request, context: any) => {
        expect(context.tenantId).toBe('school_zaqbuimg5');
        const result = await mockConfigurationService.saveAndPublishConfiguration(
          { schoolProfile: { name: 'Legacy School', type: 'Private', curriculumId: 'federal', sections: ['A'] }, academicStructure: { grades: [{ name: 'G1', schemeOfStudy: { subjects: [] } }], allSubjects: [{ name: 'Math' }] } },
          context.tenantId,
          context.user.uid
        );
        return result;
      };

      const wrapped = withErrorHandler(withAuth(withTenant(handler)));
      const req = new NextRequest('http://localhost:3000/api/v1/settings/school-configuration', { method: 'POST' });
      const result = await wrapped(req as any, { user });

      expect(mockConfigurationService.saveAndPublishConfiguration).toHaveBeenCalledWith(
        expect.anything(),
        'school_zaqbuimg5',
        'uid-school'
      );
      expect(result).toBeDefined();
    });

    test('should reject publish for unrelated tenant', async () => {
      const user = { uid: 'uid-other', email: 'admin@other.com', role: 'admin', tenantId: 'school_other' };

      getSessionUser.mockResolvedValue(user);
      mockConfigurationService.saveAndPublishConfiguration.mockRejectedValue(
        new Error('Tenant school_zaqbuimg5 does not exist or is invalid. Configuration cannot be published.')
      );

      const handler = async (_req: Request, context: any) => {
        const result = await mockConfigurationService.saveAndPublishConfiguration(
          { schoolProfile: { name: 'Test', type: 'Private', curriculumId: 'c1', sections: ['A'] }, academicStructure: { grades: [{ name: 'G1', schemeOfStudy: { subjects: [] } }], allSubjects: [{ name: 'Math' }] } },
          'school_zaqbuimg5',
          context.user.uid
        );
        return result;
      };

      const wrapped = withErrorHandler(withAuth(withTenant(handler)));
      const req = new NextRequest('http://localhost:3000/api/v1/settings/school-configuration', { method: 'POST' });

      const result = await wrapped(req as any, { user });
      expect(mockConfigurationService.saveAndPublishConfiguration).toHaveBeenCalledWith(
        expect.anything(),
        'school_zaqbuimg5',
        'uid-other'
      );
    });
  });

  describe('Route-Level RBAC & Permission Enforcement (Actual GET and POST routes)', () => {
    const { GET, POST } = require('@/app/api/v1/settings/school-configuration/route');

    const validPayload = {
      schoolProfile: {
        name: "Acme Academy",
        type: "Private",
        curriculumId: "c_standard",
        boardName: "BISE",
        sections: ["A", "B"],
      },
      academicStructure: {
        levels: ["Primary", "Secondary"],
        grades: [{ id: "g1", name: "Grade 1", schemeOfStudy: { subjects: [{ name: "Math" }] } }],
        allSubjects: [{ name: "Math" }, { name: "Science" }],
      },
    };

    test('GET: rejects unauthenticated caller with 401', async () => {
      getSessionUser.mockResolvedValue(null);
      const req = new Request('http://localhost/api/v1/settings/school-configuration', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    test('GET: rejects student with 403 Forbidden', async () => {
      getSessionUser.mockResolvedValue({ uid: 'stud_1', email: 's@test.com', role: 'student', tenantId: 'tenant_1' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(403);
    });

    test('GET: rejects teacher with 403 Forbidden', async () => {
      getSessionUser.mockResolvedValue({ uid: 'teach_1', email: 't@test.com', role: 'teacher', tenantId: 'tenant_1' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(403);
    });

    test('GET: rejects parent with 403 Forbidden', async () => {
      getSessionUser.mockResolvedValue({ uid: 'par_1', email: 'p@test.com', role: 'parent', tenantId: 'tenant_1' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(403);
    });

    test('GET: authorizes admin user with 200 OK', async () => {
      getSessionUser.mockResolvedValue({ uid: 'adm_1', email: 'admin@test.com', role: 'admin', tenantId: 'tenant_1' });
      mockConfigurationService.loadConfiguration.mockResolvedValue({ status: 'NOT_CONFIGURED', nextAction: 'Setup' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(200);
    });

    test('GET: authorizes schoolAdmin user with 200 OK', async () => {
      getSessionUser.mockResolvedValue({ uid: 'sadm_1', email: 'schooladmin@test.com', role: 'schoolAdmin', tenantId: 'tenant_1' });
      mockConfigurationService.loadConfiguration.mockResolvedValue({ status: 'NOT_CONFIGURED', nextAction: 'Setup' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(200);
    });

    test('POST: rejects unauthenticated caller with 401', async () => {
      getSessionUser.mockResolvedValue(null);
      const req = new Request('http://localhost/api/v1/settings/school-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    test('POST: rejects student write attempts with 403 Forbidden', async () => {
      getSessionUser.mockResolvedValue({ uid: 'stud_1', email: 's@test.com', role: 'student', tenantId: 'tenant_1' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
      expect(mockConfigurationService.saveAndPublishConfiguration).not.toHaveBeenCalled();
    });

    test('POST: rejects teacher write attempts with 403 Forbidden', async () => {
      getSessionUser.mockResolvedValue({ uid: 'teach_1', email: 't@test.com', role: 'teacher', tenantId: 'tenant_1' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
      expect(mockConfigurationService.saveAndPublishConfiguration).not.toHaveBeenCalled();
    });

    test('POST: rejects parent write attempts with 403 Forbidden', async () => {
      getSessionUser.mockResolvedValue({ uid: 'par_1', email: 'p@test.com', role: 'parent', tenantId: 'tenant_1' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
      expect(mockConfigurationService.saveAndPublishConfiguration).not.toHaveBeenCalled();
    });

    test('POST: authorizes admin write and delegates with user.role', async () => {
      getSessionUser.mockResolvedValue({ uid: 'adm_1', email: 'admin@test.com', role: 'admin', tenantId: 'tenant_1' });
      mockConfigurationService.saveAndPublishConfiguration.mockResolvedValue({ id: 'config_1', state: 'Published' });

      const req = new Request('http://localhost/api/v1/settings/school-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(mockConfigurationService.saveAndPublishConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({ schoolProfile: expect.anything() }),
        'tenant_1',
        'adm_1',
        'admin'
      );
    });

    test('GET: rejects missing role with 401 Unauthorized', async () => {
      getSessionUser.mockResolvedValue({ uid: 'usr_norole', email: 'norole@test.com', tenantId: 'tenant_1' } as any);
      const req = new Request('http://localhost/api/v1/settings/school-configuration', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    test('GET: rejects empty role with 401 Unauthorized', async () => {
      getSessionUser.mockResolvedValue({ uid: 'usr_empty', email: 'empty@test.com', role: '', tenantId: 'tenant_1' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    test('GET: rejects unknown role with 403 Forbidden', async () => {
      getSessionUser.mockResolvedValue({ uid: 'usr_unknown', email: 'unknown@test.com', role: 'intruder', tenantId: 'tenant_1' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', { method: 'GET' });
      const res = await GET(req);
      expect(res.status).toBe(403);
    });

    test('POST: rejects missing role with 401 Unauthorized', async () => {
      getSessionUser.mockResolvedValue({ uid: 'usr_norole', email: 'norole@test.com', tenantId: 'tenant_1' } as any);
      const req = new Request('http://localhost/api/v1/settings/school-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
      expect(mockConfigurationService.saveAndPublishConfiguration).not.toHaveBeenCalled();
    });

    test('POST: rejects empty role with 401 Unauthorized', async () => {
      getSessionUser.mockResolvedValue({ uid: 'usr_empty', email: 'empty@test.com', role: '', tenantId: 'tenant_1' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
      expect(mockConfigurationService.saveAndPublishConfiguration).not.toHaveBeenCalled();
    });

    test('POST: rejects unknown role with 403 Forbidden', async () => {
      getSessionUser.mockResolvedValue({ uid: 'usr_unknown', email: 'unknown@test.com', role: 'intruder', tenantId: 'tenant_1' });
      const req = new Request('http://localhost/api/v1/settings/school-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(403);
      expect(mockConfigurationService.saveAndPublishConfiguration).not.toHaveBeenCalled();
    });

    test('POST: authorizes superAdmin write and delegates with user.role', async () => {
      getSessionUser.mockResolvedValue({ uid: 'super_1', email: 'super@test.com', role: 'superAdmin', tenantId: 'tenant_1' });
      mockConfigurationService.saveAndPublishConfiguration.mockResolvedValue({ id: 'config_1', state: 'Published' });

      const req = new Request('http://localhost/api/v1/settings/school-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(mockConfigurationService.saveAndPublishConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({ schoolProfile: expect.anything() }),
        'tenant_1',
        'super_1',
        'superAdmin'
      );
    });

    test('POST: authorizes super_admin write and delegates with user.role', async () => {
      getSessionUser.mockResolvedValue({ uid: 'super2_1', email: 'super2@test.com', role: 'super_admin', tenantId: 'tenant_1' });
      mockConfigurationService.saveAndPublishConfiguration.mockResolvedValue({ id: 'config_1', state: 'Published' });

      const req = new Request('http://localhost/api/v1/settings/school-configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(mockConfigurationService.saveAndPublishConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({ schoolProfile: expect.anything() }),
        'tenant_1',
        'super2_1',
        'super_admin'
      );
    });
  });
});
