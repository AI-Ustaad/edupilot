# Technical Debt Register

**Generated:** 2026-07-28
**Sprint:** 6 — Service Layer Enforcement

---

## Debt Summary

| Category | Items | Total Effort |
|----------|-------|--------------|
| P0 — Critical | 0 | 0 days |
| P1 — High | 4 | 13 days |
| P2 — Medium | 3 | 8 days |
| P3 — Low | 2 | 6 days |
| **Total** | **9** | **27 days** |

---

## P0 — Critical Debt

| # | Item | Impact | Effort | Sprint |
|---|------|--------|--------|--------|
| — | No critical debt remaining | — | — | — |

---

## P1 — High Debt

| # | Item | Impact | Effort | Sprint |
|---|------|--------|--------|--------|
| 1 | Barrel exports incomplete (services 15%) | HIGH | 3 days | Sprint 7 |
| 2 | Barrel exports incomplete (repositories 27.9%) | HIGH | 2 days | Sprint 7 |
| 3 | Barrel exports incomplete (types 5.7%) | HIGH | 1 day | Sprint 7 |
| 4 | 15 exception routes need service layer | MEDIUM | 7 days | Sprint 7 |

---

## P2 — Medium Debt

| # | Item | Impact | Effort | Sprint |
|---|------|--------|--------|--------|
| 5 | 5 repositories lack interfaces | MEDIUM | 2 days | Sprint 8 |
| 6 | 2 services lack interfaces | MEDIUM | 1 day | Sprint 8 |
| 7 | 16 repositories don't extend BaseRepository | MEDIUM | 3 days | Sprint 8 |

---

## P3 — Low Debt

| # | Item | Impact | Effort | Sprint |
|---|------|--------|--------|--------|
| 8 | 18 pre-existing test suite failures | LOW | 5 days | Sprint 10 |
| 9 | No automated architecture tests | MEDIUM | 4 days | Sprint 11 |

---

## Debt Resolution History

| Sprint | Debt Resolved | Effort |
|--------|---------------|--------|
| Sprint 0 | Build failure (validators/student) | 1 day |
| Sprint 0 | TypeScript errors (18 test files) | 2 days |
| Sprint 0 | Missing type-check script | 0.5 days |
| Sprint 1-4 | Interface coverage (7→38 services, 27→38 repos) | 10 days |
| Sprint 5 | Split-brain validation (5 duplicate schemas) | 2 days |
| Sprint 6 | Service layer enforcement (16 bypass routes, 2 adminDb services) | 8 days |

---

## Debt Trend

| Date | Debt Items | Estimated Effort |
|------|-----------|------------------|
| 2026-07-26 | 15 | 45 days |
| 2026-07-27 | 12 | 38 days |
| 2026-07-28 (Sprint 5) | 12 | 34 days |
| 2026-07-28 (Sprint 6) | 9 | 27 days |

**Net reduction:** 3 items, 7 days effort

---

## Recommendations

1. **Prioritize Sprint 7** — Barrel exports improve developer experience and import consistency
2. **Document exceptions** — The 15 routes that bypass services should be explicitly documented
3. **Address test failures** — Pre-existing test failures should be fixed before adding new tests
4. **Automate architecture checks** — Prevent future debt accumulation with CI gates
