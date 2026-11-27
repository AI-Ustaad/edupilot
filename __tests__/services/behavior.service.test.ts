// B14 (N15) — BehaviorService idempotency: one click must create exactly one
// behavior log, one points update and one audit entry, even if the submit is
// retried with the same idempotency key.
import { BehaviorService } from '@/services/behavior.service';

const mockStudentRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};
const mockAuditLog = jest.fn();

jest.mock('@/lib/firebase-admin', () => {
  const { createFirestoreTestFactory } = require('@/__tests__/utils/firestore-mock');
  return createFirestoreTestFactory();
});
jest.mock('@/repositories/student.repository', () => ({
  StudentRepository: jest.fn(() => mockStudentRepo),
}));
jest.mock('@/services/AuditService', () => ({
  AuditService: jest.fn(() => ({ log: mockAuditLog })),
}));
// NOTE: the factories below must not reference the mock fns directly —
// jest.mock factories run while this file's imports load (before the consts
// above are initialised), so the fns are created inside the factory and
// grabbed via require() after imports instead.
jest.mock('@/lib/cache', () => ({ invalidateCache: jest.fn() }));
jest.mock('@/lib/events', () => ({ eventBus: { publish: jest.fn() } }));

const mockPublish = (require('@/lib/events') as any).eventBus.publish as jest.Mock;
const mockInvalidateCache = (require('@/lib/cache') as any).invalidateCache as jest.Mock;

describe('BehaviorService.recordBehavior — B14 (N15) idempotency', () => {
  const tenantId = 'test-tenant';
  const userId = 'teacher-1';
  let repo: any;
  let service: BehaviorService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStudentRepo.findById.mockResolvedValue({ id: 'student-1', behaviorPoints: 2 });
    mockStudentRepo.update.mockResolvedValue(undefined);
    mockAuditLog.mockResolvedValue(undefined);
    mockPublish.mockResolvedValue(undefined);
    mockInvalidateCache.mockResolvedValue(undefined);
    repo = {
      create: jest.fn().mockResolvedValue('log-1'),
      findByIdempotencyKey: jest.fn().mockResolvedValue(null),
    };
    service = new BehaviorService(repo);
  });

  test('records once on the first submit with a new key', async () => {
    const result = await service.recordBehavior(
      { studentId: 'student-1', points: 1, reason: 'Helped a classmate', idempotencyKey: 'key-1' },
      tenantId,
      userId,
    );

    expect(result).toEqual({ success: true });
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'student-1', points: 1, idempotencyKey: 'key-1' }),
      tenantId,
    );
    expect(mockStudentRepo.update).toHaveBeenCalledWith('student-1', { behaviorPoints: 3 }, tenantId);
    expect(mockAuditLog).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledTimes(1);
  });

  test('a retry with the same key creates nothing and touches nothing', async () => {
    repo.findByIdempotencyKey.mockResolvedValue({
      id: 'log-1',
      studentId: 'student-1',
      idempotencyKey: 'key-1',
    });

    const result = await service.recordBehavior(
      { studentId: 'student-1', points: 1, reason: 'Helped a classmate', idempotencyKey: 'key-1' },
      tenantId,
      userId,
    );

    expect(result).toEqual({ success: true, duplicate: true });
    expect(repo.create).not.toHaveBeenCalled();
    expect(mockStudentRepo.update).not.toHaveBeenCalled();
    expect(mockAuditLog).not.toHaveBeenCalled();
    expect(mockPublish).not.toHaveBeenCalled();
  });

  test('a submit without a key still records (backwards compatible)', async () => {
    const result = await service.recordBehavior(
      { studentId: 'student-1', points: -1, reason: 'Late' },
      tenantId,
      userId,
    );

    expect(result).toEqual({ success: true });
    expect(repo.findByIdempotencyKey).not.toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledTimes(1);
  });

  test('throws when the student does not belong to the tenant', async () => {
    mockStudentRepo.findById.mockResolvedValue(null);

    await expect(
      service.recordBehavior({ studentId: 'student-1', points: 1, reason: 'x' }, tenantId, userId),
    ).rejects.toThrow('not found');
    expect(repo.create).not.toHaveBeenCalled();
  });
});
