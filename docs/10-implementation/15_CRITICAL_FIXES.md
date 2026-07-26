# Critical Fixes

**Date**: 2026-07-26T11:08:50.570503  
**Status**: Final  
**Owner**: CTO Office

---

## CRITICAL Severity (Fix Immediately)

| Fix | Location | Risk | Effort | Sprint | Verification |
| --- | --- | --- | --- | --- | --- |
| Add auth to curriculum/engine | app/api/v1/curriculum/engine/route.ts | Data breach | 2 SP | 1 | Integration test |
| Add auth to education/rules | app/api/v1/education/rules/route.ts | Data breach | 2 SP | 1 | Integration test |

## HIGH Severity (Fix in Sprint 1-2)

| Fix | Location | Risk | Effort | Sprint | Verification |
| --- | --- | --- | --- | --- | --- |
| Fix role escalation | auth/register-user/route.ts | Privilege escalation | 3 SP | 1 | ✅ FIXED |
| Remove hardcoded CRON_SECRET | jobs/attendance-report/route.ts | Secret exposure | 1 SP | 1 | ✅ FIXED |
| Migrate 14 adminDb routes | Multiple routes | Tenant bypass | 8 SP | 1-2 | Integration test |
| Migrate 6 adminDb services | Multiple services | Tenant bypass | 6 SP | 2 | Unit test |
| Fix ~30 service bypass routes | Multiple routes | Business logic bypass | 10 SP | 2-3 | Architecture test |

## MEDIUM Severity (Fix in Sprint 1)

| Fix | Location | Risk | Effort | Sprint | Verification |
| --- | --- | --- | --- | --- | --- |
| Remove dead BaseService | services/base.service.ts | Maintenance burden | 1 SP | 1 | ✅ FIXED |
| Remove dead IOCRService | interfaces/IOCRService.ts | Dead interface | 1 SP | 1 | ✅ FIXED |

## Fix Implementation Order

1. CRITICAL: Auth bypasses (Sprint 1, Week 1)
2. HIGH: Hardcoded secrets (Sprint 1, Week 1)
3. MEDIUM: Dead code removal (Sprint 1, Week 1)
4. HIGH: adminDb routes (Sprint 1-2)
5. HIGH: adminDb services (Sprint 2)
6. HIGH: Service bypass routes (Sprint 2-3)

