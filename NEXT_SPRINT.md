# Next Sprint: Sprint 6 — Service Layer Enforcement

**Generated:** 2026-07-28
**Based on:** ENGINEERING_BASELINE_VERIFICATION.md, SPRINT_REPORT.md (Sprint 5)

---

## Sprint Overview

**Sprint:** 6
**Name:** Service Layer Enforcement
**Priority:** P0
**Duration:** 5 days
**Risk:** MEDIUM

---

## Objectives

1. Ensure all API routes communicate ONLY with services
2. Move `adminDb` calls from services to repositories
3. Reduce route bypass count from 16 to 0
4. Reduce service adminDb count from 2 to 0

---

## Scope

### In Scope

1. **16 Routes Bypassing Services**
   - Create services or justify exceptions for routes importing repositories directly
   - Routes listed in ENGINEERING_BASELINE_VERIFICATION.md V2

2. **2 Services Using adminDb Directly**
   - `services/tenant.resolver.ts` — move adminDb calls to `TenantRepository`
   - `services/configuration-health.service.ts` — move adminDb calls to `ConfigurationRepository`

3. **15 Routes Importing Neither Services Nor Repositories**
   - Evaluate each route for service layer integration
   - Some may be legitimate exceptions (AI agents, cron jobs, auth utilities)

### Out of Scope

- Barrel export completion (Sprint 7)
- Interface coverage completion (Sprint 8)
- Test infrastructure repair (Sprint 10)
- Feature development

---

## Affected Files

### Routes Bypassing Services (16 files)

1. `app/api/v1/academic-year/[id]/route.ts`
2. `app/api/v1/academic-year/route.ts`
3. `app/api/v1/addons/route.ts`
4. `app/api/v1/admin/users/route.ts`
5. `app/api/v1/admit-cards/bulk/route.ts`
6. `app/api/v1/certificate/route.ts`
7. `app/api/v1/chat/route.ts`
8. `app/api/v1/cron/fee-reminder/route.ts`
9. `app/api/v1/jobs/[jobId]/route.ts`
10. `app/api/v1/leave/arrange/route.ts`
11. `app/api/v1/leave/route.ts`
12. `app/api/v1/ledger/route.ts`
13. `app/api/v1/reports/generate/route.tsx`
14. `app/api/v1/settings/general/route.ts`
15. `app/api/v1/syllabus/[id]/route.ts`
16. `app/api/v1/syllabus/route.ts`

### Services Using adminDb (2 files)

1. `services/tenant.resolver.ts`
2. `services/configuration-health.service.ts`

### Repositories to Update (2 files)

1. `repositories/tenant.repository.ts` — add methods for tenant.resolver.ts
2. `repositories/configuration.repository.ts` — add methods for configuration-health.service.ts

### Potential New Services (if needed)

- `services/academic-year.service.ts` (if not exists)
- `services/addons.service.ts` (if not exists)
- `services/admit-card.service.ts` (if not exists)
- `services/certificate.service.ts` (if not exists)
- `services/chat.service.ts` (if not exists)
- `services/job.service.ts` (already exists)
- `services/leave.service.ts` (if not exists)
- `services/ledger.service.ts` (if not exists)
- `services/report.service.ts` (already exists)
- `services/settings.service.ts` (if not exists)
- `services/syllabus.service.ts` (if not exists)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing route behavior | MEDIUM | HIGH | Review each route's logic before wrapping in service |
| Missing service for niche operations | LOW | MEDIUM | Some routes may legitimately bypass (cron, AI) — document exceptions |
| Repository method gaps | MEDIUM | MEDIUM | Verify repository methods before moving adminDb calls |
| Test failures | MEDIUM | LOW | Existing tests should not be affected |

---

## Verification Strategy

1. **Before implementation:** Document current behavior of each bypass route
2. **During implementation:** Verify each route imports a service after changes
3. **After implementation:**
   - `npm run lint` passes
   - `npm run type-check` passes
   - `npm run build` passes
   - `npm test` passes (no regressions)
   - `grep -r "adminDb" services/` returns 0 results
   - `grep -r "from \"@/repositories\"" app/api/v1/` filtered to routes without `from "@/services"` returns 0 results

---

## Definition of Done

- [ ] Zero routes import repositories without also importing services
- [ ] Zero services import adminDb directly
- [ ] All verification commands pass
- [ ] No test regressions
- [ ] Architecture score improved from 68/100 to ≥75/100

---

## Dependencies

- Sprint 5: Validation Consolidation (COMPLETED)
- Sprint 0-4: Build Stabilization & Architecture Remediation (COMPLETED)

---

## Estimated Effort

- Route bypass fixes: 3 days
- adminDb migration: 1 day
- Testing and verification: 1 day
- **Total:** 5 days

---

## Notes

Some routes may legitimately bypass the service layer:
- **Cron jobs** (`cron/fee-reminder`) — may use repositories directly for batch operations
- **AI agents** (`ai/agents`, `ai/chatbot`) — use `lib/ai/agents/AgentRegistry`
- **Auth utilities** (`auth/logout`, `auth/me`) — use `route-helpers`
- **Stripe webhooks** (`stripe/create-checkout`) — use `lib/stripe`

These should be documented as architectural exceptions, not violations.
