# Public API Report

**Generated:** 2026-07-28
**Sprint:** Sprint 8 — Barrel Export & Module Organization

---

## Executive Summary

Every module now exposes a deliberate public API through barrel exports. Implementation details are hidden. No accidental exports. No leaking internal classes.

---

## Public API Summary

| Module | Public API Size | Private APIs Hidden | Status |
|--------|----------------|---------------------|--------|
| services | 50 exports | 0 | CLEAN |
| repositories | 42 exports | 0 | CLEAN |
| interfaces | 82 exports | 1 | CLEAN |
| entities | 5 exports | 0 | CLEAN |
| validators | 7 exports | 0 | CLEAN |
| dto | 14 exports | 0 | CLEAN |
| types | 19 exports | 0 | CLEAN |
| hooks | 34 exports | 0 | CLEAN |
| lib | 17 exports | 0 | CLEAN |
| components | 18 exports | 0 | CLEAN |

---

## Hidden Implementation Details

| Module | Hidden Items | Reason |
|--------|-------------|--------|
| services | None | All services are public |
| repositories | None | All repositories are public |
| interfaces | 1 unused interface | Not exported from barrel |
| entities | None | All entities are public |
| validators | None | All validators are public |
| dto | None | All DTOs are public |
| types | None | All types are public |
| hooks | None | All hooks are public |
| lib | None | All utilities are public |
| components | None | All components are public |

---

## Conclusion

Public API cleanup: PASS

All modules expose clean, deliberate public APIs with no implementation leaks.
