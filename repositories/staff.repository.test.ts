import { StaffRepository } from '@/repositories/staff.repository';

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
    add: jest.fn().mockResolvedValue({ id: 'staff-123' }),
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

describe('StaffRepository', () => {
  let repo: StaffRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new StaffRepository();
  });

  test('should save staff document (update existing)', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'st1',
      data: () => ({ tenantId }),
    });

    const document = { id: 'st1', tenantId, fullName: 'John Staff' };
    await repo.save(document as any, tenantId);
    expect(mockDocRef.update).toHaveBeenCalled();
  });

  test('should save staff document (create new)', async () => {
    const { mockCollection, mockDocRef } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'staff-123' });
    mockDocRef.get.mockResolvedValue({ exists: true, data: () => ({ tenantId }) });

    const document = { fullName: 'John Staff', tenantId };
    await repo.save(document as any, tenantId);
    expect(mockCollection.add).toHaveBeenCalled();
  });

  test('should search staff', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId, fullName: 'John Doe', email: 'john@test.com' }) },
        { id: 'st2', data: () => ({ tenantId, fullName: 'Jane Smith', email: 'jane@test.com' }) },
      ],
    });

    const results = await repo.search(tenantId, 'John');
    expect(results).toHaveLength(1);
    expect(results[0].fullName).toBe('John Doe');
  });

  test('should find staff by email', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId, email: 'john@test.com' }) },
      ],
    });

    const staff = await repo.findByEmail(tenantId, 'john@test.com');
    expect(staff).not.toBeNull();
  });

  test('should return null for non-existent staff email', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({ docs: [], empty: true });

    const staff = await repo.findByEmail(tenantId, 'nonexistent@test.com');
    expect(staff).toBeNull();
  });

  test('should find staff by employee id', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId, employeeId: 'EMP001' }) },
      ],
    });

    const staff = await repo.findByEmployeeId('EMP001', tenantId);
    expect(staff).not.toBeNull();
  });

  test('should return null for non-existent employee id', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({ docs: [], empty: true });

    const staff = await repo.findByEmployeeId('EMP999', tenantId);
    expect(staff).toBeNull();
  });

  test('should find staff by category', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId, category: 'Teaching' }) },
      ],
    });

    const staff = await repo.findByCategory('Teaching', tenantId);
    expect(staff).toHaveLength(1);
  });

  test('should find staff by department', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId, department: 'Math' }) },
      ],
    });

    const staff = await repo.findByDepartment('Math', tenantId);
    expect(staff).toHaveLength(1);
  });

  test('should find staff by designation', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId, designation: 'Teacher' }) },
      ],
    });

    const staff = await repo.findByDesignation('Teacher', tenantId);
    expect(staff).toHaveLength(1);
  });

  test('should find staff by status', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId, status: 'active' }) },
      ],
    });

    const staff = await repo.findByStatus('active', tenantId);
    expect(staff).toHaveLength(1);
  });

  test('should find staff by campus', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId, campus: 'Main' }) },
      ],
    });

    const staff = await repo.findByCampus('Main', tenantId);
    expect(staff).toHaveLength(1);
  });

  test('should find staff by role', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId, role: 'admin' }) },
      ],
    });

    const staff = await repo.findByRole('admin', tenantId);
    expect(staff).toHaveLength(1);
  });

  test('should advance filter staff', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId, fullName: 'John Doe', department: 'Math', category: 'Teaching', status: 'active', campus: 'Main', gender: 'Male', employmentType: 'Full-time' }) },
        { id: 'st2', data: () => ({ tenantId, fullName: 'Jane Smith', department: 'Science', category: 'Teaching', status: 'active', campus: 'Main', gender: 'Female', employmentType: 'Full-time' }) },
        { id: 'st3', data: () => ({ tenantId, fullName: 'Bob Jones', department: 'Math', category: 'Non-Teaching', status: 'terminated', campus: 'Branch', gender: 'Male', employmentType: 'Part-time' }) },
      ],
    });

    const filter = { search: 'John',department: 'Math', category: 'Teaching', status: 'active', page: 1, limit: 20 };
    const result = await repo.advancedFilter(tenantId, filter);
    expect(result.data).toHaveLength(1);
  });

  test('should bulk update staff', async () => {
    const { mockDocRef, mockBatch } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'st1',
      data: () => ({ tenantId }),
    });

    await repo.bulkUpdate(tenantId, ['st1'], { status: 'active' });
    expect(mockBatch.update).toHaveBeenCalled();
  });

  test('should bulk delete staff', async () => {
    const { mockDocRef, mockBatch } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'st1',
      data: () => ({ tenantId }),
    });

    await repo.bulkDelete(tenantId, ['st1']);
    expect(mockBatch.update).toHaveBeenCalled();
  });

  test('should archive staff', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'st1',
      data: () => ({ tenantId }),
    });

    await repo.archive(tenantId, 'st1');
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'archived' })
    );
  });

  test('should restore staff', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'st1',
      data: () => ({ tenantId }),
    });

    await repo.restore(tenantId, 'st1');
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' })
    );
  });

  test('should compute staff analytics', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId, status: 'active', department: 'Math', category: 'Teaching', campus: 'Main', gender: 'Male' }) },
        { id: 'st2', data: () => ({ tenantId, status: 'active', department: 'Science', category: 'Teaching', campus: 'Main', gender: 'Female' }) },
        { id: 'st3', data: () => ({ tenantId, status: 'terminated', department: 'Math', category: 'Non-Teaching', campus: 'Branch', gender: 'Male' }) },
      ],
    });

    const analytics = await repo.staffAnalytics(tenantId);
    expect(analytics.total).toBe(3);
    expect(analytics.active).toBe(2);
    expect(analytics.terminated).toBe(1);
  });

  test('should get staff timeline', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'st1',
      data: () => ({
        tenantId,
        createdAt: new Date('2023-01-01'),
        professional: { designation: 'Teacher', department: 'Math' },
        statusHistory: [{ fromStatus: 'active', toStatus: 'on-leave', changedAt: new Date('2024-01-01'), reason: 'Vacation', changedBy: 'admin' }],
      }),
    });

    const timeline = await repo.timeline(tenantId, 'st1');
    expect(timeline.length).toBeGreaterThan(0);
  });

  test('should find staff by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'st1',
      data: () => ({ tenantId, fullName: 'John Staff' }),
    });

    const staff = await repo.findById('st1', tenantId);
    expect(staff).not.toBeNull();
    expect(staff!.fullName).toBe('John Staff');
  });

  test('should create staff', async () => {
    const { mockCollection } = require('@/lib/firebase-admin');
    mockCollection.add.mockResolvedValue({ id: 'staff-123' });

    const data = { fullName: 'John Staff', email: 'john@test.com' };
    const id = await repo.create(data as any, tenantId);
    expect(id).toBe('staff-123');
  });

  test('should update a staff member', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'st1',
      data: () => ({ tenantId, fullName: 'Old Name' }),
    });

    await repo.update('st1', { fullName: 'Updated Name' }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Updated Name' })
    );
  });

  test('should delete a staff member', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'st1',
      data: () => ({ tenantId }),
    });

    await repo.delete('st1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'st1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('st1', { fullName: 'Updated' }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all staff', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId }) },
      ],
    });

    const staff = await repo.findAll(tenantId);
    expect(staff).toHaveLength(1);
  });

  test('should paginate staff', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'st1', data: () => ({ tenantId }) },
        { id: 'st2', data: () => ({ tenantId }) },
        { id: 'st3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count staff', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 25 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(25);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await repo.exists('st1', tenantId);
    expect(exists).toBe(true);
  });
});