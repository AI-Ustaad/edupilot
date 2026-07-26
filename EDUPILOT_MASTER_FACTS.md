# EduPilot Master Facts - Engineering Source of Truth

**Document Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical Source of Truth  
**Rule**: All future engineering decisions must be based exclusively on this document.

---

## Methodology

All facts derived from direct codebase inspection via file enumeration, grep, and file content inspection. No facts from memory, assumptions, or previous reports.

---

## Confidence Levels

- **VERIFIED**: Confirmed with direct code evidence
- **PARTIALLY VERIFIED**: Confirmed but incomplete
- **UNKNOWN**: Could not be verified

---

## SECTION 1: ARCHITECTURE

### 1.1 Project Overview

| Property | Value | Evidence |
|----------|-------|----------|
| Project Name | EduPilot | Directory name, package.json |
| Project Type | Enterprise Multi-Tenant AI Powered School Management SaaS | README.md |
| Framework | Next.js | package.json |
| Language | TypeScript | tsconfig.json |
| Database | Firebase Firestore | lib/firebase-admin.ts |
| Authentication | Firebase Admin Auth + Session Cookies | lib/auth/auth-server.ts |
| State Management | React Context + Hooks | context/AuthContext.tsx |
| UI Framework | React with TypeScript | app/ directory structure |

### 1.2 File Counts

| Metric | Count | Evidence |
|--------|-------|----------|
| API Routes | 117 | find app/api/v1 -name 'route.ts' |
| Protected Pages | 165 | find app/(protected) -type f |
| Service Files | 36 | find services -maxdepth 1 -name '*.ts' |
| Repository Files | 32 | find repositories -maxdepth 1 -name '*.ts' |
| Interface Files | 23 | find interfaces -maxdepth 1 -name '*.ts' |
| Entity Files | 5 | find entities -maxdepth 1 -name '*.ts' |
| Document Files | 5 | find documents -maxdepth 1 -name '*.ts' |
| DTO Files | 20 | find dto -maxdepth 1 -name '*.ts' |
| Mapper Files | 13 | find lib/mappers -maxdepth 1 -name '*.ts' |
| Validator Files | 22 | find validators -name '*.ts' |
| Hook Files | 34 | find hooks -name '*.ts' |
| Worker Files | 1 | find lib/workers -name '*.ts' |
| Subscriber Files | 4 | find lib/subscribers -name '*.ts' |
| Test Files | 329 | find . -name '*.test.ts' |

### 1.3 Services with Interfaces

| Service | Interface | adminDb | eventBus | File |
|---------|-----------|---------|----------|------|
| AuditService | NONE | YES | NO | AuditService.ts |
| OCRService | NONE | NO | NO | OCRService.ts |
| StaffService | IStaffService | NO | YES | StaffService.ts |
| StudentService | IStudentService | NO | NO | StudentService.ts |
| ValidationService | NONE | NO | NO | ValidationService.ts |
| analytics.service | IAnalyticsService | YES | NO | analytics.service.ts |
| assignment.service | NONE | NO | YES | assignment.service.ts |
| attendance.service | IAttendanceService | NO | YES | attendance.service.ts |
| auth.service | NONE | NO | NO | auth.service.ts |
| base.service | NONE | NO | NO | base.service.ts |
| behavior.service | NONE | NO | YES | behavior.service.ts |
| book.service | NONE | NO | YES | book.service.ts |
| bus.service | NONE | NO | YES | bus.service.ts |
| claims.service | NONE | NO | NO | claims.service.ts |
| class.service | NONE | NO | NO | class.service.ts |
| configuration.application.service | NONE | NO | NO | configuration.application.service.ts |
| configuration.service | NONE | NO | NO | configuration.service.ts |
| curriculum-engine.service | NONE | NO | NO | curriculum-engine.service.ts |
| dashboard.service | IDashboardService | NO | NO | dashboard.service.ts |
| featureFlag.service | NONE | YES | NO | featureFlag.service.ts |
| fees.service | IFeesService | NO | YES | fees.service.ts |
| homework.service | NONE | NO | YES | homework.service.ts |
| index | NONE | NO | NO | index.ts |
| job.service | NONE | YES | NO | job.service.ts |
| lesson-plan.service | NONE | NO | YES | lesson-plan.service.ts |
| marks.service | NONE | NO | YES | marks.service.ts |
| menu.service | NONE | NO | NO | menu.service.ts |
| parents.service | IParentService | NO | YES | parents.service.ts |
| quiz.service | NONE | NO | YES | quiz.service.ts |
| report.service | NONE | NO | NO | report.service.ts |
| session.service | NONE | NO | NO | session.service.ts |
| subscription.service | NONE | YES | YES | subscription.service.ts |
| telemetry.service | NONE | YES | NO | telemetry.service.ts |
| tenant-branding.service | NONE | NO | NO | tenant-branding.service.ts |
| timetable.service | NONE | NO | YES | timetable.service.ts |
| video-lecture.service | NONE | NO | YES | video-lecture.service.ts |

