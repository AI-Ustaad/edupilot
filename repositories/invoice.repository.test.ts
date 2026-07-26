import { InvoiceRepository } from '@/repositories/invoice.repository';

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
    add: jest.fn().mockResolvedValue({ id: 'invoice-123' }),
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

describe('InvoiceRepository', () => {
  let repo: InvoiceRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new InvoiceRepository();
  });

  test('should find invoices by tenant', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'inv1', data: () => ({ tenantId, amount: 100, status: 'sent' }) },
        { id: 'inv2', data: () => ({ tenantId, amount: 50, status: 'paid' }) },
      ],
    });

    const invoices = await repo.findByTenant(tenantId);
    expect(invoices).toHaveLength(2);
  });

  test('should mark invoice as paid', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'inv1',
      data: () => ({ tenantId, status: 'sent' }),
    });

    await repo.markAsPaid('inv1', tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'paid' })
    );
  });

  test('should find invoice by id', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'inv1',
      data: () => ({ tenantId, amount: 100 }),
    });

    const invoice = await repo.findById('inv1', tenantId);
    expect(invoice).not.toBeNull();
    expect(invoice!.amount).toBe(100);
  });

  test('should return null for non-existent invoice', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const invoice = await repo.findById('nonexistent', tenantId);
    expect(invoice).toBeNull();
  });

  test('should update an invoice', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'inv1',
      data: () => ({ tenantId, amount: 100 }),
    });

    await repo.update('inv1', { amount: 150 }, tenantId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 150 })
    );
  });

  test('should delete an invoice', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'inv1',
      data: () => ({ tenantId }),
    });

    await repo.delete('inv1', tenantId);
    expect(mockDocRef.delete).toHaveBeenCalled();
  });

  test('should throw when updating unauthorized tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: 'inv1',
      data: () => ({ tenantId: 'other-tenant' }),
    });

    await expect(
      repo.update('inv1', { amount: 150 }, tenantId)
    ).rejects.toThrow('Document not found or unauthorized');
  });

  test('should find all invoices', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'inv1', data: () => ({ tenantId }) },
      ],
    });

    const invoices = await repo.findAll(tenantId);
    expect(invoices).toHaveLength(1);
  });

  test('should paginate invoices', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    const mockCountSnap = { data: () => ({ count: 5 }) };
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCountSnap),
    });
    mockQuery.get.mockResolvedValue({
      docs: [
        { id: 'inv1', data: () => ({ tenantId }) },
        { id: 'inv2', data: () => ({ tenantId }) },
        { id: 'inv3', data: () => ({ tenantId }) },
      ],
    });

    const result = await repo.paginate(tenantId, 1, 3);
    expect(result.data).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  test('should count invoices', async () => {
    const { mockQuery } = require('@/lib/firebase-admin');
    mockQuery.count.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 12 }) }),
    });

    const count = await repo.count(tenantId);
    expect(count).toBe(12);
  });

  test('should check existence', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      data: () => ({ tenantId }),
    });

    const exists = await repo.exists('inv1', tenantId);
    expect(exists).toBe(true);
  });
});