// B11 (26 Nov audit) — SyllabusService.createSyllabus: Add Material must
// persist the material and write a syllabus.created audit entry. Before this
// fix there was no create path at all (no POST route, no service method), so
// the client POST 405'd and the page silently did nothing: form stayed
// filled, no toast, no audit entry, nothing in the list.
import { SyllabusService } from '@/services/syllabus.service';

const mockAuditLog = jest.fn();

jest.mock('@/services/AuditService', () => ({
  AuditService: jest.fn(() => ({ log: mockAuditLog })),
}));

describe('SyllabusService.createSyllabus — B11', () => {
  const tenantId = 'test-tenant';
  const userId = 'admin-1';
  let repo: any;
  let service: SyllabusService;

  const valid = {
    classGrade: 'Class 1',
    subject: 'English',
    title: 'TEST — Syllabus Material',
    description: '',
    type: 'pdf',
    fileUrl: 'https://example.com/test.pdf',
    linkUrl: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuditLog.mockResolvedValue(undefined);
    repo = {
      create: jest.fn().mockResolvedValue('syllabus-1'),
      findById: jest.fn().mockResolvedValue({ id: 'syllabus-1', ...valid, tenantId }),
    };
    service = new SyllabusService(repo);
  });

  test('persists the material and logs syllabus.created', async () => {
    const record = await service.createSyllabus(valid, tenantId, userId);

    expect(record.id).toBe('syllabus-1');
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'TEST — Syllabus Material',
        classGrade: 'Class 1',
        subject: 'English',
        type: 'pdf',
        fileUrl: 'https://example.com/test.pdf',
        createdBy: userId,
        deleted: false,
      }),
      tenantId
    );
    expect(mockAuditLog).toHaveBeenCalledTimes(1);
    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'syllabus.created',
        userId,
        tenantId,
        entityId: 'syllabus-1',
        entityType: 'syllabus',
      })
    );
  });

  test('rejects a missing title and saves nothing', async () => {
    await expect(
      service.createSyllabus({ ...valid, title: '' }, tenantId, userId)
    ).rejects.toThrow('Validation failed');
    expect(repo.create).not.toHaveBeenCalled();
    expect(mockAuditLog).not.toHaveBeenCalled();
  });

  test('requires a file URL for pdf materials', async () => {
    await expect(
      service.createSyllabus({ ...valid, fileUrl: '' }, tenantId, userId)
    ).rejects.toThrow('Validation failed');
    expect(repo.create).not.toHaveBeenCalled();
  });

  test('requires a link URL for link materials', async () => {
    await expect(
      service.createSyllabus(
        { ...valid, type: 'link', fileUrl: '', linkUrl: '' },
        tenantId,
        userId
      )
    ).rejects.toThrow('Validation failed');
    expect(repo.create).not.toHaveBeenCalled();
  });

  test('accepts a link material with a link URL', async () => {
    const record = await service.createSyllabus(
      { ...valid, type: 'link', fileUrl: '', linkUrl: 'https://example.com/page' },
      tenantId,
      userId
    );

    expect(record.id).toBe('syllabus-1');
    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'syllabus.created' })
    );
  });
});
