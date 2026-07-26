#!/usr/bin/env python3
"""Build final catalog documents"""
from pathlib import Path

PROJECT_ROOT = Path("/Users/imranhaidersandhu/Documents/edupilot")

# ============================================
# EDUPILOT_EVENT_CATALOG.md
# ============================================
event_catalog = """# EduPilot Event Catalog

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete inventory of all events, publishers, and subscribers

---

## Event Bus

| Property | Value | Evidence |
|----------|-------|----------|
| Implementation | EventBus class with outbox pattern | lib/events/event-bus.ts |
| Persistence | EventOutboxRepository | lib/events/event-bus.ts |
| Dispatch | EventWorker processes events | lib/workers/event.worker.ts |

## Publishers (15 services)

| Service | Events Published | Evidence |
|---------|------------------|----------|
| StudentService | STUDENT_CREATED, STUDENT_UPDATED, STUDENT_DELETED | services/StudentService.ts |
| StaffService | STAFF_CREATED, STAFF_UPDATED, STAFF_DELETED | services/StaffService.ts |
| AttendanceService | ATTENDANCE_MARKED, ATTENDANCE_UPDATED | services/attendance.service.ts |
| FeesService | FEE_CREATED, FEE_PAID | services/fees.service.ts |
| AssignmentService | ASSIGNMENT_POSTED | services/assignment.service.ts |
| HomeworkService | HOMEWORK_POSTED | services/homework.service.ts |
| ExamService | EXAM_CREATED, EXAM_PUBLISHED | services/exam.service.ts |
| MarkService | RESULT_PUBLISHED | services/marks.service.ts |
| NoticeService | NOTICE_POSTED | services/notice.service.ts |
| EventService | EVENT_CREATED | services/event.service.ts |
| MessageService | MESSAGE_SENT | services/message.service.ts |
| BlogService | BLOG_POSTED | services/blog.service.ts |
| VideoLectureService | VIDEO_LECTURE_POSTED | services/video-lecture.service.ts |
| TimetableService | TIMETABLE_UPDATED | services/timetable.service.ts |
| BusService | ROUTE_UPDATED | services/bus.service.ts |

## Subscribers (5 files)

| Subscriber | File | Events Handled |
|------------|------|----------------|
| AuditSubscriber | lib/subscribers/audit.subscriber.ts | All events |
| NotificationSubscriber | lib/events/subscribers/notification.subscriber.ts | Multiple events |
| LifecycleSubscriber | lib/subscribers/lifecycle.subscriber.ts | Student events |
| StaffLifecycleSubscriber | lib/subscribers/staff-lifecycle.subscriber.ts | Staff events |
| DashboardSubscriber | lib/subscribers/dashboard.subscriber.ts | Aggregation events |

## Event Flow

```
Publisher Service
  → eventBus.publish(eventType, payload)
    → EventOutboxRepository.enqueue()
      → EventWorker.process()
        → eventBus.dispatch(event)
          → Subscribers handle event
```

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
"""

(PROJECT_ROOT / "EDUPILOT_EVENT_CATALOG.md").write_text(event_catalog)
print("Created EDUPILOT_EVENT_CATALOG.md")

# ============================================
# EDUPILOT_AI_CATALOG.md
# ============================================
ai_catalog = """# EduPilot AI Catalog

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete inventory of AI components

---

## AI Providers

| Provider | Class | File | Model |
|----------|-------|------|-------|
| Gemini | GeminiProvider | lib/ai/providers/GeminiProvider.ts | gemini-2.5-flash |

## AI Strategies

| Strategy | File | Purpose |
|----------|------|---------|
| TeacherAgent | lib/ai/strategies/TeacherAgent.ts | Teacher-focused AI |
| HRAgent | lib/ai/strategies/HRAgent.ts | HR operations |
| FinanceAgent | lib/ai/strategies/FinanceAgent.ts | Financial analysis |
| StudentAgent | lib/ai/strategies/StudentAgent.ts | Student support |
| PrincipalAgent | lib/ai/strategies/PrincipalAgent.ts | Principal dashboard |
| ParentAgent | lib/ai/strategies/ParentAgent.ts | Parent communication |
| AdmissionAgent | lib/ai/strategies/AdmissionAgent.ts | Admissions |
| StaffStrategy | lib/ai/strategies/StaffStrategy.ts | Staff management |

## AI Gateway

| Component | File | Purpose |
|-----------|------|---------|
| AIGateway | lib/ai/gateway/AIGateway.ts | Main orchestrator |
| IAIGateway | interfaces/IAIGateway.ts | Gateway interface |

## AI Monitoring

| Component | File | Purpose |
|-----------|------|---------|
| UsageTracker | lib/ai/monitoring/UsageTracker.ts | Track AI usage per tenant |
| AIUsageRepository | repositories/ai-usage.repository.ts | Store usage data |

## AI Prompt Management

| Component | File | Purpose |
|-----------|------|---------|
| PromptGuard | lib/ai/prompt-guard.ts | Content moderation |
| ContextBuilder | lib/ai/context-builder.ts | Build AI context |
| Staff Prompt | lib/ai/prompts/staff.prompt.ts | Staff-related prompts |
| Common Prompt | lib/ai/prompts/common.prompt.ts | Shared prompts |

## AI API Routes

| Route | Purpose |
|-------|---------|
| app/api/v1/ai/**/*.ts | 7 AI endpoint files |

## AI Configuration

| Setting | Value | Evidence |
|---------|-------|----------|
| Provider | Gemini | lib/ai/providers/GeminiProvider.ts |
| Default Model | gemini-2.5-flash | lib/ai/providers/GeminiProvider.ts |
| API Key | GEMINI_API_KEY | Environment variable |
| Base URL | GEMINI_BASE | Environment variable |
| Timeout | 55000ms | lib/ai/providers/GeminiProvider.ts |
| Max Retries | 3 | lib/ai/providers/GeminiProvider.ts |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
"""

