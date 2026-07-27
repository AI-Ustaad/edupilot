import { BaseRepository } from "./base.repository";
import { TenantBranding } from "@/types/tenant-branding";
import type { ITenantBrandingRepository } from "@/interfaces/ITenantBrandingRepository";

export class TenantBrandingRepository extends BaseRepository<TenantBranding> implements ITenantBrandingRepository {
  constructor() {
    super("tenantBranding");   // collection name
  }
}
