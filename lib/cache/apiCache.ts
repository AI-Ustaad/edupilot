// lib/cache/apiCache.ts
interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

class ApiCache {
  private store = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  // Generate cache key from request
  generateKey(req: Request, extra?: string): string {
    const url = new URL(req.url);
    return `${req.method}:${url.pathname}${extra ? `:${extra}` : ''}`;
  }
}

export const apiCache = new ApiCache();
