import { AttendanceRepository } from '@/repositories/attendance.repository';

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

describe('AttendanceRepository', () => {
  let repo: AttendanceRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new AttendanceRepository();
  });

  test('should create attendance record and return id', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'att-123' });

    const data = {
      date: '2024-06-01',
      classGrade: '10',
      section: 'A',
      studentId: 'student-1',
      status: 'present',
    } as any;
    const id = await repo.create(data, tenantId);
    expect(id).toBe('att-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2024-06-01',
        tenantId,
      })
    );
  });

  test('should find attendance by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'att-456',
      data: () => ({
        date: '2024-06-01',
        classGrade: '10',
        section: 'A',
        studentId: 'student-1',
        status: 'present',
        tenantId,
      }),
    });

    const attendance = await repo.findById('att-456', tenantId);
    expect(attendance).not.toBeNull();
    expect(attendance!.status).toBe('present');
  });

  test('should return null for non-existent attendance', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const attendance = await repo.findById('nonexistent', tenantId);
    expect(attendance).toBeNull();
  });

  test('should update attendance', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'att-789',
      data: () => ({ status: 'present', tenantId }),
    });

    await repo.update('att-789', { status: 'absent' } as any, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'absent' })
    );
  });

  test('should delete attendance', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'att-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('att-999', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'att-789',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('att-789', { status: 'absent' } as any, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all attendance for a tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'att1', data: () => ({ date: '2024-06-01', studentId: 'student-1', tenantId }) },
        { id: 'att2', data: () => ({ date: '2024-06-02', studentId: 'student-2', tenantId }) },
      ],
    });

    const attendance = await repo.findAll(tenantId);
    expect(attendance).toHaveLength(2);
    expect(attendance[0].date).toBe('2024-06-01');
  });

  test('should paginate attendance', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'att1', data: () => ({ date: '2024-06-01', tenantId }) },
        { id: 'att2', data: () => ({ date: '2024-06-02', tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 2);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(3);
  });

  test('should count attendance', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [],
      size: 42,
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

    const exists = await repo.exists('att-1', tenantId);
    expect(exists).toBe(true);
  });

  test('should findWithFilters', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'att1', data: () => ({ date: '2024-06-01', classGrade: '10', section: 'A', studentId: 'student-1', tenantId }) },
      ],
    });

    const attendance = await repo.findWithFilters(tenantId, {
      date: '2024-06-01',
      classGrade: '10',
      section: 'A',
      studentId: 'student-1',
    });
    expect(attendance).toHaveLength(1);
    expect(attendance[0].date).toBe('2024-06-01');
  });

  test('should findByStudentId', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'att1', data: () => ({ date: '2024-06-01', studentId: 'student-1', tenantId }) },
        { id: 'att2', data: () => ({ date: '2024-06-02', studentId: 'student-1', tenantId }) },
      ],
    });

    const attendance = await repo.findByStudentId(tenantId, 'student-1');
    expect(attendance).toHaveLength(2);
    expect(attendance[0].studentId).toBe('student-1');
  });

  test('should findByStudentIds', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'att1', data: () => ({ date: '2024-06-01', studentId: 'student-1', tenantId }) },
        { id: 'att2', data: () => ({ date: '2024-06-02', studentId: 'student-2', tenantId }) },
      ],
    });

    const attendance = await repo.findByStudentIds(tenantId, ['student-1', 'student-2']);
    expect(attendance).toHaveLength(2);
  });

  test('should bulkCreate attendance records', async () => {
    const { adminDb, mockBatch } = require('@/lib/firebase-admin');
    mockBatch.commit.mockResolvedValue(undefined);

    const documents = [
      { id: 'att1', date: '2024-06-01', status: 'present' } as any,
      { id: 'att2', date: '2024-06-02', status: 'present' } as any,
    ];
    const ids = await repo.bulkCreate(documents, tenantId);
    expect(ids).toHaveLength(2);
    expect(mockBatch.set).toHaveBeenCalledTimes(2);
  });

  test('should save attendance record', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'att-456',
      data: () => ({ date: '2024-06-01', status: 'present', tenantId }),
    });

    const document = { id: 'att-456', date: '2024-06-01', status: 'present' } as any;
    const result = await repo.save(document, tenantId);
    expect(result.status).toBe('present');
  });
});
