# EduPilot Symbol Index

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
