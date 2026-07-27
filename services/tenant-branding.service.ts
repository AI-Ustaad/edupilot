import { TenantBrandingRepository } from "@/repositories/tenant-branding.repository";
import { TenantBranding } from "@/types/tenant-branding";
import { getOrSet, invalidateCache } from "@/lib/cache";
import type { ITenantBrandingService } from "@/interfaces/ITenantBrandingService";

const CACHE_KEY = "branding";
const CACHE_TTL = 3600; // 1 گھنٹہ

export class TenantBrandingService implements ITenantBrandingService {
  constructor(private repo: TenantBrandingRepository) {}

  async getBranding(tenantId: string): Promise<TenantBranding | null> {
    return getOrSet(`${CACHE_KEY}:${tenantId}`, async () => {
      return this.repo.findById(tenantId, tenantId); // document id = tenantId
    }, { ttl: CACHE_TTL });
  }

  async saveBranding(tenantId: string, data: Partial<TenantBranding>): Promise<void> {
    // اگر پہلے سے موجود ہے تو اپ ڈیٹ، ورنہ بنائیں
    const existing = await this.repo.findById(tenantId, tenantId);
    if (existing) {
      await this.repo.update(tenantId, data, tenantId);
    } else {
      await this.repo.create({ ...data, tenantId } as any, tenantId);
    }
    await invalidateCache(`${CACHE_KEY}:${tenantId}`);
  }
}
