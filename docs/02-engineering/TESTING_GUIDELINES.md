# Testing Guidelines

**Document ID**: EDU-TEST-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Current State

| Metric | Current | Target | Evidence |
| --- | --- | --- | --- |
| Total Tests | 209 | 500+ | EDUPILOT_MASTER_FACTS.md |
| Test Files | 20 | 100+ | EDUPILOT_MASTER_FACTS.md |
| Coverage | ~5% | 80% | EDUPILOT_MASTER_FACTS.md |
| Integration Tests | 0 | 100+ | EDUPILOT_MASTER_FACTS.md |
| E2E Tests | 0 | 50+ | EDUPILOT_MASTER_FACTS.md |

## 2. Test Types

| Type | Scope | Tool | Current Status |
| --- | --- | --- | --- |
| Unit | Services, utilities | Jest | ✅ Active |
| Integration | API routes, repositories | Jest + Supertest | ❌ Missing |
| E2E | User journeys | Playwright | ❌ Missing |
| Security | Auth, RBAC, tenant | Jest | ❌ Missing |
| Performance | API benchmarks | k6 | ❌ Missing |

## 3. Testing Rules

- All new code must have unit tests
- All API routes must have integration tests
- Critical user journeys must have E2E tests
- Tests must run in CI/CD pipeline
- Coverage threshold: 80% for new code

