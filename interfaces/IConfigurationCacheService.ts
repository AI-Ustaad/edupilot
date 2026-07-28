export interface IConfigurationCacheService {
  getConfiguration(tenantId: string): Promise<any | null>;
  setConfiguration(tenantId: string, configuration: any, ttl?: number): Promise<void>;
  invalidateConfiguration(tenantId: string): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
  getStats(): { hits: number; misses: number; size: number };
}
