// lib/cache/memory-cache.ts
import { ICacheProvider, CacheEntry, CacheOptions } from "./cache";

export class MemoryCacheProvider implements ICacheProvider {
  private cache = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.value as T;
  }

  async set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || 300;
    const expiresAt = new Date(Date.now() + ttl * 1000);
    
    this.cache.set(key, {
      value,
      expiresAt,
      tags: options?.tags || [],
      tenantId: options?.tenantId,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  async invalidateByTenant(tenantId: string): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tenantId === tenantId) {
        this.cache.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
    };
  }
}
