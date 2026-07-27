import { BusRepository } from '@/repositories/bus.repository';

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

describe('BusRepository', () => {
  let repo: BusRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new BusRepository();
  });

  test('should create a bus and return id', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'bus-123' });

    const data = {
      busNumber: 'ABC-123',
      capacity: 40,
      driverName: 'John Doe',
    };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('bus-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        busNumber: 'ABC-123',
        tenantId,
      })
    );
  });

  test('should find bus by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'bus-456',
      data: () => ({
        busNumber: 'ABC-123',
        capacity: 40,
        driverName: 'John Doe',
        tenantId,
      }),
    });

    const bus = await repo.findById('bus-456', tenantId);
    expect(bus).not.toBeNull();
    expect(bus!.busNumber).toBe('ABC-123');
  });

  test('should return null for non-existent bus', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const bus = await repo.findById('nonexistent', tenantId);
    expect(bus).toBeNull();
  });

  test('should update a bus', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'bus-789',
      data: () => ({ busNumber: 'OLD-123', tenantId }),
    });

    await repo.update('bus-789', { busNumber: 'NEW-456' } as any, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ busNumber: 'NEW-456' })
    );
  });

  test('should delete a bus', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'bus-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('bus-999', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'bus-789',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('bus-789', { busNumber: 'NEW-456' } as any, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all buses for a tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ busNumber: 'ABC-123', tenantId }) },
        { id: 'b2', data: () => ({ busNumber: 'XYZ-789', tenantId }) },
      ],
    });

    const buses = await repo.findAll(tenantId);
    expect(buses).toHaveLength(2);
    expect(buses[0].busNumber).toBe('ABC-123');
  });

  test('should paginate buses', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'b1', data: () => ({ busNumber: 'ABC-123', tenantId }) },
        { id: 'b2', data: () => ({ busNumber: 'XYZ-789', tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 2);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
  });

  test('should count buses', async () => {
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

    const exists = await repo.exists('bus-1', tenantId);
    expect(exists).toBe(true);
  });

  test('should soft delete a bus', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'bus-789',
      data: () => ({ busNumber: 'ABC-123', tenantId }),
    });

    await repo.softDelete('bus-789', tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ deletedAt: expect.anything() })
    );
  });

  test('should bulk create buses', async () => {
    const { adminDb, mockBatch, mockCollection } = require('@/lib/firebase-admin');
    mockBatch.commit.mockResolvedValue(undefined);
    mockCollection.doc.mockReturnValue({
      id: 'bulk-bus-1',
    });

    const dataArray = [
      { busNumber: 'ABC-123', capacity: 40 },
      { busNumber: 'XYZ-789', capacity: 30 },
    ];
    const ids = await repo.bulkCreate(dataArray as any, tenantId);
    expect(ids).toHaveLength(2);
    expect(mockBatch.set).toHaveBeenCalledTimes(2);
    expect(mockBatch.commit).toHaveBeenCalled();
  });
});
