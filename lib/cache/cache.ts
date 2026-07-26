// lib/cache/cache.ts
export interface CacheOptions {
  ttl?: number; // seconds
  tags?: string[];
  tenantId?: string;
}

export interface CacheEntry<T = any> {
  value: T;
  expiresAt: Date;
  tags: string[];
  tenantId?: string;
}

export interface ICacheProvider {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
  invalidateByTenant(tenantId: string): Promise<void>;
  clear(): Promise<void>;
  getStats(): { hits: number; misses: number; size: number };
}

export async function getOrSet<T = any>(
  key: string,
  factory: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  const cacheService = (await import("./cache.service")).cacheService;
  const cached = await cacheService.get<T>(key);
  if (cached !== null) {
    return cached;
  }
  const value = await factory();
  await cacheService.set(key, value, options);
  return value;
}

export async function invalidateCache(key: string): Promise<void> {
  const cacheService = (await import("./cache.service")).cacheService;
  await cacheService.delete(key);
}
