import { UserRepository } from '@/repositories/user.repository';
import { Role } from '@/types/auth';

jest.mock('@/lib/firebase-admin', () => {
  const mockDocRef = {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    id: 'mock-doc-id',
  };
  const mockQuery = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [] }),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }),
    }),
  };
  const mockCollection = {
    add: jest.fn().mockResolvedValue({ id: 'user-123' }),
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

describe('UserRepository', () => {
  let repo: UserRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new UserRepository();
  });

  test('should find user by uid', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'user-uid-1',
      data: () => ({ email: 'test@test.com', role: 'teacher', tenantId, onboardingRequired: false }),
    });

    const user = await repo.findByUidWithFallback('user-uid-1');
    expect(user.uid).toBe('user-uid-1');
    expect(user.email).toBe('test@test.com');
    expect(user.role).toBe('teacher');
  });

  test('should find user by uid with email fallback', async () => {
    const { mockDocRef, mockQuery } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'user-uid-fallback', exists: true, data: () => ({ email: 'test@test.com', role: 'teacher', tenantId }) },
      ],
    });

    const user = await repo.findByUidWithFallback('wrong-uid', 'test@test.com');
    expect(user.uid).toBe('user-uid-fallback');
  });

  test('should throw UserProfileNotFoundError for non-existent user', async () => {
    const { mockDocRef, mockQuery } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });
    mockQuery.get.mockResolvedValue({ docs: [] });

    await expect(
      repo.findByUidWithFallback('nonexistent')
    ).rejects.toThrow();
  });

  test('should find all users by tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'u1', data: () => ({ tenantId, email: 'test1@test.com', role: 'teacher' }) },
        { id: 'u2', data: () => ({ tenantId, email: 'test2@test.com', role: 'admin' }) },
      ],
    });

    const users = await repo.findAllByTenant(tenantId);
    expect(users).toHaveLength(2);
  });

  test('should update user role', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'u1',
      data: () => ({ tenantId }),
    });

    await repo.updateRole('u1', 'admin', tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' })
    );
  });

  test('should create a user', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const data = { uid: 'user-uid-1', email: 'test@test.com', role: 'teacher' as Role, tenantId, createdAt: new Date() };
    const id = await repo.create(data);
    expect(id).toBe('user-uid-1');
  });

  test('should find all users', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'u1', data: () => ({ tenantId }) },
      ],
    });

    const users = await repo.findAllByTenant(tenantId);
    expect(users).toHaveLength(1);
  });

  test('should paginate users', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'u1', data: () => ({ tenantId }) },
        { id: 'u2', data: () => ({ tenantId }) },
        { id: 'u3', data: () => ({ tenantId }) },
      ],
    });

    const result = await (repo as any).paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count users', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 30 }) }),
    });

    const count = await (repo as any).count(tenantId);
    expect(count).toBe(30);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await (repo as any).exists('u1', tenantId);
    expect(exists).toBe(true);
  });
});