### 1.4 Repositories with Interfaces

| Repository | Interface | BaseRepository | File |
|------------|-----------|----------------|------|
| academic-year.repository | NONE | YES | academic-year.repository.ts |
| addons.repository | NONE | NO | addons.repository.ts |
| assignment.repository | IAssignmentRepository | YES | assignment.repository.ts |
| attendance.repository | IAttendanceRepository | YES | attendance.repository.ts |
| audit.repository | NONE | YES | audit.repository.ts |
| base.repository | NONE | NO | base.repository.ts |
| behavior.repository | IBehaviorRepository | YES | behavior.repository.ts |
| book.repository | IBookRepository | YES | book.repository.ts |
| bus.repository | IBusRepository | YES | bus.repository.ts |
| class.repository | NONE | YES | class.repository.ts |
| configuration.repository | NONE | NO | configuration.repository.ts |
| curriculum.repository | NONE | NO | curriculum.repository.ts |
| event-outbox.repository | NONE | NO | event-outbox.repository.ts |
| fees.repository | IFeesRepository | YES | fees.repository.ts |
| homework.repository | IHomeworkRepository | YES | homework.repository.ts |
| index | NONE | NO | index.ts |
| leave.repository | NONE | YES | leave.repository.ts |
| lesson-plan.repository | ILessonPlanRepository | YES | lesson-plan.repository.ts |
| marks.repository | IMarksRepository | YES | marks.repository.ts |
| menu.repository | NONE | NO | menu.repository.ts |
| parents.repository | IParentRepository | YES | parents.repository.ts |
| quiz.repository | IQuizRepository | YES | quiz.repository.ts |
| section.repository | NONE | YES | section.repository.ts |
| settings.repository | NONE | NO | settings.repository.ts |
| staff.repository | IStaffRepository | YES | staff.repository.ts |
| student.repository.test | NONE | NO | student.repository.test.ts |
| student.repository | IStudentRepository | YES | student.repository.ts |
| syllabus.repository | NONE | YES | syllabus.repository.ts |
| tenant-branding.repository | NONE | YES | tenant-branding.repository.ts |
| timetable.repository | ITimetableRepository | YES | timetable.repository.ts |
| user.repository | NONE | NO | user.repository.ts |
| video-lecture.repository | NONE | YES | video-lecture.repository.ts |

### 1.5 Dead Implementations

| Name | Status | Evidence |
|------|--------|----------|
| BaseService | DEAD IMPLEMENTATION | services/base.service.ts exists, 0 services extend it |
| IOCRService | DEAD IMPLEMENTATION | interfaces/IOCRService.ts exists, 0 classes implement it |
| StudentResponseDTO | DEAD IMPLEMENTATION | Only in dto/StudentResponseDTO.ts and dto/index.ts |
| StaffResponseDTO | DEAD IMPLEMENTATION | Only in dto/StaffResponseDTO.ts and dto/index.ts |
| ParentResponseDTO | DEAD IMPLEMENTATION | Only in dto/ParentResponseDTO.ts and dto/index.ts |
| FeeResponseDTO | DEAD IMPLEMENTATION | Only in dto/FeeResponseDTO.ts and dto/index.ts |
| OCRRequestDTO | DEAD IMPLEMENTATION | Only in dto/OCRRequestDTO.ts and dto/index.ts |

