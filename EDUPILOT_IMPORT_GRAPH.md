# EduPilot Import Graph

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete import dependency graph

---

## Critical Import Paths

### Routes → Services → Repositories → Firestore

```
app/api/v1/students/route.ts
  → services/StudentService.ts
    → repositories/student.repository.ts
      → lib/firebase-admin.ts (Firestore)

app/api/v1/staff/route.ts
  → services/StaffService.ts
    → repositories/staff.repository.ts
      → lib/firebase-admin.ts (Firestore)

app/api/v1/attendance/route.ts
  → services/AttendanceService.ts
    → repositories/attendance.repository.ts
      → lib/firebase-admin.ts (Firestore)
```

### Routes → Repositories (VIOLATIONS)

```
app/api/v1/ledger/route.ts
  → repositories/* (direct)
  → VIOLATION: bypasses service layer

app/api/v1/chat/route.ts
  → repositories/* (direct)
  → VIOLATION: bypasses service layer

app/api/v1/admin/users/route.ts
  → repositories/* (direct)
  → VIOLATION: bypasses service layer
```

### Routes → adminDb (VIOLATIONS)

```
app/api/v1/ledger/route.ts
app/api/v1/chat/route.ts
app/api/v1/auth/register-user/route.ts
app/api/v1/admin/users/role/route.ts
app/api/v1/admin/users/route.ts
app/api/v1/create-user/route.ts
app/api/v1/users/init/route.ts
app/api/v1/users/register-school/route.ts
app/api/v1/jobs/attendance-report/route.ts
app/api/v1/jobs/fee-reminder/route.ts
app/api/v1/jobs/[jobId]/route.ts
app/api/v1/cron/fee-reminder/route.ts
app/api/v1/stripe/webhook/route.ts
```
Total: 14 routes call adminDb directly

### Services → adminDb (VIOLATIONS)

```
services/subscription.service.ts
services/featureFlag.service.ts
services/job.service.ts
services/telemetry.service.ts
services/analytics.service.ts
services/AuditService.ts
```
Total: 6 services call adminDb directly

---

## Module Dependency Graph

```
Students ←→ Attendance
    ↓
    Fees
    ↓
  Parents

Staff ←→ Attendance
    ↓
  Timetable

Dashboard ←→ All Modules (aggregates)
Analytics ←→ All Modules (analyzes)
```

## Event Flow

```
Services (15 publishers)
  → EventBus.publish()
    → EventOutboxRepository.enqueue()
      → EventWorker.process()
        → Subscribers (5 subscribers)
          → Side effects (audit, notifications, dashboard updates)
```

## AI Flow

```
AI Routes
  → AIService
    → AIGateway
      → GeminiProvider
        → Google Generative AI API
      → Strategies
        → Prompt templates
      → UsageTracker
        → Firestore (ai_usage collection)
```

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
