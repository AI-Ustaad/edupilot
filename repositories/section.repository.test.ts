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

  test('should create missing sections with deterministic ids', async () => {
    const { mockQuery, mockBatch, mockCollection } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', tenantId, deleted: false }) },
      ],
    });

    const mockDocRef = { id: 'det-id', set: jest.fn().mockResolvedValue(undefined) };
    mockCollection.doc.mockReturnValue(mockDocRef as any);

    const structure = [
      { classGrade: '10', sectionName: 'A', subjects: { core: ['Math'], electives: [] } },
      { classGrade: '10', sectionName: 'B', subjects: { core: ['Math'], electives: [] } },
    ];
    const created = await repo.createMissingSections(tenantId, structure, 'user-1');
    expect(created).toBe(1);
    expect(mockBatch.set).toHaveBeenCalledTimes(1);
    expect(mockBatch.commit).toHaveBeenCalled();
    expect(mockCollection.doc).toHaveBeenCalledWith(`${tenantId}__10__b`);
  });

  test('should return 0 when all sections already exist', async () => {
    const { mockQuery, mockBatch } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', tenantId, deleted: false }) },
        { id: 's2', data: () => ({ classGrade: '10', sectionName: 'B', tenantId, deleted: false }) },
      ],
    });

    const structure = [
      { classGrade: '10', sectionName: 'A', subjects: { core: ['Math'], electives: [] } },
      { classGrade: '10', sectionName: 'B', subjects: { core: ['Math'], electives: [] } },
    ];
    const created = await repo.createMissingSections(tenantId, structure, 'user-1');
    expect(created).toBe(0);
    expect(mockBatch.set).not.toHaveBeenCalled();
  });

  test('new section is created with deleted:false', async () => {
    const { mockQuery, mockBatch, mockCollection } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({ docs: [] });
    mockCollection.doc.mockReturnValue({ id: 'det', set: jest.fn().mockResolvedValue(undefined) });

    const structure = [{ classGrade: '10', sectionName: 'A', subjects: { core: ['Math'], electives: [] } }];
    await repo.createMissingSections(tenantId, structure, 'user-1');

    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    expect(mockBatch.set).toHaveBeenCalledTimes(1);
    expect(mockBatch.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ classGrade: '10', sectionName: 'A', tenantId, deleted: false, createdBy: 'user-1' }),
      { merge: true }
    );
  });

  test('existing active section remains active (is not rewritten)', async () => {
    const { mockQuery, mockBatch } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [{ id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', tenantId, deleted: false }) }],
    });

    const structure = [{ classGrade: '10', sectionName: 'A' }];
    const created = await repo.createMissingSections(tenantId, structure, 'user-1');
    expect(created).toBe(0);
    expect(mockBatch.set).not.toHaveBeenCalled();
  });

  test('existing soft-deleted section is NOT resurrected (deleted stays true)', async () => {
    const { mockQuery, mockBatch } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [{ id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', tenantId, deleted: true, deletedAt: '2024-01-01', deletedBy: 'admin' }) }],
    });

    const structure = [{ classGrade: '10', sectionName: 'A' }];
    const created = await repo.createMissingSections(tenantId, structure, 'user-1');
    expect(created).toBe(0);
    expect(mockBatch.set).not.toHaveBeenCalled();
    expect(mockBatch.commit).not.toHaveBeenCalled();
  });

  test('re-running provisioning does NOT resurrect a deleted section', async () => {
    const { mockQuery, mockBatch } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [{ id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', tenantId, deleted: true }) }],
    });

    const structure = [{ classGrade: '10', sectionName: 'A' }];
    await repo.createMissingSections(tenantId, structure, 'user-1');
    await repo.createMissingSections(tenantId, structure, 'user-1');
    expect(mockBatch.set).not.toHaveBeenCalled();
  });

  test('soft-deleted section is preserved even when its deterministic id would collide', async () => {
    const { mockQuery, mockBatch } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [{ id: `${tenantId}__10__a`, data: () => ({ classGrade: '10', sectionName: 'A', tenantId, deleted: true }) }],
    });

    const structure = [{ classGrade: '10', sectionName: 'A' }];
    const created = await repo.createMissingSections(tenantId, structure, 'user-1');
    expect(created).toBe(0);
    expect(mockBatch.set).not.toHaveBeenCalled();
  });

  test('existing auto-ID section is detected independently of doc id', async () => {
    const { mockQuery, mockBatch } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [{ id: 'auto-generated-id-xyz', data: () => ({ classGrade: '10', sectionName: 'A', tenantId, deleted: false }) }],
    });

    const structure = [{ classGrade: '10', sectionName: 'A' }];
    const created = await repo.createMissingSections(tenantId, structure, 'user-1');
    expect(created).toBe(0);
    expect(mockBatch.set).not.toHaveBeenCalled();
  });

  test('section with whitespace/case variants resolve to the same record', async () => {
    const { mockQuery, mockBatch } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [{ id: 's1', data: () => ({ classGrade: ' 10 ', sectionName: 'A ', tenantId, deleted: false }) }],
    });

    const structure = [{ classGrade: '10', sectionName: 'a', subjects: { core: ['Math'], electives: [] } }];
    const created = await repo.createMissingSections(tenantId, structure, 'user-1');
    expect(created).toBe(0);
    expect(mockBatch.set).not.toHaveBeenCalled();
  });

  test('operational fields (incharge) on existing active section are preserved', async () => {
    const { mockQuery, mockBatch } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [{ id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', tenantId, deleted: false, incharge: 'teacher-1', customField: 'op' }) }],
    });

    const structure = [{ classGrade: '10', sectionName: 'A', subjects: { core: ['History'], electives: [] } }];
    const created = await repo.createMissingSections(tenantId, structure, 'user-1');
    expect(created).toBe(0);
    expect(mockBatch.set).not.toHaveBeenCalled();
  });

  test('existing subjects are preserved on re-provisioning (no overwrite)', async () => {
    const { mockQuery, mockBatch } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [{ id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', tenantId, deleted: false, subjects: { core: ['Physics'], electives: ['Art'] } }) }],
    });

    const structure = [{ classGrade: '10', sectionName: 'A', subjects: { core: ['Math'], electives: [] } }];
    const created = await repo.createMissingSections(tenantId, structure, 'user-1');
    expect(created).toBe(0);
    expect(mockBatch.set).not.toHaveBeenCalled();
  });

  test('new section is created with normalized deterministic doc id', async () => {
    const { mockQuery, mockBatch, mockCollection } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({ docs: [] });
    mockCollection.doc.mockReturnValue({ id: 'det', set: jest.fn().mockResolvedValue(undefined) });

    const structure = [{ classGrade: ' 10 ', sectionName: 'A ', subjects: { core: ['Math'], electives: [] } }];
    await repo.createMissingSections(tenantId, structure, 'user-1');
    expect(mockCollection.doc).toHaveBeenCalledWith(`${tenantId}__10__a`);
  });

  test('tenant isolation: query is scoped to the supplied tenantId', async () => {
    const { mockQuery, mockCollection } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({ docs: [] });

    await repo.createMissingSections('tenant-A', [{ classGrade: '10', sectionName: 'A' }], 'user-1');
    expect(mockCollection.where).toHaveBeenCalledWith('tenantId', '==', 'tenant-A');
  });

  test('findAllIncludingDeleted returns deleted sections while findAllActive excludes them', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ classGrade: '10', sectionName: 'A', tenantId, deleted: false }) },
        { id: 's2', data: () => ({ classGrade: '10', sectionName: 'B', tenantId, deleted: true }) },
      ],
    });

    const all = await repo.findAllIncludingDeleted(tenantId);
    const active = await repo.findAllActive(tenantId);
    expect(all).toHaveLength(2);
    expect(active).toHaveLength(1);
    expect(active[0].sectionName).toBe('A');
  });
});
