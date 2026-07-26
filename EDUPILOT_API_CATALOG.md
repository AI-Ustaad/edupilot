# EduPilot API Catalog

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete inventory of all API routes

---

## API Route Summary

| Metric | Count |
|--------|-------|
| Total Routes | 117 |
| Routes with withAuth | 100 |
| Routes without auth | 17 |
| Routes with withPermission | 76 |
| Routes with adminDb | 7 |

## Routes Without Authentication

| Route | Method | Notes |
|-------|--------|-------|
| app/api/v1/auth/logout/route.ts | POST | Public by design |
| app/api/v1/auth/register-user/route.ts | POST | Public by design |
| app/api/v1/auth/me/route.ts | GET | Public by design |
| app/api/v1/auth/parent-login/route.ts | POST | Public by design |
| app/api/v1/auth/login/route.ts | POST | Public by design |
| app/api/v1/auth/session/route.ts | GET | Public by design |
| app/api/v1/super-admin/telemetry/route.ts | GET | Admin only |
| app/api/v1/protected-data/route.ts | GET | Protected by design |
| app/api/v1/users/init/route.ts | POST | Public by design |
| app/api/v1/users/register-school/route.ts | POST | Public by design |
| app/api/v1/jobs/attendance-report/route.ts | POST | Cron job |
| app/api/v1/jobs/fee-reminder/route.ts | POST | Cron job |
| app/api/v1/jobs/events/route.ts | POST | Cron job |
| app/api/v1/cron/fee-reminder/route.ts | POST | Cron job |
| app/api/v1/stripe/webhook/route.ts | POST | Webhook (Stripe) |
| app/api/v1/curriculum/load/route.ts | POST | Unknown |
| app/api/v1/curriculum/preview/route.ts | POST | Unknown |

## Routes Using adminDb

| Route | Method | Reason |
|-------|--------|--------|
| app/api/v1/stripe/webhook/route.ts | POST | Webhook handler |
| app/api/v1/cron/fee-reminder/route.ts | POST | Cron job |
| app/api/v1/jobs/fee-reminder/route.ts | POST | Cron job |
| app/api/v1/jobs/attendance-report/route.ts | POST | Job trigger |
| app/api/v1/users/register-school/route.ts | POST | Registration |
| app/api/v1/auth/parent-login/route.ts | POST | Parent auth |
| app/api/v1/auth/register-user/route.ts | POST | User creation |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
