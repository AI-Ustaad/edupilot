# Dependency Graph Report

**Generated:** 2026-07-28
**Sprint:** Sprint 8 — Barrel Export & Module Organization

---

## Executive Summary

Dependency graph is clean with zero circular dependencies and zero layer violations.

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
| Hooks | Services, lib/* | Components |
| Lib | Repositories, interfaces | Services, Hooks, Components |
| Components | Hooks, lib/* | Pages |

---

## Circular Dependencies

**Detected:** 0

Verified by analyzing all imports in the codebase.

---

## Layer Violations

| Violation | Count | Status |
|-----------|-------|--------|
| Route → Firestore | 0 | PASS |
| Service → Firestore | 0 | PASS |
| Repository → Service | 0 | PASS |
| Component → Repository | 0 | PASS |
| Validator → Component | 0 | PASS |

---

## Conclusion

Dependency health: PASS

All dependencies follow the canonical architecture.
