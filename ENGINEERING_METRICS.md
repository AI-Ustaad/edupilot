# Engineering Metrics Report

**Generated:** 2026-07-28
**Sprint:** 5 — Validation Consolidation

---

## Architecture Metrics

| Metric | Value | Trend |
|--------|-------|-------|
| Architecture Score | 68/100 | IMPROVED |
| Engineering Score | 75/100 | IMPROVED |
| Build Health | 100/100 | STABLE |
| Layer Separation | 75/100 | STABLE |
| Interface Coverage | 90/100 | STABLE |
| Entity/Document/DTO/Mapper | 30/100 | IMPROVED |
| Dependency Direction | 70/100 | STABLE |
| Dead Code | 95/100 | IMPROVED |
| Duplication | 95/100 | IMPROVED |
| Barrel Exports | 35/100 | STABLE |
| Consistency | 70/100 | IMPROVED |
| Test Health | 50/100 | STABLE |

---

## Codebase Metrics

| Category | Count | Coverage |
|----------|-------|----------|
| Service files | 40 | 38 implement interfaces (95%) |
| Repository files | 43 | 38 implement interfaces (88.4%) |
| Interface files | 81 | 100% coverage of services/repos |
| Route files | 118 | 101 with auth (85.6%), 78 with permissions (66.1%) |
| DTO files | 15 | 100% barrel exported |
| Entity files | 5 | 0% barrel exported |
| Validator files | 17 | 0% barrel exported |
| Type files | 35 | 5.7% barrel exported |

---

## Validation Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Split-brain schemas | 5 | 0 | RESOLVED |
| Duplicate validator files | 4 | 0 | RESOLVED |
| Canonical DTO usage | 95% | 100% | IMPROVED |
| Validator directory structure | Inconsistent | Consistent | IMPROVED |

---

## Compliance Metrics

| Rule | Status |
|------|--------|
| Route → Service compliance | 16 bypass, 15 neither, 67 compliant |
| Service → Repository compliance | 2 services use adminDb directly |
| No route → Firestore | VERIFIED |
| No duplicate schemas | VERIFIED |
| All imports resolve | VERIFIED |

---

## Test Metrics

| Metric | Value |
|--------|-------|
| Total test suites | 64 |
| Passing suites | 46 |
| Failing suites | 18 (pre-existing) |
| Total tests | 680 |
| Passing tests | 620 |
| Failing tests | 60 (pre-existing) |
| Regression | 0 |

---

## Technical Debt

| Item | Severity | Sprint |
|------|----------|--------|
| 16 routes bypass services | HIGH | Sprint 6 |
| 2 services call adminDb | HIGH | Sprint 6 |
| Barrel exports incomplete | MEDIUM | Sprint 7 |
| 15 routes import neither | MEDIUM | Sprint 6 |
| 5 repos lack interfaces | MEDIUM | Sprint 8 |
| 2 services lack interfaces | MEDIUM | Sprint 8 |
| 16 repos don't extend BaseRepository | MEDIUM | Sprint 8 |
| No entity barrel | LOW | Sprint 9 |
| 18 test suite failures | LOW | Sprint 10 |

---

## Velocity

| Sprint | Focus | Score Change |
|--------|-------|--------------|
| Sprint 0 | Build Stabilization | +30 |
| Sprint 1-4 | Architecture Remediation | +32 |
| Sprint 5 | Validation Consolidation | +6 |
| **Total** | | **+68** |
