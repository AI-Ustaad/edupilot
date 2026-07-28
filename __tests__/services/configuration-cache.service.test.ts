import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { ConfigurationCacheService } from "@/services/configuration-cache.service";

const mockMemoryCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  invalidateByTag: jest.fn(),
  invalidateByTenant: jest.fn(),
  getStats: jest.fn().mockReturnValue({ hits: 0, misses: 0, size: 0 }),
};

jest.mock('@/lib/cache/memory-cache');

jest.mock('@/lib/logger/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const { MemoryCacheProvider } = require('@/lib/cache/memory-cache');

describe('ConfigurationCacheService', () => {
  let cacheService: ConfigurationCacheService;
  let mockProvider: ReturnType<typeof MemoryCacheProvider>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProvider = new MemoryCacheProvider();
    cacheService = new ConfigurationCacheService(mockProvider);
  });

  test('should get cached configuration', async () => {
    mockProvider.get = jest.fn().mockResolvedValue({ schoolName: 'Test School' });

    const result = await cacheService.getConfiguration('tenant_1');

    expect(result).toEqual({ schoolName: 'Test School' });
    expect(mockProvider.get).toHaveBeenCalledWith('configuration:tenant_1');
  });

  test('should set configuration in cache', async () => {
    mockProvider.set = jest.fn().mockResolvedValue(undefined);

    await cacheService.setConfiguration('tenant_1', { schoolName: 'Test School' } as any, 600);

    expect(mockProvider.set).toHaveBeenCalledWith('configuration:tenant_1', { schoolName: 'Test School' }, {
      ttl: 600,
      tags: ['configuration'],
      tenantId: 'tenant_1',
    });
  });

  test('should invalidate configuration', async () => {
    mockProvider.delete = jest.fn().mockResolvedValue(undefined);
    mockProvider.invalidateByTenant = jest.fn().mockResolvedValue(undefined);

    await cacheService.invalidateConfiguration('tenant_1');

    expect(mockProvider.delete).toHaveBeenCalledWith('configuration:tenant_1');
    expect(mockProvider.invalidateByTenant).toHaveBeenCalledWith('tenant_1');
  });

  test('should invalidate by tag', async () => {
    mockProvider.invalidateByTag = jest.fn().mockResolvedValue(undefined);

    await cacheService.invalidateByTag('configuration');

    expect(mockProvider.invalidateByTag).toHaveBeenCalledWith('configuration');
  });

  test('should return cache stats', () => {
    mockProvider.getStats = jest.fn().mockReturnValue({ hits: 1, misses: 0, size: 1 });

    const stats = cacheService.getStats();

    expect(stats).toEqual({ hits: 1, misses: 0, size: 1 });
  });
});
