import { DepartmentRepository } from '@/repositories/department.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('DepartmentRepository', () => {
  let repo: DepartmentRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new DepartmentRepository();
  });

  test('should get all departments for a tenant', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const deptCollection = adminDb.collection('departments');
    deptCollection.where.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [
          { id: 'd1', data: () => ({ name: 'CS', code: 'CS', deleted: false, tenantId }) },
          { id: 'd2', data: () => ({ name: 'Math', code: 'MTH', deleted: false, tenantId }) },
        ],
      }),
    });

    const departments = await repo.getAll(tenantId);
    expect(departments).toHaveLength(2);
    expect(departments[0].name).toBe('CS');
  });

  test('should create department when not exists', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const deptCollection = adminDb.collection('departments');
    deptCollection.where.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: [] }),
    });
    deptCollection.add.mockResolvedValue({ id: 'dept-123' });

    const res = await repo.createAbsentByName(tenantId, 'Computer Science', {
      code: 'CS',
      description: 'CS Dept',
      deleted: false,
    });
    expect(res.id).toBe('dept-123');
    expect(res.created).toBe(true);
    expect(deptCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Computer Science',
        code: 'CS',
        tenantId,
      })
    );
  });

  test('should return existing id when department with same name exists', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const deptCollection = adminDb.collection('departments');
    deptCollection.where.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [
          { id: 'dept-existing', data: () => ({ name: 'Computer Science', code: 'CS', deleted: false, tenantId }) },
        ],
      }),
    });

    const res = await repo.createAbsentByName(tenantId, 'Computer Science', {
      code: 'CS',
      description: 'CS Dept',
      deleted: false,
    });
    expect(res.id).toBe('dept-existing');
    expect(res.created).toBe(false);
  });

  test('should not create duplicates for whitespace/case variant names', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const deptCollection = adminDb.collection('departments');
    deptCollection.where.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [
          { id: 'dept-1', data: () => ({ name: 'Computer Science', code: 'CS', deleted: false, tenantId }) },
        ],
      }),
    });
    deptCollection.add.mockResolvedValue({ id: 'should-not-be-used' });

    const res = await repo.createAbsentByName(tenantId, ' computer science ', { code: 'CS', description: '', deleted: false });
    expect(res.id).toBe('dept-1');
    expect(res.created).toBe(false);
    expect(deptCollection.add).not.toHaveBeenCalled();
  });

  test('should resolve Computer Science, computer science , COMPUTER SCIENCE as one department', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const deptCollection = adminDb.collection('departments');
    let createdCall = false;
    deptCollection.where.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: createdCall ? [{ id: 'dept-1', data: () => ({ name: 'Computer Science', deleted: false, tenantId }) }] : [],
      }),
    }));
    deptCollection.add.mockImplementation(() => {
      createdCall = true;
      return Promise.resolve({ id: 'dept-1' });
    });

    const rA = await repo.createAbsentByName(tenantId, 'Computer Science', { code: 'CS', description: '', deleted: false });
    const rB = await repo.createAbsentByName(tenantId, ' computer science ', { code: 'CS', description: '', deleted: false });
    const rC = await repo.createAbsentByName(tenantId, 'COMPUTER SCIENCE', { code: 'CS', description: '', deleted: false });

    expect(rA.id).toBe('dept-1');
    expect(rB.id).toBe('dept-1');
    expect(rC.id).toBe('dept-1');
    expect(deptCollection.add).toHaveBeenCalledTimes(1);
  });

  test('should NOT update existing department fields (create-if-absent, Option A)', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const deptCollection = adminDb.collection('departments');
    const existingUpdate = jest.fn().mockResolvedValue(undefined);
    const existingDocRef = { id: 'dept-existing', update: existingUpdate };
    deptCollection.where.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [
          { id: 'dept-existing', data: () => ({ name: 'Computer Science', code: 'OLD', headOfDepartment: 'hod-1', deleted: false, tenantId }), ref: existingDocRef },
        ],
      }),
    });
    deptCollection.add.mockResolvedValue({ id: 'should-not-be-used' });

    const res = await repo.createAbsentByName(tenantId, 'Computer Science', {
      code: 'NEW',
      description: 'Overwriting attempt',
      deleted: false,
    });
    expect(res.id).toBe('dept-existing');
    expect(res.created).toBe(false);
    expect(deptCollection.add).not.toHaveBeenCalled();
    expect(existingUpdate).not.toHaveBeenCalled();
  });

  test('should scope department lookup by tenantId', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const deptCollection = adminDb.collection('departments');
    deptCollection.where.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: [] }),
    });
    deptCollection.add.mockResolvedValue({ id: 'dept-new' });

    await repo.createAbsentByName('tenant-A', 'Computer Science', { code: 'CS', description: '', deleted: false });
    expect(deptCollection.where).toHaveBeenCalledWith('tenantId', '==', 'tenant-A');
  });
});
