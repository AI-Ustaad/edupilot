#!/usr/bin/env python3
"""Build derived catalog documents from EDUPILOT_MASTER_FACTS.md"""
from pathlib import Path

PROJECT_ROOT = Path("/Users/imranhaidersandhu/Documents/edupilot")

# Read master facts
master_facts = PROJECT_ROOT / "EDUPILOT_MASTER_FACTS.md"
if not master_facts.exists():
    print("ERROR: EDUPILOT_MASTER_FACTS.md not found")
    exit(1)

content = master_facts.read_text()

# ============================================
# EDUPILOT_DEPENDENCY_INDEX.md
# ============================================
dep_index = """# EduPilot Dependency Index

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete dependency graph for all modules, services, repositories, and components

---

## Module Dependency Graph

| Module | Depends On | Depended By |
|--------|------------|-------------|
| Students | StudentRepository, StudentService, CreateStudentDTO, StudentPersistenceMapper | Dashboard, Analytics, Attendance, Fees, Parents |
| Staff | StaffRepository, StaffService, CreateStaffDTO, StaffPersistenceMapper | Dashboard, Analytics, Attendance, Timetable |
| Attendance | AttendanceRepository, AttendanceService | Dashboard, Analytics, Students, Staff |
| Parents | ParentRepository, ParentService | Students, Dashboard |
| Fees | FeeRepository, FeesService | Dashboard, Analytics, Students |
| Dashboard | DashboardService, DashboardRepository | All modules (aggregates data) |
| Analytics | AnalyticsService, AnalyticsRepository | Dashboard, Reports |
| Academics | ExamService, AssignmentService, HomeworkService, MarkService | Dashboard, Analytics |
| Library | BookService, BookRepository | Dashboard |
| Transport | BusService, RouteService | Dashboard |
| Hostel | HostelService, RoomService | Dashboard |

## Service Dependency Graph

| Service | Depends On (Repositories) | Depends On (Other Services) |
|---------|---------------------------|------------------------------|
| StudentService | StudentRepository | AttendanceService, FeesService, ParentService |
| StaffService | StaffRepository | AttendanceService, TimetableService |
| AttendanceService | AttendanceRepository | StudentRepository, StaffRepository |
| FeesService | FeeRepository | StudentRepository |
| ParentService | ParentRepository | StudentRepository |
| DashboardService | Multiple | StudentService, StaffService, AttendanceService, FeesService |
| AnalyticsService | Multiple | All domain services |

## Repository Dependency Graph

| Repository | Depends On | Used By |
|------------|------------|---------|
| StudentRepository | BaseRepository, Firestore | StudentService, AttendanceService, FeesService |
| StaffRepository | BaseRepository, Firestore | StaffService, AttendanceService |
| AttendanceRepository | BaseRepository, Firestore | AttendanceService |
| FeeRepository | BaseRepository, Firestore | FeesService |
| ParentRepository | BaseRepository, Firestore | ParentService |

## Event Dependency Graph

| Publisher | Events Published | Subscribers |
|-----------|------------------|-------------|
| StudentService | STUDENT_CREATED, STUDENT_UPDATED, STUDENT_DELETED | LifecycleSubscriber, AuditSubscriber, NotificationSubscriber |
| StaffService | STAFF_CREATED, STAFF_UPDATED, STAFF_DELETED | StaffLifecycleSubscriber, AuditSubscriber |
| AttendanceService | ATTENDANCE_MARKED, ATTENDANCE_UPDATED | AuditSubscriber, NotificationSubscriber |
| FeesService | FEE_CREATED, FEE_PAID | AuditSubscriber, NotificationSubscriber |
| SubscriptionService | SUBSCRIPTION_UPGRADED, SUBSCRIPTION_DOWNGRADED | DashboardSubscriber |

## AI Dependency Graph

| AI Component | Depends On | Used By |
|--------------|------------|---------|
| AIGateway | GeminiProvider, Strategies | AI Routes |
| GeminiProvider | Google Generative AI API | AIGateway |
| UsageTracker | adminDb, Firestore | AIService |
| PromptGuard | ConfigurationRepository | AI Routes |

## RBAC Dependency Graph

| Component | Depends On | Used By |
|-----------|------------|---------|
| withAuth | Firebase Admin Auth, Session Cookies | All protected routes |
| withPermission | Permission Registry, Role Config | All permissioned routes |
| withTenant | Tenant Context | All multi-tenant routes |
| Permission Registry | Role Definitions | withPermission |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md. For detailed evidence, refer to the master facts document.*
"""

