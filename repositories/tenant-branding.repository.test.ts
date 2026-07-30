import { TenantBrandingRepository } from '@/repositories/tenant-branding.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('TenantBrandingRepository', () => {
  let repo: TenantBrandingRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new TenantBrandingRepository();
  });

  test('should find tenant branding by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ logo: 'logo-url', tenantId }),
    });

    const branding = await repo.findById(tenantId, tenantId);
    expect(branding).not.toBeNull();
    expect(branding!.logo).toBe('logo-url');
  });

  test('should return null for non-existent branding', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const branding = await repo.findById('nonexistent', tenantId);
    expect(branding).toBeNull();
  });

  test('should create tenant branding', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'branding-123' });

    const data = { logo: 'logo-url', tenantId };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('branding-123');
  });

  test('should update tenant branding', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ tenantId, logo: 'old-url' }),
    });

    await repo.update(tenantId, { logo: 'new-url' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ logo: 'new-url' })
    );
  });

  test('should delete tenant branding', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ tenantId }),
    });

    await repo.delete(tenantId, tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update(tenantId, { logo: 'new-url' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all tenant brandings', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ tenantId }) },
      ],
    });

    const brandings = await repo.findAll(tenantId);
    expect(brandings).toHaveLength(1);
  });

  test('should paginate tenant brandings', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ tenantId }) },
        { id: 'b2', data: () => ({ tenantId }) },
        { id: 'b3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count tenant brandings', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 10 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(10);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await repo.exists(tenantId, tenantId);
    expect(exists).toBe(true);
  });
});