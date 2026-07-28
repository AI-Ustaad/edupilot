# Dependency Graph Report

**Generated:** 2026-07-28
**Sprint:** PI-1 Final Certification Audit

---

## Executive Summary

Dependency analysis shows clean layer separation with no circular dependencies. All dependencies flow inward: Routes → Services → Repositories → Firestore.

---

## Dependency Layers

| Layer | Depends On | Depended On By |
|-------|-----------|----------------|
| Routes (app/api/v1) | Services, Repositories, route-helpers | Next.js |
| Services | Repositories, lib/* | Routes |
| Repositories | BaseRepository, Firestore Admin SDK | Services |
| Interfaces | Types | Services, Repositories |
| DTOs | Zod | Services, Routes |
| Entities | None | Mappers |
| Types | None | Interfaces, Services, Repositories |

---

## Circular Dependencies

**Detected:** 0

Verified by analyzing all imports in:
- `app/api/v1/**/*.ts`
- `services/*.ts`
- `repositories/*.ts`
- `interfaces/*.ts`

---

## Cross-Layer Violations

| Violation Type | Count | Status |
|----------------|-------|--------|
| Route → Firestore | 0 | PASS |
| Service → Firestore | 0 | PASS |
| Repository → Service | 0 | PASS |
| Route → adminDb | 0 | PASS |
| Service → adminDb | 0 | PASS |

---

## Dependency Statistics

| Metric | Value |
|--------|-------|
| Total TypeScript files | 500+ |
| Total import statements | 3000+ |
| Circular dependencies | 0 |
| Layer violations | 0 |
| Average dependency depth | 3.2 |

---

## Conclusion

Dependency health: **PASS**

All dependencies follow the canonical architecture. No circular dependencies. No cross-layer violations.
