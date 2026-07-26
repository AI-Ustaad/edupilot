// services/AuditService.ts
import { AuditRepository } from "@/repositories/audit.repository";
import { logger } from "@/lib/logger/logger";

export interface AuditLogEntry {
  action: string;
  userId: string;
  tenantId: string;
  entityId?: string;
  entityType?: string;
  metadata?: any;
}

export class AuditService {
  private auditRepo = new AuditRepository();

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.auditRepo.create(entry, entry.tenantId);
    } catch (err) {
      logger.error("[AuditService] Failed to write audit log:", { metadata: { error: err } });
    }
  }

  async queryByTenant(
    tenantId: string,
    options?: { limit?: number; action?: string; entityType?: string }
  ) {
    try {
      return await this.auditRepo.findByTenant(tenantId, options);
    } catch (err) {
      logger.error("[AuditService] Failed to query audit logs:", { metadata: { error: err } });
      return [];
    }
  }
}