(PROJECT_ROOT / "EDUPILOT_AI_CATALOG.md").write_text(ai_catalog)
print("Created EDUPILOT_AI_CATALOG.md")

# ============================================
# EDUPILOT_SECURITY_CATALOG.md
# ============================================
security_catalog = """# EduPilot Security Catalog

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
| CRON_SECRET Hardcoded Fallback | ⚠️ FOUND | app/api/v1/jobs/attendance-report/route.ts |
| Secrets in .env.local | ⚠️ UNKNOWN | Requires git history check |

## Known Vulnerabilities

| Vulnerability | Severity | Evidence |
|---------------|----------|----------|
| Role escalation in register-user | HIGH | app/api/v1/auth/register-user/route.ts: role \|\| "teacher" |
| No auth on curriculum/engine | CRITICAL | app/api/v1/curriculum/engine/route.ts |
| No auth on education/rules | CRITICAL | app/api/v1/education/rules/route.ts |
| adminDb in 14 routes | HIGH | Multiple route files |
| adminDb in 6 services | HIGH | Multiple service files |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
"""

(PROJECT_ROOT / "EDUPILOT_SECURITY_CATALOG.md").write_text(security_catalog)
print("Created EDUPILOT_SECURITY_CATALOG.md")

# ============================================
# EDUPILOT_SAAS_CATALOG.md
# ============================================
saas_catalog = """# EduPilot SaaS Catalog

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete inventory of SaaS components

---

## Subscription Plans

| Plan | ID | Price | Max Students | Max Staff | Evidence |
|------|----|-------|--------------|-----------|----------|
| Free | free | 0 PKR | 50 | 10 | lib/config/subscription-plans.ts |
| Starter | starter | 2000 PKR | 200 | 50 | lib/config/subscription-plans.ts |
| Professional | professional | 3000 PKR | 1000 | 200 | lib/config/subscription-plans.ts |
| Enterprise | enterprise | 5000 PKR | 999999 | 999999 | lib/config/subscription-plans.ts |

## Stripe Integration

| Component | File | Status |
|-----------|------|--------|
| Stripe Client | lib/stripe.ts | ✅ Active |
| Create Checkout | app/api/v1/stripe/create-checkout/route.ts | ✅ Active |
| Webhook Handler | app/api/v1/stripe/webhook/route.ts | ✅ Active |
| Subscription Sync | services/subscription.service.ts | ✅ Active |

## Feature Flags

| Component | File | Status |
|-----------|------|--------|
| Feature Flags Config | lib/config/featureFlags.ts | ✅ Active |
| Feature Flag Service | services/featureFlag.service.ts | ✅ Active |
| Usage Limits | lib/config/subscription-plans.ts | ✅ Active |

## Tenant Management

| Component | File | Status |
|-----------|------|--------|
| Tenant Middleware | route-helpers/withTenant.ts | ✅ Active |
| Tenant Context | types/tenant.ts | ✅ Active |
| Tenant Repository | repositories/tenant.repository.ts | ✅ Active |
| Tenant Creation | app/api/v1/users/register-school/route.ts | ✅ Active |

## Billing Components

| Component | File | Status |
|-----------|------|--------|
| Subscription Service | services/subscription.service.ts | ✅ Active |
| Subscription Repository | repositories/subscription.repository.ts | ✅ Active |
| Invoice Service | MISSING | ❌ NOT FOUND |
| Payment History | MISSING | ❌ NOT FOUND |
| Proration Logic | MISSING | ❌ NOT FOUND |

## Notifications

| Component | File | Status |
|-----------|------|--------|
| Email (Resend) | lib/email.ts | ✅ Active |
| SMS (Twilio) | lib/notifications.ts | ✅ Active |
| In-App (Pusher) | lib/pusher/client.ts | ✅ Active |
| Push (Firebase) | lib/firebase/client.ts | ✅ Active |
| Notification Service | services/NotificationService.ts | ✅ Active |
| Notification Queue | MISSING | ❌ NOT FOUND |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
"""

(PROJECT_ROOT / "EDUPILOT_SAAS_CATALOG.md").write_text(saas_catalog)
print("Created EDUPILOT_SAAS_CATALOG.md")

# List all created documents
print("\n=== KNOWLEDGE BASE CREATED ===")
for f in sorted(PROJECT_ROOT.glob("EDUPILOT_*.md")):
    size = f.stat().st_size
    print(f"{f.name}: {size} bytes")
