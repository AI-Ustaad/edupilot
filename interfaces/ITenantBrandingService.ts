// interfaces/ITenantBrandingService.ts
export interface TenantBranding {
  id?: string;
  tenantId: string;
  schoolName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  updatedAt?: any;
}

export interface ITenantBrandingService {
  getBranding(tenantId: string): Promise<TenantBranding | null>;
  saveBranding(tenantId: string, data: Partial<TenantBranding>): Promise<void>;
}
