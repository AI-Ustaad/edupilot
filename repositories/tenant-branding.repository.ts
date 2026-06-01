import { BaseRepository } from "./base.repository";
import { TenantBranding } from "@/types/tenant-branding";

export class TenantBrandingRepository extends BaseRepository<TenantBranding> {
  constructor() {
    super("tenantBranding");   // collection name
  }
}
