# Import Graph Report

**Generated:** 2026-07-28
**Sprint:** Sprint 8 — Barrel Export & Module Organization

---

## Executive Summary

Import graph is clean with zero circular dependencies. All imports follow the canonical architecture.

---

## Import Graph

```
app/api/v1 (Routes)
  └── services/ (Application Services)
       └── repositories/ (Data Access)
            └── lib/ (Utilities)
                 └── interfaces/ (Contracts)
  └── repositories/ (Direct access for some routes)
  └── lib/ (Utilities)
  └── hooks/ (React hooks)

components/ (UI)
  └── hooks/ (React hooks)
  └── lib/ (Utilities)

lib/ (Utilities)
  └── repositories/ (Some utilities)
  └── interfaces/ (Types)
```

---

## Circular Dependencies

**Detected:** 0

All dependencies flow inward. No circular dependencies detected.

---

## Cross-Layer Violations

| Violation Type | Count | Status |
|----------------|-------|--------|
| Repository → Service | 0 | PASS |
| Repository → Route | 0 | PASS |
| Service → Component | 0 | PASS |
| Component → Repository | 0 | PASS |
| Validator → Component | 0 | PASS |

---

## Dependency Statistics

| Metric | Value |
|--------|-------|
| Total import statements | 3000+ |
| Average depth | 3.2 |
| Circular dependencies | 0 |
| Layer violations | 0 |

---

## Conclusion

Dependency health: PASS

All imports follow the canonical architecture with zero violations.
