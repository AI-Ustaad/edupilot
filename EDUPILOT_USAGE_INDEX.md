# EduPilot Usage Index

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Track usage counts and consumers for all components

---

## Most Used Services

| Service | Used By | Usage Count |
|---------|---------|-------------|
| StudentService | Student routes, Dashboard, Analytics, Attendance, Fees | 17+ |
| StaffService | Staff routes, Dashboard, Analytics, Attendance | 12+ |
| AttendanceService | Attendance routes, Dashboard | 8+ |
| FeesService | Fees routes, Dashboard | 6+ |
| ParentService | Parent routes, Students | 4+ |
| SubscriptionService | Subscription routes, Workers | 3+ |
| NotificationService | Multiple services | 15+ |
| AuditService | Multiple services | 10+ |

## Most Used Repositories

| Repository | Used By | Usage Count |
|------------|---------|-------------|
| StudentRepository | StudentService, AttendanceService, FeesService | 10+ |
| StaffRepository | StaffService, AttendanceService | 8+ |
| AttendanceRepository | AttendanceService | 4+ |
| FeeRepository | FeesService | 4+ |
| ParentRepository | ParentService | 3+ |

## Most Used Middleware

| Middleware | Applied To | Usage Count |
|------------|------------|-------------|
| withAuth | 98 routes | 98 |
| withPermission | 76 routes | 76 |
| withTenant | 110+ routes | 110+ |
| withErrorHandler | 117 routes | 117 |

## Most Used DTOs

| DTO | Used By | Usage Count |
|-----|---------|-------------|
| CreateStudentDTO | StudentService, Student routes | 5+ |
| UpdateStudentDTO | StudentService, Student routes | 4+ |
| CreateStaffDTO | StaffService, Staff routes | 4+ |
| UpdateStaffDTO | StaffService, Staff routes | 3+ |
| CreateAttendanceDTO | AttendanceService | 3+ |
| CreateFeeDTO | FeesService | 3+ |

## Dead Code Usage

| Component | Usage Count | Status |
|-----------|-------------|--------|
| BaseService | 0 | DEAD IMPLEMENTATION |
| IOCRService | 0 | DEAD IMPLEMENTATION |
| StudentResponseDTO | 2 (self + index) | DEAD IMPLEMENTATION |
| StaffResponseDTO | 2 (self + index) | DEAD IMPLEMENTATION |
| ParentResponseDTO | 2 (self + index) | DEAD IMPLEMENTATION |
| FeeResponseDTO | 2 (self + index) | DEAD IMPLEMENTATION |
| OCRRequestDTO | 2 (self + index) | DEAD IMPLEMENTATION |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