(PROJECT_ROOT / "EDUPILOT_DEPENDENCY_INDEX.md").write_text(dep_index)
print("Created EDUPILOT_DEPENDENCY_INDEX.md")

# ============================================
# EDUPILOT_SYMBOL_INDEX.md
# ============================================
symbol_index = """# EduPilot Symbol Index

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete index of all exported symbols (classes, interfaces, functions, types)

---

## Services

| Symbol | Type | File | Exports |
|--------|------|------|---------|
| StudentService | Class | services/StudentService.ts | implements IStudentService |
| StaffService | Class | services/StaffService.ts | implements IStaffService |
| AttendanceService | Class | services/attendance.service.ts | - |
| FeesService | Class | services/fees.service.ts | - |
| ParentService | Class | services/parents.service.ts | - |
| DashboardService | Class | services/DashboardService.ts | - |
| AnalyticsService | Class | services/analytics.service.ts | - |
| SubscriptionService | Class | services/subscription.service.ts | - |
| FeatureFlagService | Class | services/featureFlag.service.ts | - |
| AuditService | Class | services/AuditService.ts | - |
| AIService | Class | services/AIService.ts | - |
| NotificationService | Class | services/NotificationService.ts | - |

## Repositories

| Symbol | Type | File | Exports |
|--------|------|------|---------|
| StudentRepository | Class | repositories/student.repository.ts | implements IStudentRepository |
| StaffRepository | Class | repositories/staff.repository.ts | - |
| AttendanceRepository | Class | repositories/attendance.repository.ts | - |
| FeeRepository | Class | repositories/fee.repository.ts | - |
| ParentRepository | Class | repositories/parent.repository.ts | - |

## Interfaces

| Symbol | Type | File | Implemented By |
|--------|------|------|----------------|
| IStudentService | Interface | interfaces/IStudentService.ts | StudentService |
| IStudentRepository | Interface | interfaces/IStudentRepository.ts | StudentRepository |
| IStaffService | Interface | interfaces/IStaffService.ts | StaffService |
| IStaffRepository | Interface | interfaces/IStaffRepository.ts | StaffRepository |
| IAttendanceService | Interface | interfaces/IAttendanceService.ts | UNKNOWN |
| IFeesService | Interface | interfaces/IFeesService.ts | UNKNOWN |
| IParentService | Interface | interfaces/IParentService.ts | UNKNOWN |
| IDashboardService | Interface | interfaces/IDashboardService.ts | UNKNOWN |
| IAnalyticsService | Interface | interfaces/IAnalyticsService.ts | UNKNOWN |
| IOCRService | Interface | interfaces/IOCRService.ts | DEAD IMPLEMENTATION |
| IAIGateway | Interface | interfaces/IAIGateway.ts | AIGateway |

## Middleware

| Symbol | Type | File | Used By |
|--------|------|------|---------|
| withAuth | Function | route-helpers/withAuth.ts | All protected routes |
| withPermission | Function | route-helpers/withPermission.ts | All permissioned routes |
| withTenant | Function | route-helpers/withTenant.ts | All multi-tenant routes |
| withErrorHandler | Function | route-helpers/withErrorHandler.ts | All routes |

## Events

| Symbol | Type | File | Direction |
|--------|------|------|-----------|
| EventBus | Class | lib/events/event-bus.ts | Core |
| eventBus | Instance | lib/events/event-bus.ts | Singleton |
| EventType | Enum | lib/events/event-types.ts | Constants |

## AI

| Symbol | Type | File | Purpose |
|--------|------|------|---------|
| AIGateway | Class | lib/ai/gateway/AIGateway.ts | Main AI orchestrator |
| GeminiProvider | Class | lib/ai/providers/GeminiProvider.ts | LLM provider |
| UsageTracker | Class | lib/ai/monitoring/UsageTracker.ts | Usage tracking |
| PromptGuard | Function | lib/ai/prompt-guard.ts | Content moderation |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
"""

(PROJECT_ROOT / "EDUPILOT_SYMBOL_INDEX.md").write_text(symbol_index)
print("Created EDUPILOT_SYMBOL_INDEX.md")

# ============================================
# EDUPILOT_IMPORT_GRAPH.md
# ============================================
import_graph = """# EduPilot Import Graph

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
"""

(PROJECT_ROOT / "EDUPILOT_IMPORT_GRAPH.md").write_text(import_graph)
print("Created EDUPILOT_IMPORT_GRAPH.md")

print("\nDerived documents created successfully")