### 1.6 Duplicate Implementations

| Name | Status | Evidence |
|------|--------|----------|
| job.service.ts | DUPLICATE | services/job.service.ts and lib/services/job.service.ts nearly identical |
| configuration.service.ts | DUPLICATE | services/configuration.service.ts and services/configuration.application.service.ts similar |

## SECTION 2: CORE CODEBASE INVENTORIES

### 2.1 Entities

| Entity Name | File | References |
|-------------|------|------------|
| attendance.entity | attendance.entity.ts | 0 |
| fee.entity | fee.entity.ts | 0 |
| parent.entity | parent.entity.ts | 0 |
| staff.entity | staff.entity.ts | 0 |
| student.entity | student.entity.ts | 0 |

### 2.2 Documents

| Document Name | File | References |
|---------------|------|------------|
| AttendanceDocument | AttendanceDocument.ts | 1 |
| FeeDocument | FeeDocument.ts | 1 |
| ParentDocument | ParentDocument.ts | 1 |
| StaffDocument | StaffDocument.ts | 1 |
| StudentDocument | StudentDocument.ts | 2 |

### 2.3 DTOs

| DTO Name | File | References | Status |
|----------|------|------------|--------|
| CreateAssignmentDTO | CreateAssignmentDTO.ts | 2 | DEAD IMPLEMENTATION |
| CreateAttendanceDTO | CreateAttendanceDTO.ts | 1 | UNKNOWN |
| CreateBookDTO | CreateBookDTO.ts | 2 | DEAD IMPLEMENTATION |
| CreateFeeDTO | CreateFeeDTO.ts | 1 | UNKNOWN |
| CreateLessonPlanDTO | CreateLessonPlanDTO.ts | 2 | DEAD IMPLEMENTATION |
| CreateParentDTO | CreateParentDTO.ts | 1 | UNKNOWN |
| CreateStaffDTO | CreateStaffDTO.ts | 1 | UNKNOWN |
| CreateStudentDTO | CreateStudentDTO.ts | 2 | DEAD IMPLEMENTATION |
| FeeResponseDTO | FeeResponseDTO.ts | 1 | UNKNOWN |
| OCRRequestDTO | OCRRequestDTO.ts | 2 | DEAD IMPLEMENTATION |
| ParentResponseDTO | ParentResponseDTO.ts | 1 | UNKNOWN |
| RecordBehaviorDTO | RecordBehaviorDTO.ts | 2 | DEAD IMPLEMENTATION |
| StaffResponseDTO | StaffResponseDTO.ts | 1 | UNKNOWN |
| StudentResponseDTO | StudentResponseDTO.ts | 2 | DEAD IMPLEMENTATION |
| UpdateAttendanceDTO | UpdateAttendanceDTO.ts | 1 | UNKNOWN |
| UpdateFeeDTO | UpdateFeeDTO.ts | 1 | UNKNOWN |
| UpdateParentDTO | UpdateParentDTO.ts | 1 | UNKNOWN |
| UpdateStaffDTO | UpdateStaffDTO.ts | 1 | UNKNOWN |
| UpdateStudentDTO | UpdateStudentDTO.ts | 2 | DEAD IMPLEMENTATION |
| index | index.ts | 1 | UNKNOWN |

### 2.4 Mappers

| Mapper Name | File | References |
|-------------|------|------------|
| AttendancePersistenceMapper | AttendancePersistenceMapper.ts | 1 |
| FeePersistenceMapper | FeePersistenceMapper.ts | 1 |
| ParentPersistenceMapper | ParentPersistenceMapper.ts | 1 |
| StaffPersistenceMapper | StaffPersistenceMapper.ts | 1 |
| StudentPersistenceMapper | StudentPersistenceMapper.ts | 2 |
| academic.mapper | academic.mapper.ts | 1 |
| configuration.mapper | configuration.mapper.ts | 1 |
| configuration.viewmodel.mapper | configuration.viewmodel.mapper.ts | 1 |
| history.mapper | history.mapper.ts | 1 |
| school-profile.mapper | school-profile.mapper.ts | 1 |
| shared | shared.ts | 1 |
| staff.mapper | staff.mapper.ts | 1 |
| student.mapper | student.mapper.ts | 1 |

