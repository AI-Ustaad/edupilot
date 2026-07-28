# Next Sprint: Sprint 7 — Barrel Export Completion

**Generated:** 2026-07-28
**Based on:** ENGINEERING_BASELINE_VERIFICATION.md, SPRINT_REPORT.md (Sprint 6)

---

## Sprint Overview

**Sprint:** 7
**Name:** Barrel Export Completion
**Priority:** P1
**Duration:** 5 days
**Risk:** LOW

---

## Objectives

1. Complete `services/index.ts` barrel export (6/53 → 100%)
2. Complete `repositories/index.ts` barrel export (12/43 → 100%)
3. Complete `types/index.ts` barrel export (2/35 → 100%)
4. Create `entities/index.ts` barrel export (0/5 → 100%)
5. Document 15 exception routes that bypass service layer

---

## Scope

### In Scope

1. **services/index.ts** — Add exports for all 53 service files
2. **repositories/index.ts** — Replace object-literal pattern with standard barrel exports
3. **types/index.ts** — Add exports for all 35 type files
4. **entities/index.ts** — Create barrel export for 5 entity files
5. **Exception documentation** — Document the 15 routes that legitimately bypass services

### Out of Scope

- Service layer enforcement (Sprint 6 — COMPLETED)
- Validation consolidation (Sprint 5 — COMPLETED)
- Interface coverage completion (Sprint 8)
- Test infrastructure repair (Sprint 10)
- Feature development

---

## Affected Files

| File | Action |
|------|--------|
| `services/index.ts` | Add 47 missing exports |
| `repositories/index.ts` | Replace object-literal with standard barrel |
| `types/index.ts` | Add 33 missing exports |
| `entities/index.ts` | Create new file with 5 exports |
| `ARCHITECTURE_EXCEPTIONS.md` | Create new file documenting 15 exception routes |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Circular dependency introduction | LOW | MEDIUM | Verify import graph after barrel changes |
| Breaking existing imports | LOW | LOW | Barrel exports are additive |
| Incomplete export coverage | LOW | LOW | Automated verification script |

---

## Verification Strategy

1. **Before implementation:** Audit all files in each directory
2. **During implementation:** Verify each barrel file exports all public APIs
3. **After implementation:**
   - `npm run lint` passes
   - `npm run type-check` passes
   - `npm run build` passes
   - No circular dependencies in import graph

---

## Definition of Done

- [ ] `services/index.ts` exports 100% of service files
- [ ] `repositories/index.ts` exports 100% of repository files
- [ ] `types/index.ts` exports 100% of type files
- [ ] `entities/index.ts` exports 100% of entity files
- [ ] 15 exception routes documented
- [ ] All verification commands pass

---

## Dependencies

- Sprint 6: Service Layer Enforcement (COMPLETED)
- Sprint 5: Validation Consolidation (COMPLETED)

---

## Estimated Effort

- services/index.ts: 2 days
- repositories/index.ts: 1 day
- types/index.ts: 1 day
- entities/index.ts: 0.5 days
- Exception documentation: 0.5 days
- **Total:** 5 days

---

## Notes

Barrel exports improve developer experience by allowing imports like:
```ts
import { StudentService } from "@/services";
import { StudentRepository } from "@/repositories";
```

Instead of:
```ts
import { StudentService } from "@/services/StudentService";
import { StudentRepository } from "@/repositories/student.repository";
```
