# Security Architecture

**Document ID**: EDU-SECARCH-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Security Layers

```mermaid
graph TD

```

    A[Client Request] --> B[HTTPS]
    B --> C[Next.js Middleware]
    C --> D[withAuth - Session Validation]
    D --> E[withTenant - Tenant Isolation]
    E --> F[withPermission - RBAC]
    F --> G[Route Handler]
    G --> H[Service Layer]
    H --> I[Repository - Tenant Filter]
    I --> J[Firestore Security Rules]
```

## 2. Authentication

| Component | Status | Evidence |
|-----------|--------|----------|
| Firebase Admin Auth | ✅ Active | lib/firebase-admin.ts |
| Session Cookies | ✅ Active | HttpOnly, SameSite=Lax, 5 days |
| Refresh Tokens | ❌ Missing | No refresh mechanism |
| Password Reset | ❌ Missing | No forgot-password route |
| MFA/2FA | ❌ Missing | No MFA implementation |
| Account Lockout | ❌ Missing | No failed login tracking |

## 3. Authorization

| Component | Status | Evidence |
|-----------|--------|----------|
| Role Definitions | ✅ Active | 5 roles: SUPER_ADMIN, ADMIN, TEACHER, PARENT, STUDENT |
| Permission Registry | ✅ Active | 100+ permissions |
| withAuth Middleware | ✅ Active | 98 routes |
| withPermission Middleware | ✅ Active | 76 routes |
| Server-side Page Protection | ❌ Missing | Client-side only |

## 4. Known Vulnerabilities

| Vulnerability | Severity | Location | Evidence |
| --- | --- | --- | --- |
| Role escalation | HIGH | register-user route | EDUPILOT_SECURITY_CATALOG.md |
| No auth on curriculum/engine | CRITICAL | curriculum/engine/route.ts | EDUPILOT_API_CATALOG.md |
| No auth on education/rules | CRITICAL | education/rules/route.ts | EDUPILOT_API_CATALOG.md |
| adminDb in 14 routes | HIGH | Multiple routes | EDUPILOT_API_CATALOG.md |
| adminDb in 6 services | HIGH | Multiple services | EDUPILOT_MASTER_FACTS.md |
| Hardcoded CRON_SECRET fallback | HIGH | jobs/attendance-report/route.ts | EDUPILOT_SECURITY_CATALOG.md |

