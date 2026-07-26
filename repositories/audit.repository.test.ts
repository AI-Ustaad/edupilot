import { AuditRepository } from '@/repositories/audit.repository';

jest.mock('@/lib/firebase-admin', () => {
  const mockDocRef = {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    id: 'mock-doc-id',
  };
  const mockCountSnap = { data: () => ({ count: 0 }) };
  const mockQuery = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [] }),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    }),
  };
  const mockCollection = {
    add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    doc: jest.fn().mockReturnValue(mockDocRef),
    where: jest.fn().mockReturnValue(mockQuery),
    get: jest.fn().mockResolvedValue({ docs: [] }),
  };
  const mockBatch = {
    delete: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  };
  return {
    adminDb: {
      collection: jest.fn().mockReturnValue(mockCollection),
      batch: jest.fn().mockReturnValue(mockBatch),
    },
    dbTimestamp: new Date().toISOString(),
    mockDocRef,
    mockQuery,
    mockCollection,
    mockBatch,
  };
});

describe('AuditRepository', () => {
  let repo: AuditRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new AuditRepository();
  });

  test('should create audit log and return id', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'audit-123' });

    const entry = {
      action: 'create',
      userId: 'user-1',
      entityType: 'student',
      entityId: 'student-1',
    };
    const id = await repo.create(entry, tenantId);
    expect(id).toBe('audit-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'create',
        userId: 'user-1',
        tenantId,
      })
    );
  });

  test('should find audit logs by tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'a1', data: () => ({ action: 'create', userId: 'user-1', tenantId }) },
        { id: 'a2', data: () => ({ action: 'update', userId: 'user-2', tenantId }) },
      ],
    });

    const logs = await repo.findByTenant(tenantId);
    expect(logs).toHaveLength(2);
    expect(logs[0].action).toBe('create');
  });

  test('should find audit logs by tenant with options', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'a1', data: () => ({ action: 'create', userId: 'user-1', tenantId }) },
      ],
    });

    const logs = await repo.findByTenant(tenantId, { action: 'create', limit: 10, entityType: 'student' });
    expect(logs).toHaveLength(1);
  });

  test('should find audit logs by entity', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'a1', data: () => ({ action: 'create', entityType: 'student', entityId: 'student-1', tenantId }) },
        { id: 'a2', data: () => ({ action: 'update', entityType: 'student', entityId: 'student-1', tenantId }) },
      ],
    });

    const logs = await repo.findByEntity(tenantId, 'student', 'student-1');
    expect(logs).toHaveLength(2);
  });

  test('should find recent audit logs', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'a1', data: () => ({ action: 'create', userId: 'user-1', tenantId }) },
      ],
    });

    const logs = await repo.findRecent(tenantId, 10);
    expect(logs).toHaveLength(1);
  });

  test('should find audit log by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'audit-456',
      data: () => ({
        action: 'create',
        userId: 'user-1',
        tenantId,
      }),
    });

    const log = await repo.findById('audit-456', tenantId);
    expect(log).not.toBeNull();
    expect(log!.action).toBe('create');
  });

  test('should return null for non-existent audit log', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const log = await repo.findById('nonexistent', tenantId);
    expect(log).toBeNull();
  });

  test('should update audit log', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'audit-789',
      data: () => ({ action: 'create', tenantId }),
    });

    await repo.update('audit-789', { action: 'update' } as any, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'update' })
    );
  });

  test('should delete audit log', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'audit-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('audit-999', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'audit-789',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('audit-789', { action: 'update' } as any, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should paginate audit logs', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'a1', data: () => ({ action: 'create', tenantId }) },
        { id: 'a2', data: () => ({ action: 'update', tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 2);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
  });

  test('should count audit logs', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 42 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(42);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await repo.exists('audit-1', tenantId);
    expect(exists).toBe(true);
  });
});
