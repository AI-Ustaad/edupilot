import { MemoryCacheProvider } from "@/lib/cache/memory-cache";
import { ICacheProvider, CacheEntry, CacheOptions } from "@/lib/cache/cache";
import { logger } from "@/lib/logger/logger";
import type { IConfigurationCacheService } from "@/interfaces/IConfigurationCacheService";

export class ConfigurationCacheService implements IConfigurationCacheService {
  private readonly memoryCache: ICacheProvider;
  private readonly CACHE_TAG = "configuration";

  constructor(memoryCache?: ICacheProvider) {
    this.memoryCache = memoryCache || new MemoryCacheProvider();
  }

  async getConfiguration(tenantId: string): Promise<any | null> {
    const cacheKey = this.getCacheKey(tenantId);

    try {
      const cached = await this.memoryCache.get<any>(cacheKey);
      if (cached) {
        logger.info("CONFIGURATION_CACHE_HIT", { tenantId });
        return cached;
      }

      logger.info("CONFIGURATION_CACHE_MISS", { tenantId });
      return null;
    } catch (error) {
      logger.error("CONFIGURATION_CACHE_ERROR", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
      return null;
    }
  }

  async setConfiguration(tenantId: string, configuration: any, ttl?: number): Promise<void> {
    const cacheKey = this.getCacheKey(tenantId);
    try {
      await this.memoryCache.set(cacheKey, configuration, {
        ttl: ttl || 300,
        tags: [this.CACHE_TAG],
        tenantId,
      });
      logger.info("CONFIGURATION_CACHE_SET", { tenantId, ttl: ttl || 300 });
    } catch (error) {
      logger.error("CONFIGURATION_CACHE_SET_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  async invalidateConfiguration(tenantId: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(tenantId);
      await this.memoryCache.delete(cacheKey);
      await this.memoryCache.invalidateByTenant(tenantId);
      logger.info("CONFIGURATION_CACHE_INVALIDATED", { tenantId });
    } catch (error) {
      logger.error("CONFIGURATION_CACHE_INVALIDATION_FAILED", {
        metadata: { tenantId, error: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      await this.memoryCache.invalidateByTag(tag);
      logger.info("CONFIGURATION_CACHE_TAG_INVALIDATED", { tag });
    } catch (error) {
      logger.error("CONFIGURATION_CACHE_TAG_INVALIDATION_FAILED", {
        metadata: { tag, error: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  getStats(): { hits: number; misses: number; size: number } {
    if (this.memoryCache && typeof this.memoryCache.getStats === "function") {
      return this.memoryCache.getStats();
    }
    return { hits: 0, misses: 0, size: 0 };
  }

  private getCacheKey(tenantId: string): string {
    return `configuration:${tenantId}`;
  }
}

export const configurationCacheService = new ConfigurationCacheService();
