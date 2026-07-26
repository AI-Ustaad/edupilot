# Business Rules

**Document ID**: EDU-BR-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Tenant Isolation

| Rule | Implementation | Evidence |
|------|----------------|----------|
| All queries must filter by tenantId | Repository pattern enforces tenantId parameter | EDUPILOT_MASTER_FACTS.md |
| No cross-tenant data access | withTenant middleware validates tenant | EDUPILOT_SECURITY_CATALOG.md |
| Tenant-scoped caching | Redis keys prefixed with tenantId | EDUPILOT_MASTER_FACTS.md |

## 2. Subscription Enforcement

| Rule | Implementation | Evidence |
|------|----------------|----------|
| Max students enforced | StudentService checks limit before create | EDUPILOT_SAAS_CATALOG.md |
| Max staff enforced | StaffService checks limit before create | EDUPILOT_SAAS_CATALOG.md |
| Feature flags per plan | FeatureFlagService validates plan | EDUPILOT_SAAS_CATALOG.md |
| 4 plans: Free, Starter, Professional, Enterprise | lib/config/subscription-plans.ts | EDUPILOT_SAAS_CATALOG.md |

## 3. RBAC Rules

| Rule | Implementation | Evidence |
|------|----------------|----------|
| 5 roles defined | SUPER_ADMIN, ADMIN, TEACHER, PARENT, STUDENT | EDUPILOT_SECURITY_CATALOG.md |
| Granular permissions | 100+ permissions in registry | EDUPILOT_SECURITY_CATALOG.md |
| Permission pattern | {domain}.{action} | EDUPILOT_SECURITY_CATALOG.md |
| Route protection | withAuth + withPermission middleware | EDUPILOT_API_CATALOG.md |

## 4. Data Integrity

| Rule | Implementation | Evidence |
|------|----------------|----------|
| All mutations audited | AuditService.logCreate/Update/Delete | EDUPILOT_MASTER_FACTS.md |
| Validation at entry | Zod schemas in DTOs | EDUPILOT_MASTER_FACTS.md |
| Error consistency | AppError hierarchy | EDUPILOT_MASTER_FACTS.md |
| Response format | createSuccessResponse/createErrorResponse | EDUPILOT_MASTER_FACTS.md |

