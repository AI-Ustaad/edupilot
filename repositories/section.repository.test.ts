import { SectionRepository } from '@/repositories/section.repository';
import { createFirestoreTestFactory } from '@/__tests__/utils/firestore-mock';

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});

describe('SectionRepository', () => {
  let repo: SectionRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new SectionRepository();
  });

  test('should create a section', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const sectionCollection = adminDb.collection('sections');
    sectionCollection.add.mockResolvedValue({ id: 'section-123' });

    const data = {
      classGrade: '10',
      sectionName: 'A',
      incharge: 'teacher-1',
      subjects: { core: ['Math'], electives: ['Art'] },
    } as any;
    const id = await repo.create(data, tenantId);
    expect(id).toBe('section-123');
    expect(sectionCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        classGrade: '10',
        sectionName: 'A',
        tenantId,
      })
    );
  });

  test('should find section by id', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const sectionDoc = adminDb.collection('sections').doc('section-456');
    sectionDoc.get.mockResolvedValue({
      exists: true,
      id: 'section-456',
      data: () => ({
        classGrade: '10',
        sectionName: 'A',
        incharge: 'teacher-1',
        tenantId,
      }),
    });

    const section = await repo.findById('section-456', tenantId);
    expect(section).not.toBeNull();
    expect(section!.sectionName).toBe('A');
  });

  test('should return null for non-existent section', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const sectionDoc = adminDb.collection('sections').doc('nonexistent');
    sectionDoc.get.mockResolvedValue({ exists: false, data: () => null });

    const section = await repo.findById('nonexistent', tenantId);
    expect(section).toBeNull();
  });

  test('should find all active sections for a tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', deleted: false, tenantId }) },
        { id: 's2', data: () => ({ classGrade: '9', sectionName: 'B', deleted: true, tenantId }) },
      ],
    });

    const sections = await repo.findAllActive(tenantId);
    expect(sections).toHaveLength(1);
    expect(sections[0].sectionName).toBe('A');
  });

  test('should soft delete a section', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const sectionDoc = adminDb.collection('sections').doc('section-789');
    sectionDoc.get.mockResolvedValue({
      exists: true,
      id: 'section-789',
      data: () => ({ tenantId }),
    });

    await repo.softDeleteBySectionId('section-789', tenantId, 'user-1');
    expect(sectionDoc.update).toHaveBeenCalledWith(
      expect.objectContaining({
        deleted: true,
        deletedBy: 'user-1',
      })
    );
  });

  test('should throw when soft deleting non-existent section', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const sectionDoc = adminDb.collection('sections').doc('nonexistent');
    sectionDoc.get.mockResolvedValue({ exists: false, data: () => null });

    await expect(repo.softDeleteBySectionId('nonexistent', tenantId, 'user-1')).rejects.toThrow('Section not found or unauthorized');
  });

  test('should delete all sections for a tenant', async () => {
    const { mockQuery, mockBatch } = require('@/lib/firebase-admin');
    const mockDocRefA = { id: 's1' };
    const mockDocRefB = { id: 's2' };
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', tenantId }), ref: mockDocRefA },
        { id: 's2', data: () => ({ classGrade: '9', sectionName: 'B', tenantId }), ref: mockDocRefB },
      ],
    });

    await repo.deleteAllForTenant(tenantId);
    expect(mockBatch.delete).toHaveBeenCalledTimes(2);
    expect(mockBatch.delete).toHaveBeenCalledWith(mockDocRefA);
    expect(mockBatch.delete).toHaveBeenCalledWith(mockDocRefB);
    expect(mockBatch.commit).toHaveBeenCalled();
  });

  test('should create missing structure', async () => {
    const { mockQuery, mockCollection, mockBatch } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', tenantId, deleted: false }) },
      ],
    });

    const structure = [
      { classGrade: '10', sectionName: 'A', subjects: { core: ['Math'], electives: [] } },
      { classGrade: '10', sectionName: 'B', subjects: { core: ['Math'], electives: [] } },
    ];
    await repo.createMissingStructure(tenantId, structure, 'user-1');
    expect(mockBatch.set).toHaveBeenCalledTimes(1);
    expect(mockBatch.commit).toHaveBeenCalled();
  });

  test('should update a section', async () => {
    const { adminDb } = require('@/lib/firebase-admin');
    const sectionDoc = adminDb.collection('sections').doc('section-111');
    sectionDoc.get.mockResolvedValue({
      exists: true,
      id: 'section-111',
      data: () => ({ sectionName: 'Old', tenantId }),
    });

    await repo.update('section-111', { sectionName: 'Updated' }, tenantId);
    expect(sectionDoc.update).toHaveBeenCalledWith(
      expect.objectContaining({ sectionName: 'Updated' })
    );
  });

  test('should count sections', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 6 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(6);
  });

  test('should paginate sections', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 8 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', tenantId }) },
        { id: 's2', data: () => ({ classGrade: '9', sectionName: 'B', tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 2);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(8);
    expect(result.totalPages).toBe(4);
  });
});
