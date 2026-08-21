import { AcademicYearRepository } from '@/repositories/academic-year.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('AcademicYearRepository', () => {
  let repo: AcademicYearRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new AcademicYearRepository();
  });

  test('should create an academic year and return id', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'ay-123' });

    const data = {
      name: '2024-2025',
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      isCurrent: true,
    };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('ay-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '2024-2025',
        tenantId,
      })
    );
  });

  test('should find academic year by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'ay-456',
      data: () => ({
        name: '2024-2025',
        startDate: '2024-06-01',
        endDate: '2025-05-31',
        isCurrent: true,
        tenantId,
      }),
    });

    const ay = await repo.findById('ay-456', tenantId);
    expect(ay).not.toBeNull();
    expect(ay!.name).toBe('2024-2025');
  });

  test('should return null for non-existent academic year', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const ay = await repo.findById('nonexistent', tenantId);
    expect(ay).toBeNull();
  });

  test('should update an academic year', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'ay-789',
      data: () => ({ name: 'Old Name', tenantId }),
    });

    await repo.update('ay-789', { name: 'Updated Name' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Updated Name' })
    );
  });

  test('should delete an academic year', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'ay-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('ay-999', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'ay-789',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('ay-789', { name: 'Updated' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all academic years for a tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'ay1', data: () => ({ name: '2024-2025', tenantId }) },
        { id: 'ay2', data: () => ({ name: '2023-2024', tenantId }) },
      ],
    });

    const years = await repo.findAll(tenantId);
    expect(years).toHaveLength(2);
    expect(years[0].name).toBe('2024-2025');
  });

  test('should paginate academic years', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'ay1', data: () => ({ name: 'AY 1', tenantId }) },
        { id: 'ay2', data: () => ({ name: 'AY 2', tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 2);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(3);
  });

  test('should count academic years', async () => {
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

    const exists = await repo.exists('ay-1', tenantId);
    expect(exists).toBe(true);
  });

  test('should findAllByTenant', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    const mockOrderBy = jest.fn().mockReturnThis();
    mockCollection.where.mockReturnValue({
      orderBy: mockOrderBy,
      get: jest.fn().mockResolvedValue({
        docs: [
          { id: 'ay1', data: () => ({ name: '2024-2025', startDate: '2024-06-01', endDate: '2025-05-31', isCurrent: true, tenantId }) },
        ],
      }),
    });

    const years = await repo.findAllByTenant(tenantId);
    expect(years).toHaveLength(1);
    expect(years[0].name).toBe('2024-2025');
    expect(mockOrderBy).toHaveBeenCalledWith('startDate', 'desc');
  });

  test('should set current academic year', async () => {
    const { adminDb, mockCollection, mockBatch, mockDocRef } = require('@/lib/firebase-admin');
    mockCollection.where.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        docs: [
          { id: 'ay1', ref: {} },
        ],
      }),
    });
    mockDocRef.update.mockResolvedValue(undefined);

    await repo.setCurrent('ay-1', tenantId);
    expect(mockBatch.update).toHaveBeenCalled();
    expect(mockDocRef.update).toHaveBeenCalledWith({ isCurrent: true });
  });

  test('should create if absent by name when AY does not exist', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const ayCollection = adminDb.collection('academicYears');
    ayCollection.where.mockReturnValue({
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: [] }),
    });
    ayCollection.add.mockResolvedValue({ id: 'ay-new' });

    const id = await repo.createIfAbsentByName('2024-2025', {
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      isCurrent: true,
      tenantId,
    }, tenantId);

    expect(id).toBe('ay-new');
    expect(ayCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '2024-2025',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        isCurrent: true,
        tenantId,
      })
    );
  });

  test('should return existing id when AY with same name exists', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const ayCollection = adminDb.collection('academicYears');
    ayCollection.where.mockReturnValue({
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [
          { id: 'ay-existing', data: () => ({ name: '2024-2025', tenantId }) },
        ],
      }),
    });

    const id = await repo.createIfAbsentByName('2024-2025', {
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      isCurrent: true,
      tenantId,
    }, tenantId);

    expect(id).toBe('ay-existing');
    expect(ayCollection.add).not.toHaveBeenCalled();
  });
});
