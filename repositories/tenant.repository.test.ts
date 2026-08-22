import { TenantRepository } from '@/repositories/tenant.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('TenantRepository', () => {
  let repo: TenantRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new TenantRepository();
  });

  test('should find active tenants', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 't1', data: () => ({ status: 'active', tenantId }) },
        { id: 't2', data: () => ({ status: 'suspended', tenantId }) },
      ],
    });

    const tenants = await repo.findActive();
    expect(tenants).toHaveLength(2);
  });

  test('should find tenants by plan', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 't1', data: () => ({ plan: 'pro', tenantId }) },
        { id: 't2', data: () => ({ plan: 'free', tenantId }) },
      ],
    });

    const tenants = await repo.findByPlan('pro');
    expect(tenants).toHaveLength(2);
  });

  test('should list all tenants', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.get.mockResolvedValue({
      docs: [
        { id: 't1', data: () => ({ tenantId }) },
        { id: 't2', data: () => ({ tenantId }) },
      ],
    });

    const tenants = await repo.listAll();
    expect(tenants).toHaveLength(2);
  });

  test('should find tenant by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ name: 'Test Tenant', tenantId }),
    });

    const tenant = await repo.findById(tenantId, tenantId);
    expect(tenant).not.toBeNull();
    expect(tenant!.name).toBe('Test Tenant');
  });

  test('should return null for non-existent tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const tenant = await repo.findById('nonexistent', tenantId);
    expect(tenant).toBeNull();
  });

  test('should create a tenant', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'tenant-123' });

    const data = { name: 'New Tenant', domain: 'newtenant.com' };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('tenant-123');
  });

  test('should update a tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ name: 'Old Name', tenantId }),
    });

    await repo.update(tenantId, { name: 'New Name' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Name' })
    );
  });

  test('should delete a tenant', async () => {
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
      repo.update(tenantId, { name: 'New Name' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should paginate tenants', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 't1', data: () => ({ tenantId }) },
        { id: 't2', data: () => ({ tenantId }) },
        { id: 't3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count tenants', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 15 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(15);
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

  test('should restore a missing tenant document', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false });

    const data = { name: 'Restored School', type: 'Private', ownerId: 'user-1', status: 'active' };
    await repo.restoreTenant(tenantId, data);

    expect(mockDocRef.set).toHaveBeenCalledWith(data);
  });

  test('should not restore an existing tenant document', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: true, data: () => ({ name: 'Existing' }) });

    await expect(
      repo.restoreTenant(tenantId, { name: 'Should Not Overwrite' })
    ).rejects.toThrow('already exists');

    expect(mockDocRef.set).not.toHaveBeenCalled();
  });

  test('should verify user-tenant association when matching', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId: 'tenant_abc', role: 'admin' }),
    });

    const result = await repo.verifyUserTenantAssociation('user-abc', 'tenant_abc');
    expect(result).toBe(true);
  });

  test('should reject user-tenant association when mismatched', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId: 'tenant_other', role: 'admin' }),
    });

    const result = await repo.verifyUserTenantAssociation('user-abc', 'tenant_abc');
    expect(result).toBe(false);
  });

  test('should reject user-tenant association when user does not exist', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const result = await repo.verifyUserTenantAssociation('nonexistent-user', 'tenant_abc');
    expect(result).toBe(false);
  });
});