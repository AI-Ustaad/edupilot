# Performance Guidelines

**Document ID**: EDU-PERF-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Targets

| Metric | Target | Current | Evidence |
| --- | --- | --- | --- |
| API Response Time (p95) | <200ms | Unknown | EDUPILOT_MASTER_FACTS.md |
| Database Query Time | <50ms | Unknown | EDUPILOT_MASTER_FACTS.md |
| Cache Hit Rate | >90% | Unknown | EDUPILOT_MASTER_FACTS.md |
| Bundle Size (JS) | <200KB | Unknown | UNKNOWN |
| Time to First Byte | <100ms | Unknown | UNKNOWN |

## 2. Optimization Rules

| Rule | Description | Enforcement |
| --- | --- | --- |
| No N+1 queries | Use batch queries or joins | Code review |
| Cache expensive queries | Redis for repeated lookups | Code review |
| Paginate large results | Limit + offset for all lists | Code review |
| Index Firestore queries | Composite indexes for all queries | CI/CD |
| Optimize images | Next.js Image component | Code review |

