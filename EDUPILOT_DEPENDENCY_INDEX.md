# EduPilot Dependency Index

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
