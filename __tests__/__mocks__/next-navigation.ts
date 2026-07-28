import { ConfigurationCacheService } from "@/services/configuration-cache.service";

jest.mock('@/lib/cache/memory-cache', () => ({
  MemoryCacheProvider: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    invalidateByTag: jest.fn(),
    invalidateByTenant: jest.fn(),
    getStats: jest.fn().mockReturnValue({ hits: 0, misses: 0, size: 0 }),
  })),
}));

const mockMemoryCache = require('@/lib/cache/memory-cache').MemoryCacheProvider;

describe('ConfigurationCacheService', () => {
  let cacheService: ConfigurationCacheService;
  let mockProvider: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProvider = new mockMemoryCache();
    cacheService = new ConfigurationCacheService(mockProvider);
  });

  describe('getConfiguration', () => {
    test('should return cached configuration on cache hit', async () => {
      const cachedData = { id: 'current', tenantId: 'test-tenant' };
      mockProvider.get.mockResolvedValue(cachedData);

      const result = await cacheService.getConfiguration('test-tenant');

      expect(result).toEqual(cachedData);
      expect(mockProvider.get).toHaveBeenCalledWith('configuration:test-tenant');
    });

    test('should return null when configuration is not cached', async () => {
      mockProvider.get.mockResolvedValue(null);

      const result = await cacheService.getConfiguration('test-tenant-new');

      expect(result).toBeNull();
      expect(mockProvider.get).toHaveBeenCalledWith('configuration:test-tenant-new');
    });

    test('should return null on cache error', async () => {
      mockProvider.get.mockRejectedValue(new Error('Cache error'));

      const result = await cacheService.getConfiguration('test-tenant');

      expect(result).toBeNull();
    });
  });

  describe('setConfiguration', () => {
    test('should store configuration in cache with default TTL', async () => {
      const config = { id: 'current', tenantId: 'test-tenant' };

      await cacheService.setConfiguration('test-tenant', config);

      expect(mockProvider.set).toHaveBeenCalledWith('configuration:test-tenant', config, {
        ttl: 300,
        tags: ['configuration'],
        tenantId: 'test-tenant',
      });
    });

    test('should store configuration with custom TTL', async () => {
      const config = { id: 'current', tenantId: 'test-tenant' };

      await cacheService.setConfiguration('test-tenant', config, 600);

      expect(mockProvider.set).toHaveBeenCalledWith('configuration:test-tenant', config, {
        ttl: 600,
        tags: ['configuration'],
        tenantId: 'test-tenant',
      });
    });
  });

  describe('invalidateConfiguration', () => {
    test('should delete cache key and invalidate tenant', async () => {
      await cacheService.invalidateConfiguration('test-tenant');

      expect(mockProvider.delete).toHaveBeenCalledWith('configuration:test-tenant');
      expect(mockProvider.invalidateByTenant).toHaveBeenCalledWith('test-tenant');
    });
  });

  describe('invalidateByTag', () => {
    test('should invalidate all cache entries with the given tag', async () => {
      await cacheService.invalidateByTag('configuration');

      expect(mockProvider.invalidateByTag).toHaveBeenCalledWith('configuration');
    });
  });

  describe('getStats', () => {
    test('should return cache statistics', () => {
      mockProvider.getStats.mockReturnValue({ hits: 10, misses: 5, size: 3 });

      const stats = cacheService.getStats();

      expect(stats).toEqual({ hits: 10, misses: 5, size: 3 });
    });
  });
});
