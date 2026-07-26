import { MenuRepository } from '@/repositories/menu.repository';

jest.mock('@/lib/firebase-admin', () => {
  const mockDocRef = {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    id: 'mock-doc-id',
  };
  const mockQuery = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [] }),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }),
    }),
  };
  const mockCollection = {
    add: jest.fn().mockResolvedValue({ id: 'menu-123' }),
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

describe('MenuRepository', () => {
  let repo: MenuRepository;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new MenuRepository();
  });

  test('should find menu by tenant', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ items: [{ name: 'Item 1' }, { name: 'Item 2' }] }),
    });

    const menu = await repo.findByTenant(tenantId);
    expect(menu).toHaveLength(2);
    expect(menu[0].name).toBe('Item 1');
  });

  test('should return empty array for non-existent menu', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({ exists: false, data: () => null });

    const menu = await repo.findByTenant(tenantId);
    expect(menu).toEqual([]);
  });

  test('should get menu via getMenu', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ items: [{ name: 'Item 1' }] }),
    });

    const menu = await repo.getMenu(tenantId);
    expect(menu).toHaveLength(1);
  });

  test('should save menu', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ items: [{ name: 'Old Item' }] }),
    });

    const menuItems = [{ name: 'New Item' }];
    await repo.save(tenantId, menuItems);
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ items: [{ name: 'New Item' }] }),
      { merge: true }
    );
  });

  test('should save menu via saveMenu', async () => {
    const { mockDocRef } = require('@/lib/firebase-admin');
    mockDocRef.get.mockResolvedValue({
      exists: true,
      id: tenantId,
      data: () => ({ items: [{ name: 'Old Item' }] }),
    });

    const menuItems = [{ name: 'New Menu' }];
    await repo.saveMenu(tenantId, menuItems);
    expect(mockDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({ items: [{ name: 'New Menu' }] }),
      { merge: true }
    );
  });
});