### 2.5 Validators

| Validator Name | File | References |
|----------------|------|------------|
| AttendanceValidator | AttendanceValidator.ts | 1 |
| index | index.ts | 1 |
| CreateFeeValidator | CreateFeeValidator.ts | 1 |
| index | index.ts | 1 |
| MarksValidator | MarksValidator.ts | 1 |
| index | index.ts | 1 |
| CreateParentValidator | CreateParentValidator.ts | 1 |
| index | index.ts | 1 |
| index | index.ts | 1 |
| BulkImportValidator | BulkImportValidator.ts | 1 |
| CreateStaffValidator | CreateStaffValidator.ts | 1 |
| OCRValidator | OCRValidator.ts | 1 |
| UpdateStaffValidator | UpdateStaffValidator.ts | 1 |
| index | index.ts | 1 |
| BulkImportValidator | BulkImportValidator.ts | 1 |
| CreateStudentValidator | CreateStudentValidator.ts | 1 |
| OCRValidator | OCRValidator.ts | 1 |
| UpdateStudentValidator | UpdateStudentValidator.ts | 1 |
| index | index.ts | 1 |
| index | index.ts | 1 |
| TimetableValidator | TimetableValidator.ts | 1 |
| index | index.ts | 1 |

## SECTION 3: API

### 3.1 API Route Summary

| Metric | Count | Evidence |
|--------|-------|----------|
| Total Routes | 117 | find app/api/v1 -name 'route.ts' |
| Routes with withAuth | 98 | grep -r 'withAuth' app/api/v1 -l |
| Routes with withPermission | 76 | grep -r 'withPermission' app/api/v1 -l |
| Routes with adminDb | 14 | grep -r 'adminDb' app/api/v1 -l |
| Routes without auth | 19 | See 3.2 |

### 3.2 Routes Without Authentication

| Route File | Has Auth Middleware |
|------------|---------------------|
| app/api/v1/auth/login/route.ts | NO |
| app/api/v1/auth/logout/route.ts | NO |
| app/api/v1/auth/me/route.ts | NO |
| app/api/v1/auth/parent-login/route.ts | NO |
| app/api/v1/auth/register-user/route.ts | NO |
| app/api/v1/auth/session/route.ts | NO |
| app/api/v1/cron/fee-reminder/route.ts | NO |
| app/api/v1/curriculum/engine/route.ts | NO |
| app/api/v1/curriculum/load/route.ts | NO |
| app/api/v1/curriculum/preview/route.ts | NO |
| app/api/v1/education/rules/route.ts | NO |
| app/api/v1/jobs/attendance-report/route.ts | NO |
| app/api/v1/jobs/events/route.ts | NO |
| app/api/v1/jobs/fee-reminder/route.ts | NO |
| app/api/v1/protected-data/route.ts | NO |
| app/api/v1/stripe/webhook/route.ts | NO |
| app/api/v1/super-admin/telemetry/route.ts | NO |
| app/api/v1/users/init/route.ts | NO |
| app/api/v1/users/register-school/route.ts | NO |

## SECTION 4: SECURITY

### 4.1 Authentication

| Component | Status | Evidence |
|-----------|--------|----------|
| Session Cookie Creation | UNKNOWN | lib/auth/auth-server.ts |
| Session Cookie Verification | VERIFIED | lib/auth/auth-server.ts |
| Refresh Token | NOT FOUND | lib/auth/auth-server.ts |
| Session Cookie Check | VERIFIED | middleware.ts |

### 4.2 RBAC

| Component | Status | Evidence |
|-----------|--------|----------|
| Role Definitions | UNKNOWN | lib/auth/roles.config.ts |
| Permission Domains | 0 domains | lib/auth/permissions.ts |

### 4.3 Secrets Management

| Secret | Status | Evidence |
|--------|--------|----------|
| Hardcoded Secrets | FOUND in 2 files | route.ts, route.ts |

## SECTION 5: ENTERPRISE SAAS

### 5.1 Subscription Plans

