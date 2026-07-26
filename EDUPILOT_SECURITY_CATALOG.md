# EduPilot Security Catalog

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete inventory of security components

---

## Authentication

| Component | File | Status |
|-----------|------|--------|
| Firebase Admin Auth | lib/firebase-admin.ts | ✅ Active |
| Session Cookie Creation | lib/auth/auth-server.ts | ✅ Active |
| Session Cookie Verification | lib/auth/auth-server.ts | ✅ Active |
| Refresh Token | lib/auth/auth-server.ts | ❌ NOT FOUND |
| Password Reset | app/api/v1/auth/forgot-password/route.ts | ❌ NOT FOUND |
| MFA/2FA | N/A | ❌ NOT FOUND |
| Account Lockout | N/A | ❌ NOT FOUND |

## Authorization (RBAC)

| Component | File | Status |
|-----------|------|--------|
| Role Definitions | lib/auth/roles.config.ts | ✅ Active |
| Permission Registry | lib/auth/permissions.ts | ✅ Active |
| withAuth Middleware | route-helpers/withAuth.ts | ✅ Active |
| withPermission Middleware | route-helpers/withPermission.ts | ✅ Active |
| withTenant Middleware | route-helpers/withTenant.ts | ✅ Active |
| Role Escalation Check | N/A | ❌ NOT FOUND |

## Session Management

| Component | Status | Evidence |
|-----------|--------|----------|
| Session Cookie | HttpOnly, SameSite=Lax, 5 days | lib/auth/auth-server.ts |
| Server-side Session Store | ❌ NOT FOUND | Cookie-based only |
| Session Invalidation on Logout | ❌ NOT FOUND | Cookie cleared only |

## CSRF Protection

| Component | Status | Evidence |
|-----------|--------|----------|
| CSRF Tokens | ❌ NOT FOUND | No CSRF implementation |
| SameSite Cookies | ✅ Lax | lib/auth/auth-server.ts |

## Secrets Management

| Component | Status | Evidence |
|-----------|--------|----------|
| CRON_SECRET Hardcoded Fallback | ✅ FIXED | app/api/v1/jobs/attendance-report/route.ts |
| Secrets in .env.local | ⚠️ UNKNOWN | Requires git history check |

## Known Vulnerabilities

| Vulnerability | Severity | Evidence |
|---------------|----------|----------|
| Role escalation in register-user | HIGH | app/api/v1/auth/register-user/route.ts: FIXED - role now server-side assigned |
| adminDb in 7 routes | MEDIUM | Public/auth/cron routes only |
| adminDb in 3 services | MEDIUM | JobService, ReportService, CurriculumEngineService |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
