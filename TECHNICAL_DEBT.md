# Technical Debt Register

**Generated:** 2026-07-28
**Sprint:** 5 — Validation Consolidation

---

## Debt Summary

| Category | Items | Total Effort |
|----------|-------|--------------|
| P0 — Critical | 3 | 8 days |
| P1 — High | 4 | 12 days |
| P2 — Medium | 3 | 8 days |
| P3 — Low | 2 | 6 days |
| **Total** | **12** | **34 days** |

---

## P0 — Critical Debt

| # | Item | Impact | Effort | Sprint |
|---|------|--------|--------|--------|
| 1 | 16 routes bypass service layer | HIGH | 5 days | Sprint 6 |
| 2 | 2 services call adminDb directly | HIGH | 1 day | Sprint 6 |
| 3 | 15 routes import neither services nor repositories | MEDIUM | 3 days | Sprint 6 |

---

## P1 — High Debt

| # | Item | Impact | Effort | Sprint |
|---|------|--------|--------|--------|
| 4 | Barrel exports incomplete (services 15%) | HIGH | 2 days | Sprint 7 |
| 5 | Barrel exports incomplete (repositories 27.9%) | HIGH | 2 days | Sprint 7 |
| 6 | Barrel exports incomplete (types 5.7%) | HIGH | 1 day | Sprint 7 |
| 7 | 5 repositories lack interfaces | MEDIUM | 2 days | Sprint 8 |

---

## P2 — Medium Debt

| # | Item | Impact | Effort | Sprint |
|---|------|--------|--------|--------|
| 8 | 2 services lack interfaces | MEDIUM | 1 day | Sprint 8 |
| 9 | 16 repositories don't extend BaseRepository | MEDIUM | 3 days | Sprint 8 |
| 10 | 18 pre-existing test suite failures | LOW | 5 days | Sprint 10 |

---

## P3 — Low Debt

| # | Item | Impact | Effort | Sprint |
|---|------|--------|--------|--------|
| 11 | No entity barrel export | LOW | 1 day | Sprint 9 |
| 12 | No automated architecture tests | MEDIUM | 4 days | Sprint 11 |

---

## Debt Resolution History

| Sprint | Debt Resolved | Effort |
|--------|---------------|--------|
| Sprint 0 | Build failure (validators/student) | 1 day |
| Sprint 0 | TypeScript errors (18 test files) | 2 days |
| Sprint 0 | Missing type-check script | 0.5 days |
| Sprint 1-4 | Interface coverage (7→38 services, 27→38 repos) | 10 days |
| Sprint 5 | Split-brain validation (5 duplicate schemas) | 2 days |

---

## Debt Trend

| Date | Debt Items | Estimated Effort |
|------|-----------|------------------|
| 2026-07-26 | 15 | 45 days |
| 2026-07-27 | 12 | 38 days |
| 2026-07-28 (Sprint 5) | 12 | 34 days |

**Net reduction:** 3 items, 11 days effort

---

## Recommendations

1. **Prioritize Sprint 6** — Service layer enforcement is the highest remaining architectural risk
2. **Batch barrel exports** — Complete all barrel exports in Sprint 7 to improve import consistency
3. **Address test failures** — Pre-existing test failures should be fixed before adding new tests
4. **Automate architecture checks** — Prevent future debt accumulation with CI gates