| Property | Value | Evidence |
|----------|-------|----------|
| Plan Count | 4 | lib/config/subscription-plans.ts |
| Plan: free | EXISTS | lib/config/subscription-plans.ts |
| Plan: starter | EXISTS | lib/config/subscription-plans.ts |
| Plan: professional | EXISTS | lib/config/subscription-plans.ts |
| Plan: enterprise | EXISTS | lib/config/subscription-plans.ts |

### 5.2 Stripe Integration

| Component | Status | Evidence |
|-----------|--------|----------|
| route | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/app/api/v1/stripe/webhook/route.ts |
| route | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/app/api/v1/stripe/create-checkout/route.ts |
| route | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/.kilo/worktrees/detailed-plate/app/api/v1/stripe/webhook/route.ts |
| route | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/.kilo/worktrees/detailed-plate/app/api/v1/stripe/create-checkout/route.ts |
| route | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/.next/types/app/api/v1/stripe/webhook/route.ts |
| route | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/.next/types/app/api/v1/stripe/create-checkout/route.ts |

### 5.3 Feature Flags

| Property | Value | Evidence |
|----------|-------|----------|
| Feature Count | 2 | lib/config/featureFlags.ts |

## SECTION 6: ACADEMIC PLATFORM

### 6.1 Module Summary

| Module | Services | Repositories | Routes | Evidence |
|--------|----------|--------------|--------|----------|
| Students | 0 | 0 | 1 | Multiple files |
| Staff | 0 | 1 | 1 | Multiple files |
| Attendance | 1 | 1 | 3 | Multiple files |
| Parents | 1 | 1 | 2 | Multiple files |
| Fees | 1 | 1 | 2 | Multiple files |
| Dashboard | 1 | 0 | 2 | Multiple files |
| Analytics | 1 | 0 | 3 | Multiple files |
| Exams | 0 | 0 | 0 | Multiple files |
| Assignments | 0 | 0 | 1 | Multiple files |
| Homework | 1 | 1 | 1 | Multiple files |
| Timetable | 1 | 1 | 2 | Multiple files |
| Classes | 0 | 0 | 1 | Multiple files |
| Subjects | 0 | 0 | 0 | Multiple files |
| Marks | 1 | 1 | 1 | Multiple files |
| Behavior | 1 | 1 | 1 | Multiple files |
| Quizzes | 0 | 0 | 1 | Multiple files |
| Books | 0 | 0 | 1 | Multiple files |
| Buses | 0 | 0 | 1 | Multiple files |
| Leave | 0 | 1 | 1 | Multiple files |
| Syllabus | 0 | 1 | 1 | Multiple files |
| Video-Lectures | 0 | 0 | 1 | Multiple files |
| Notices | 0 | 0 | 0 | Multiple files |
| Events | 0 | 0 | 1 | Multiple files |
| Messages | 0 | 0 | 0 | Multiple files |
| Blogs | 0 | 0 | 0 | Multiple files |

## SECTION 7: ENTERPRISE PLATFORM

### 7.1 Event System

| Component | Status | Evidence |
|-----------|--------|----------|
| EventBus Class | VERIFIED | lib/events/event-bus.ts |
| publish() method | VERIFIED | lib/events/event-bus.ts |
| subscribe() method | VERIFIED | lib/events/event-bus.ts |
| Subscribers | 4 files | lib/subscribers/ |
| Publisher Services | 15 | homework.service, behavior.service, lesson-plan.service, subscription.service, marks.service... |

### 7.2 Background Jobs

