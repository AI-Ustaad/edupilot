import { StudentRepository } from '@/repositories/student.repository';

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
    add: jest.fn().mockResolvedValue({ id: 'student-123' }),
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

describe('StudentRepository', () => {
  let repo: StudentRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new StudentRepository();
  });

  test('should create a student and return id', async () => {
    const { adminDb, mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'student-123' });

    const data = {
      fullName: 'Test Student',
      classGrade: '10',
      section: 'A',
      rollNumber: 1,
    };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('student-123');
    expect(mockCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Test Student',
        tenantId,
      })
    );
  });

  test('should find student by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'student-456',
      data: () => ({
        fullName: 'Found Student',
        classGrade: '9',
        section: 'B',
        tenantId,
      }),
    });

    const student = await repo.findById('student-456', tenantId);
    expect(student).not.toBeNull();
    expect(student!.fullName).toBe('Found Student');
  });

  test('should return null for non-existent student', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const student = await repo.findById('nonexistent', tenantId);
    expect(student).toBeNull();
  });

  test('should update a student', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'student-789',
      data: () => ({ fullName: 'Old Name', tenantId }),
    });

    await repo.update('student-789', { fullName: 'Updated Name' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Updated Name' })
    );
  });

  test('should delete a student', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'student-999',
      data: () => ({ tenantId }),
    });

    await repo.delete('student-999', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'student-789',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('student-789', { fullName: 'Updated' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all students for a tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ fullName: 'Student 1', tenantId }) },
        { id: 's2', data: () => ({ fullName: 'Student 2', tenantId }) },
      ],
    });

    const students = await repo.findAll(tenantId);
    expect(students).toHaveLength(2);
    expect(students[0].fullName).toBe('Student 1');
  });

  test('should paginate students', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ fullName: 'Student 1', tenantId }) },
        { id: 's2', data: () => ({ fullName: 'Student 2', tenantId }) },
        { id: 's3', data: () => ({ fullName: 'Student 3', tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count students', async () => {
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

    const exists = await repo.exists('student-1', tenantId);
    expect(exists).toBe(true);
  });
});
