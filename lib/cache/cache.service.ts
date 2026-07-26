// lib/cache/cache.service.ts
import { ICacheProvider, CacheOptions } from "./cache";
import { MemoryCacheProvider } from "./memory-cache";

export class CacheService {
  private provider: ICacheProvider;
  private static instance: CacheService;

  private constructor(provider: ICacheProvider) {
    this.provider = provider;
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(new MemoryCacheProvider());
    }
    return CacheService.instance;
  }

  async get<T = any>(key: string): Promise<T | null> {
    return this.provider.get<T>(key);
  }

  async set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void> {
    return this.provider.set(key, value, options);
  }

  async delete(key: string): Promise<void> {
    return this.provider.delete(key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    return this.provider.invalidateByTag(tag);
  }

  async invalidateByTenant(tenantId: string): Promise<void> {
    return this.provider.invalidateByTenant(tenantId);
  }

  async clear(): Promise<void> {
    return this.provider.clear();
  }

  getStats() {
    return this.provider.getStats();
  }
}

export const cacheService = CacheService.getInstance();