| Component | Status | Evidence |
|-----------|--------|----------|
| Worker Files | 1 | lib/workers/ |
| event.worker | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/workers/event.worker.ts |
| Cron Routes | 1 | app/api/v1/cron/*/route.ts |

## SECTION 8: AI PLATFORM

### 8.1 AI Components

| Component | Status | Evidence |
|-----------|--------|----------|
| AI Files | 17 | lib/ai/ |
| Providers | 1 | lib/ai/providers/ |
| GeminiProvider | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/ai/providers/GeminiProvider.ts |
| Strategies | 9 | lib/ai/strategies/ |
| StaffStrategy | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/ai/strategies/StaffStrategy.ts |
| TeacherAgent | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/ai/strategies/TeacherAgent.ts |
| HRAgent | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/ai/strategies/HRAgent.ts |
| FinanceAgent | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/ai/strategies/FinanceAgent.ts |
| StudentAgent | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/ai/strategies/StudentAgent.ts |
| PrincipalAgent | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/ai/strategies/PrincipalAgent.ts |
| ParentAgent | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/ai/strategies/ParentAgent.ts |
| AdmissionAgent | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/ai/strategies/AdmissionAgent.ts |
| IAgentStrategy | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/ai/strategies/IAgentStrategy.ts |
| Prompt Templates | 2 | lib/ai/prompts/ |
| AI API Routes | 7 | app/api/v1/ai/ |

## SECTION 9: FRONTEND

### 9.1 Page Inventory

| Type | Count | Evidence |
|------|-------|----------|
| Protected Pages | 87 | find app/(protected) -name '*.tsx' |
| Public Pages | 15 | Total minus protected |
| Components | 30 | find components -name '*.tsx' |
| Layouts | 3 | find app -name 'layout.tsx' |

## SECTION 10: INFRASTRUCTURE

### 10.1 Firebase

| Component | Status | Evidence |
|-----------|--------|----------|
| Firebase Admin | VERIFIED | lib/firebase-admin.ts |
| Firebase Client | VERIFIED | lib/firebase.ts |
| Firestore | VERIFIED | Used throughout repositories |

### 10.2 Redis

| Component | Status | Evidence |
|-----------|--------|----------|
| Redis Files | 0 | lib/redis/ |

### 10.3 Queue System

| Component | Status | Evidence |
|-----------|--------|----------|
| Queue Files | 1 | lib/queue/ |
| publisher | EXISTS | /Users/imranhaidersandhu/Documents/edupilot/lib/queue/publisher.ts |
## SECTION 11: VALIDATION LAYER

### 11.1 Validators

| Validator | File | Used By Services |
|-----------|------|------------------|
| AttendanceValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/attendance/AttendanceValidator.ts | 0 |
| index | /Users/imranhaidersandhu/Documents/edupilot/validators/attendance/index.ts | 0 |
| CreateFeeValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/fees/CreateFeeValidator.ts | 0 |
| index | /Users/imranhaidersandhu/Documents/edupilot/validators/fees/index.ts | 0 |
| MarksValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/marks/MarksValidator.ts | 0 |
| index | /Users/imranhaidersandhu/Documents/edupilot/validators/marks/index.ts | 0 |
| CreateParentValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/parent/CreateParentValidator.ts | 0 |
| index | /Users/imranhaidersandhu/Documents/edupilot/validators/parent/index.ts | 0 |
| index | /Users/imranhaidersandhu/Documents/edupilot/validators/quiz/index.ts | 0 |
| BulkImportValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/staff/BulkImportValidator.ts | 0 |
| CreateStaffValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/staff/CreateStaffValidator.ts | 0 |
| OCRValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/staff/OCRValidator.ts | 0 |
| UpdateStaffValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/staff/UpdateStaffValidator.ts | 0 |
| index | /Users/imranhaidersandhu/Documents/edupilot/validators/staff/index.ts | 0 |
| BulkImportValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/student/BulkImportValidator.ts | 0 |
| CreateStudentValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/student/CreateStudentValidator.ts | 0 |
| OCRValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/student/OCRValidator.ts | 0 |
| UpdateStudentValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/student/UpdateStudentValidator.ts | 0 |
| index | /Users/imranhaidersandhu/Documents/edupilot/validators/student/index.ts | 0 |
| index | /Users/imranhaidersandhu/Documents/edupilot/validators/teacher/index.ts | 0 |
| TimetableValidator | /Users/imranhaidersandhu/Documents/edupilot/validators/timetable/TimetableValidator.ts | 0 |
| index | /Users/imranhaidersandhu/Documents/edupilot/validators/timetable/index.ts | 0 |

## SECTION 12: ERROR & RESPONSE LAYERS

### 12.1 Error Classes

| Error Class | File |
|-------------|------|

### 12.2 Response Helpers

| Helper | File |
|--------|------|
| createSuccessResponse | lib/api/response.ts |
| createErrorResponse | lib/api/response.ts |
| createApiResponse | lib/api/response.ts |

## SECTION 13: MIDDLEWARE

| Middleware | File | Used By Routes |
|------------|------|----------------|
| withTenant | /Users/imranhaidersandhu/Documents/edupilot/route-helpers/withTenant.ts | 1 exports |
| withErrorHandler | /Users/imranhaidersandhu/Documents/edupilot/route-helpers/withErrorHandler.ts | 1 exports |
| withAuth | /Users/imranhaidersandhu/Documents/edupilot/route-helpers/withAuth.ts | 1 exports |
| withRole | /Users/imranhaidersandhu/Documents/edupilot/route-helpers/withRole.ts | 1 exports |
| withRateLimit | /Users/imranhaidersandhu/Documents/edupilot/route-helpers/withRateLimit.ts | 1 exports |
| withLogging | /Users/imranhaidersandhu/Documents/edupilot/route-helpers/withLogging.ts | 1 exports |
| request-context | /Users/imranhaidersandhu/Documents/edupilot/route-helpers/request-context.ts | 2 exports |
| index | /Users/imranhaidersandhu/Documents/edupilot/route-helpers/index.ts | 7 exports |
| withAuthAndPermission | /Users/imranhaidersandhu/Documents/edupilot/route-helpers/withAuthAndPermission.ts | 1 exports |
| withValidation | /Users/imranhaidersandhu/Documents/edupilot/route-helpers/withValidation.ts | 1 exports |
| middleware | /Users/imranhaidersandhu/Documents/edupilot/middleware.ts | 2 exports |

## SECTION 14: HOOKS

| Hook Name | File | References |
|-----------|------|------------|
| useAI | useAI.ts | 1 |
| useAIAgents | useAIAgents.ts | 1 |
| useAdmin | useAdmin.ts | 1 |
| useAdmissions | useAdmissions.ts | 1 |
| useAiContext | useAiContext.ts | 2 |
| useAnalytics | useAnalytics.ts | 2 |
| useAttendance | useAttendance.ts | 2 |
| useChat | useChat.ts | 1 |
| useClasses | useClasses.ts | 2 |
| useDashboard | useDashboard.ts | 2 |
| useDashboardMetrics | useDashboardMetrics.ts | 2 |
| useEducationRulesEngine | useEducationRulesEngine.ts | 2 |
| useExams | useExams.ts | 1 |
| useFees | useFees.ts | 2 |
| useGeneralSettings | useGeneralSettings.ts | 2 |
| useHomework | useHomework.ts | 2 |
| useInfiniteStudents | useInfiniteStudents.ts | 2 |
| useOCR | useOCR.ts | 4 |
| useParents | useParents.ts | 2 |
| usePermission | usePermission.ts | 1 |
| useRealtimeAttendance | useRealtimeAttendance.ts | 2 |
| useRealtimeDashboard | useRealtimeDashboard.ts | 2 |
| useRealtimeNotifications | useRealtimeNotifications.ts | 2 |
| useReports | useReports.ts | 1 |
| useSchool | useSchool.ts | 2 |
| useSchoolConfiguration | useSchoolConfiguration.ts | 2 |
| useSettings | useSettings.ts | 2 |
| useStaff | useStaff.ts | 8 |
| useStudents | useStudents.ts | 2 |
| useSyllabus | useSyllabus.ts | 2 |
| useTeacher | useTeacher.ts | 1 |
| useTelemetry | useTelemetry.ts | 2 |
| useTimetable | useTimetable.ts | 2 |
| useVideos | useVideos.ts | 2 |

## SECTION 15: CONTEXTS & PROVIDERS

| Context/Provider | File |
|------------------|------|
| AuthContext | /Users/imranhaidersandhu/Documents/edupilot/context/AuthContext.tsx |
| BrandingContext | /Users/imranhaidersandhu/Documents/edupilot/context/BrandingContext.tsx |

---

## Document Control

| Property | Value |
|----------|-------|
| Generated | 1785041067.8837204 |
| Tool | Python enumeration script |
| Scope | Full codebase |
| Total Lines | 442 |