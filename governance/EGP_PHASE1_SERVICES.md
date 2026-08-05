# EduPilot Enterprise Governance Program (EGP)
## Phase 1 — Service Reuse Validation
### Version 2.0 | Fortune 500 Architecture Governance Board

---

## PHASE 1: SERVICE REUSE VALIDATION

### Methodology
For every module in the codebase, we locate the existing service, existing interface, existing repository, current dependencies, business responsibility, current consumers, and current runtime usage. We then answer: Can the current service satisfy this module? YES / NO / REVIEW.

---

### Module 1: Student Management

| Attribute | Evidence |
|---|---|
| Existing Service | `StudentService` (`services/StudentService.ts`, 239 lines) |
| Existing Interface | `IStudentService` (`interfaces/IStudentService.ts`, 31 lines) |
| Existing Repository | `StudentRepository` extends `BaseRepository<StudentDocument>` implements `IStudentRepository` |
| Current Dependencies | `StudentRepository`, `StudentPersistenceMapper`, `CreateStudentSchema`, `eventBus`, `EVENTS` |
| Business Responsibility | CRUD for student entities, admission approval/rejection, 360 view, comments, promotion, archiving, bulk import, analytics |
| Current Consumers | `app/api/v1/students/route.ts`, `app/api/v1/students/[id]/route.ts`, `app/api/v1/students/bulk/route.ts`, `app/api/v1/students/ocr-admission/route.ts`, `app/api/v1/students/promote/route.ts`, `app/api/v1/students/risk/route.ts`, `app/api/v1/students/360/route.ts`, `app/api/v1/students/get/route.ts` |
| Runtime Usage | Routes instantiate `new StudentService()` per request (no singleton) |

**Can the current service satisfy this module?** YES

**Why:** `StudentService` implements `IStudentService` and provides full CRUD, admission workflows, analytics, bulk operations, and 360-degree views. All student-related routes delegate to this service. The service follows the mandatory Route → Service → Repository chain. No new service is needed.

---

### Module 2: Staff Management

| Attribute | Evidence |
|---|---|
| Existing Service | `StaffService` (`services/StaffService.ts`, 543 lines) |
| Existing Interface | `IStaffService` (`interfaces/IStaffService.ts`) |
| Existing Repository | `StaffRepository` extends `BaseRepository<StaffDocument>` implements `IStaffRepository` |
| Current Dependencies | `StaffRepository`, `AttendanceRepository`, `ValidationService`, `AuditService`, `GeminiProvider`, `StaffPersistenceMapper`, `eventBus` |
| Business Responsibility | CRUD for staff, hiring, promotion, transfer, termination, archiving, bulk operations, payroll computation, AI summary, analytics |
| Current Consumers | `app/api/v1/staff/route.ts`, `app/api/v1/staff/[id]/route.ts`, `app/api/v1/staff/bulk/route.ts`, `app/api/v1/staff/ocr/route.ts`, `app/api/v1/staff/analytics/route.ts`, `app/api/v1/staff/[id]/ai/route.ts`, `app/api/v1/staff/[id]/timeline/route.ts` |
| Runtime Usage | Routes instantiate `new StaffService()` per request (no singleton) |

**Can the current service satisfy this module?** YES

**Why:** `StaffService` implements `IStaffService` and provides comprehensive staff management including hiring, promotion, transfer, termination, payroll, AI summaries, and analytics. All staff-related routes delegate to this service. The service follows the mandatory architecture. No new service is needed.

---

### Module 3: Fee Management

| Attribute | Evidence |
|---|---|
| Existing Service | `FeesService` (`services/fees.service.ts`, 179 lines) |
| Existing Interface | `IFeesService` (`interfaces/IFeesService.ts`, 15 lines) |
| Existing Repository | `FeesRepository` extends `BaseRepository<FeeDocument>` implements `IFeesRepository` |
| Current Dependencies | `FeesRepository`, `AuditService`, `ValidationService`, `FeePersistenceMapper`, `eventBus`, `invalidateCache` |
| Business Responsibility | CRUD for fee records, list fees by student, total revenue, recent payments, pagination |
| Current Consumers | `app/api/v1/fees/route.ts`, `app/api/v1/fees/[id]/route.ts`, `app/api/v1/parents/fees/route.ts` |
| Runtime Usage | Routes instantiate `new FeesService()` per request (no singleton) |

**Can the current service satisfy this module?** YES

**Why:** `FeesService` implements `IFeesService` and provides full CRUD, revenue analytics, and student-specific fee queries. All fee-related routes delegate to this service. No new service is needed.

---

### Module 4: Attendance Management

| Attribute | Evidence |
|---|---|
| Existing Service | `AttendanceService` (`services/attendance.service.ts`, 226 lines) |
| Existing Interface | `IAttendanceService` (`interfaces/IAttendanceService.ts`) |
| Existing Repository | `AttendanceRepository` extends `BaseRepository<AttendanceDocument>` implements `IAttendanceRepository` |
| Current Dependencies | `AttendanceRepository`, `AuditService`, `ValidationService`, `AttendancePersistenceMapper`, `eventBus`, `invalidateCache` |
| Business Responsibility | Mark single/bulk attendance, list attendance, find by student, update, delete, today's attendance summary, weekly trend |
| Current Consumers | `app/api/v1/attendance/route.ts`, `app/api/v1/attendance/[id]/route.ts`, `app/api/v1/attendance/export/route.ts`, `app/api/v1/parents/attendance/route.ts` |
| Runtime Usage | Routes instantiate `new AttendanceService()` per request (no singleton) |

**Can the current service satisfy this module?** YES

**Why:** `AttendanceService` implements `IAttendanceService` and provides full attendance management including single/bulk marking, querying, trends, and summary statistics. No new service is needed.

---

### Module 5: Configuration Management

| Attribute | Evidence |
|---|---|
| Existing Service | `ConfigurationService` (`services/configuration.service.ts`, 231 lines) |
| Existing Interface | `IConfigurationService` (`interfaces/IConfigurationService.ts`) |
| Existing Repository | `ConfigurationRepository` extends `BaseRepository<any>` implements `IConfigurationRepository` |
| Current Dependencies | `ConfigurationRepository`, `ConfigurationCacheService`, `ConfigurationHealthService`, `eventBus`, `mapConfigurationToViewModel`, `mapHistory` |
| Business Responsibility | Load, save, publish school configuration; health checks; configuration history; view model mapping |
| Current Consumers | `app/api/v1/settings/school-configuration/route.ts`, `app/api/v1/settings/general/route.ts`, `app/api/v1/configuration/dashboard/route.ts` |
| Runtime Usage | Singleton export: `configurationService = new ConfigurationService()` |

**Can the current service satisfy this module?** YES

**Why:** `ConfigurationService` implements `IConfigurationService` and provides configuration lifecycle management with caching and health checks. The configuration dashboard route (`app/api/v1/configuration/dashboard/route.ts`) already delegates to `ConfigurationDashboardService` (a separate service created in Phase 1 of the ADR-001 refactoring). No new service is needed.

---

### Module 6: Configuration Dashboard (REFACTOR TARGET)

| Attribute | Evidence |
|---|---|
| Existing Service | `ConfigurationDashboardService` (`services/configuration-dashboard.service.ts`, 280 lines) — CREATED in ADR-001 Phase 1 |
| Existing Interface | `IConfigurationDashboardService` (`interfaces/IConfigurationDashboardService.ts`, 33 lines) |
| Existing Repository | 7 repositories: `ConfigurationRepository`, `AcademicYearRepository`, `ClassRepository`, `SectionRepository`, `StudentRepository`, `StaffRepository`, `ParentsRepository` |
| Current Dependencies | All 7 repositories instantiated in constructor and singleton export |
| Business Responsibility | Dashboard metrics aggregation: school info, academic year count, class/section/student/staff/parent counts, configuration completion percentage |
| Current Consumers | `app/api/v1/configuration/dashboard/route.ts` |
| Runtime Usage | Singleton export: `configurationDashboardService = new ConfigurationDashboardService(...)` |

**Can the current service satisfy this module?** YES

**Why:** `ConfigurationDashboardService` was created specifically to refactor the configuration dashboard route away from direct repository instantiation. It implements `IConfigurationDashboardService` and follows the Route → Service → Repository chain. The route now delegates properly. **However**, the service has 7 repository dependencies injected at construction, and `calcCompletion` has a dead `tenantId` parameter. These are tech debt items, not architecture violations.

---

### Module 7: Class Management

| Attribute | Evidence |
|---|---|
| Existing Service | `ClassService` (`services/class.service.ts`, 27 lines) |
| Existing Interface | `IClassService` (`interfaces/IClassService.ts`) |
| Existing Repository | `ClassRepository` extends `BaseRepository<ClassRecord>` implements `IClassRepository` |
| Current Dependencies | `ClassRepository` |
| Business Responsibility | Get all classes, create class, delete class |
| Current Consumers | `app/api/v1/classes/route.ts` (VIOLATION — route uses `SectionRepository` directly, not `ClassService`) |
| Runtime Usage | Singleton export: `classService = new ClassService()` |

**Can the current service satisfy this module?** NO

**Why:** `ClassService` exists but is NOT used by the `app/api/v1/classes/route.ts` route. The route directly instantiates `SectionRepository` and `AuditService`, bypassing the service layer entirely. This violates the mandatory Route → Service → Repository architecture. The route should delegate to `ClassService` or a new `SectionService`.

---

### Module 8: Curriculum Management

| Attribute | Evidence |
|---|---|
| Existing Service | `CurriculumEngineService` (`services/curriculum-engine.service.ts`, 79 lines) |
| Existing Interface | `ICurriculumEngineService` (`interfaces/ICurriculumEngineService.ts`) |
| Existing Repository | `CurriculumRepository` extends `BaseRepository<any>` implements `ICurriculumRepository` |
| Current Dependencies | `CurriculumRepository` |
| Business Responsibility | Generate academic structure from curriculum version; compute required labs and teachers |
| Current Consumers | `app/api/v1/curriculum/upgrade/route.ts`, `app/api/v1/curriculum/load/route.ts`, `app/api/v1/curriculum/preview/route.ts`, `app/api/v1/curriculum/engine/route.ts` |
| Runtime Usage | Singleton export: `curriculumEngine = new CurriculumEngineService()` |

**Can the current service satisfy this module?** YES

**Why:** `CurriculumEngineService` implements `ICurriculumEngineService` and provides curriculum structure generation. The upgrade route (`app/api/v1/curriculum/upgrade/route.ts`) still directly instantiates `ConfigurationRepository` alongside `configurationService`, which is a remaining refactoring target from ADR-001. The curriculum engine service itself is properly architected.

---

### Module 9: Assignment Management

| Attribute | Evidence |
|---|---|
| Existing Service | `AssignmentService` (`services/assignment.service.ts`, 155 lines) |
| Existing Interface | `IAssignmentService` (`interfaces/IAssignmentService.ts`) |
| Existing Repository | `AssignmentRepository` extends `BaseRepository<Assignment>` implements `IAssignmentRepository` |
| Current Dependencies | `AssignmentRepository`, `StorageRepository`, `AuditService`, `ValidationService`, `CreateAssignmentSchema`, `UpdateAssignmentSchema` |
| Business Responsibility | Create/list/get/update/delete assignments, submit assignments, upload files |
| Current Consumers | `app/api/v1/assignments/route.ts`, `app/api/v1/assignments/[id]/route.ts`, `app/api/v1/assignments/submit/route.ts` |
| Runtime Usage | Routes instantiate `new AssignmentService()` per request (no singleton) |

**Can the current service satisfy this module?** YES

**Why:** `AssignmentService` implements `IAssignmentService` and provides full assignment lifecycle management including file uploads. All assignment routes delegate to this service. No new service is needed.

---

### Module 10: Behavior Management

| Attribute | Evidence |
|---|---|
| Existing Service | `BehaviorService` (`services/behavior.service.ts`) |
| Existing Interface | `IBehaviorService` (`interfaces/IBehaviorService.ts`) |
| Existing Repository | `BehaviorRepository` extends `BaseRepository<BehaviorLog>` implements `IBehaviorRepository` |
| Current Dependencies | `BehaviorRepository` |
| Business Responsibility | Record and manage student behavior logs |
| Current Consumers | `app/api/v1/behavior/route.ts` |
| Runtime Usage | Route instantiates service per request |

**Can the current service satisfy this module?** YES

**Why:** `BehaviorService` implements `IBehaviorService` and provides behavior recording functionality. The route delegates to this service. No new service is needed.

---

### Module 11: Book Management

| Attribute | Evidence |
|---|---|
| Existing Service | `BookService` (`services/book.service.ts`) |
| Existing Interface | `IBookService` (`interfaces/IBookService.ts`) |
| Existing Repository | `BookRepository` extends `BaseRepository<Book>` implements `IBookRepository` |
| Current Dependencies | `BookRepository` |
| Business Responsibility | CRUD for books, book center management |
| Current Consumers | `app/api/v1/books/route.ts`, `app/api/v1/books/books/[id]/route.ts`, `app/api/v1/teacher/book-center/page.tsx` |
| Runtime Usage | Routes instantiate service per request |

**Can the current service satisfy this module?** YES

**Why:** `BookService` implements `IBookService` and provides full book management. No new service is needed.

---

### Module 12: Timetable Management

| Attribute | Evidence |
|---|---|
| Existing Service | `TimetableService` (`services/timetable.service.ts`, 90 lines) |
| Existing Interface | `ITimetableService` (`interfaces/ITimetableService.ts`) |
| Existing Repository | `TimetableRepository` extends `BaseRepository<TimetableEntry>` implements `ITimetableRepository` |
| Current Dependencies | `TimetableRepository` |
| Business Responsibility | CRUD for timetable entries, scheduling |
| Current Consumers | `app/api/v1/timetable/route.ts`, `app/(protected)/teacher/...`, `app/(protected)/ai-timetable/page.tsx` |
| Runtime Usage | Routes instantiate service per request |

**Can the current service satisfy this module?** YES

**Why:** `TimetableService` implements `ITimetableService` and provides timetable management. No new service is needed.

---

### Module 13: AI Services (AI Exam, AI Timetable, Report Comments, Smart Book Center, Chatbot, Agents)

| Attribute | Evidence |
|---|---|
| Existing Service | `ExamService` (`services/ai/exam.service.ts`), `TimetableService` (`services/ai/timetable.service.ts`) |
| Existing Interface | `IAIExamService`, `IAITimetableService` |
| Existing Repository | `AiUsageRepository` extends `BaseRepository<AiUsage>` implements `IAiUsageRepository` |
| Current Dependencies | `GeminiProvider`, `AgentRegistry`, `AIGateway` |
| Business Responsibility | AI-powered exam question generation, timetable generation, report comments, book recommendations, chatbot responses |
| Current Consumers | `app/api/v1/ai/exam-questions/route.ts`, `app/api/v1/ai/timetable/route.ts`, `app/api/v1/ai/report-comments/route.ts`, `app/api/v1/ai/smart-book-center/route.ts`, `app/api/v1/ai/chatbot/route.ts`, `app/api/v1/ai/agents/route.ts` |
| Runtime Usage | Routes use `agentRegistry` directly — NO service wrapper |

**Can the current service satisfy this module?** NO

**Why:** The AI routes (`agents`, `chatbot`, `report-comments`, `smart-book-center`) use `AgentRegistry` and `AIGateway` directly from `@/lib/ai/` without any service layer wrapper. This violates the mandatory Route → Service → Repository architecture. External library dependencies (tesseract.js, pdf-parse, mammoth for OCR; Gemini SDK for AI) are coupled to HTTP request lifecycle. No abstraction exists for swapping AI providers. Error handling is duplicated across routes. Security logic (AI prompt injection prevention) is not centralized. **A new `AIService` is required** to wrap all AI-related operations.

---

### Module 14: Billing / Stripe

| Attribute | Evidence |
|---|---|
| Existing Service | None for billing |
| Existing Interface | None for billing |
| Existing Repository | `SubscriptionRepository`, `InvoiceRepository` |
| Current Dependencies | `stripe` SDK used directly in route handler |
| Business Responsibility | Stripe checkout session creation, subscription management, invoice generation |
| Current Consumers | `app/api/v1/stripe/create-checkout/route.ts`, `app/api/v1/stripe/webhook/route.ts` |
| Runtime Usage | Routes use `stripe` SDK directly — NO service wrapper |

**Can the current service satisfy this module?** NO

**Why:** There is no `BillingService` or `SubscriptionService` that wraps Stripe operations. The `stripe/create-checkout/route.ts` uses the Stripe SDK directly, exposing payment flow details in the route handler. The `stripe/webhook/route.ts` processes webhooks directly without a service layer. **A new `BillingService` is required** to centralize payment logic, provide abstraction for payment processor swapping, and enable proper testing.

---

### Module 15: Webhooks / QStash

| Attribute | Evidence |
|---|---|
| Existing Service | None for webhooks |
| Existing Interface | None for webhooks |
| Existing Repository | `EventOutboxRepository` |
| Current Dependencies | `verifyQStashSignature`, `runReportWorker`, `EventWorker` used directly in route |
| Business Responsibility | QStash webhook signature verification, event processing, report worker execution |
| Current Consumers | `app/api/v1/webhooks/qstash/route.ts` (or similar path) |
| Runtime Usage | Route uses external libraries directly — NO service wrapper |

**Can the current service satisfy this module?** NO

**Why:** The webhook route uses `verifyQStashSignature` and `EventWorker` directly without a service wrapper. Security logic (signature verification) is not centralized. **A new `WebhookService` is required** to centralize webhook processing and signature verification.

---

### Module 16: OCR / Document Processing

| Attribute | Evidence |
|---|---|
| Existing Service | `OCRService` (`services/OCRService.ts`) |
| Existing Interface | `IOCRService` (`interfaces/IOCRService.ts`) |
| Existing Repository | None specific to OCR |
| Current Dependencies | `tesseract.js`, `pdf-parse`, `mammoth` used directly in route |
| Business Responsibility | OCR extraction from uploaded documents, admission document processing |
| Current Consumers | `app/api/v1/students/ocr-admission/route.ts`, `app/api/v1/ocr/extract/route.ts`, `app/api/v1/staff/ocr/route.ts` |
| Runtime Usage | Routes use OCR libraries directly — NO service wrapper |

**Can the current service satisfy this module?** NO

**Why:** The OCR admission route (`app/api/v1/students/ocr-admission/route.ts`) uses `tesseract.js`, `pdf-parse`, and `mammoth` directly in the route handler without a service wrapper. There is no file sanitization layer. No abstraction exists for swapping OCR providers. **The existing `OCRService` exists but is not used by the OCR admission route** — the route bypasses it entirely. The route needs to delegate to `OCRService`.

---

### Module 17: Background Jobs

| Attribute | Evidence |
|---|---|
| Existing Service | `JobService` (`services/job.service.ts`) |
| Existing Interface | `IJobService` (`interfaces/IJobService.ts`) |
| Existing Repository | `JobRepository` extends `BaseRepository<Job>` implements `IJobRepository` |
| Current Dependencies | `EventWorker`, `ReportWorker` used directly in routes |
| Business Responsibility | Job scheduling, attendance report generation, fee reminders, event processing |
| Current Consumers | `app/api/v1/jobs/attendance-report/route.ts`, `app/api/v1/jobs/fee-reminder/route.ts`, `app/api/v1/jobs/events/route.ts`, `app/api/v1/jobs/[jobId]/route.ts` |
| Runtime Usage | `attendance-report` and `fee-reminder` routes instantiate repositories directly; `events` route uses `EventWorker` directly |

**Can the current service satisfy this module?** NO (for attendance-report, fee-reminder, events routes)

**Why:** The `attendance-report` route directly instantiates `TenantRepository` and `AttendanceRepository` alongside `AttendanceService`. The `fee-reminder` route directly instantiates `FeesRepository` and `TenantRepository` with no service layer. The `events` route uses `EventWorker` directly. These routes violate the mandatory architecture. **A new `BackgroundJobService` or individual job services are required** to wrap these operations.

---

### Module 18: Education Rules

| Attribute | Evidence |
|---|---|
| Existing Service | None |
| Existing Interface | None |
| Existing Repository | None |
| Current Dependencies | `educationRulesEngine` used directly in route |
| Business Responsibility | Education rules engine for rule-based processing |
| Current Consumers | `app/api/v1/education/rules/route.ts` |
| Runtime Usage | Route uses `educationRulesEngine` directly — NO service wrapper |

**Can the current service satisfy this module?** NO

**Why:** The education rules route uses `educationRulesEngine` directly without any service wrapper. **A new `EducationRulesService` is required** to wrap the education rules engine and provide abstraction.

---

### Module 19: Audit

| Attribute | Evidence |
|---|---|
| Existing Service | `AuditService` (`services/AuditService.ts`, 41 lines) |
| Existing Interface | `IAuditService` (`interfaces/IAuditService.ts`) |
| Existing Repository | `AuditRepository` extends `BaseRepository<AuditLog>` implements `IAuditRepository` |
| Current Dependencies | `AuditRepository`, `logger` |
| Business Responsibility | Audit logging, querying audit logs by tenant |
| Current Consumers | Used by `StaffService`, `AttendanceService`, `FeesService`, `AssignmentService`, `ClassService` (route) |
| Runtime Usage | Instantiated per-service (not singleton) |

**Can the current service satisfy this module?** YES

**Why:** `AuditService` implements `IAuditService` and provides centralized audit logging. It is used by multiple services. No new service is needed.

---

### Module 20: Validation

| Attribute | Evidence |
|---|---|
| Existing Service | `ValidationService` (`services/ValidationService.ts`, 46 lines) |
| Existing Interface | `IValidationService` (`interfaces/IValidationService.ts`) |
| Existing Repository | None |
| Current Dependencies | `zod` |
| Business Responsibility | Zod schema validation with structured error results |
| Current Consumers | `StaffService`, `AttendanceService`, `FeesService`, `AssignmentService`, `OCRService` |
| Runtime Usage | Instantiated per-service (not singleton) |

**Can the current service satisfy this module?** YES

**Why:** `ValidationService` implements `IValidationService` and provides centralized Zod validation. It is reused across multiple services. No new service is needed.

---

### PHASE 1 SUMMARY

| Module | Existing Service | Can Satisfy? | Decision |
|---|---|---|---|
| Student Management | StudentService | YES | KEEP |
| Staff Management | StaffService | YES | KEEP |
| Fee Management | FeesService | YES | KEEP |
| Attendance Management | AttendanceService | YES | KEEP |
| Configuration Management | ConfigurationService | YES | KEEP |
| Configuration Dashboard | ConfigurationDashboardService | YES | KEEP (with tech debt) |
| Class Management | ClassService | NO (route bypasses it) | REVIEW — route must delegate |
| Curriculum Management | CurriculumEngineService | YES | KEEP |
| Assignment Management | AssignmentService | YES | KEEP |
| Behavior Management | BehaviorService | YES | KEEP |
| Book Management | BookService | YES | KEEP |
| Timetable Management | TimetableService | YES | KEEP |
| AI Services | ExamService, TimetableService (partial) | NO — no wrapper for AI routes | NEW SERVICE NEEDED |
| Billing / Stripe | None | NO | NEW SERVICE NEEDED |
| Webhooks / QStash | None | NO | NEW SERVICE NEEDED |
| OCR / Document Processing | OCRService (unused by routes) | NO — routes bypass OCRService | EXTEND + ROUTE REFACTOR |
| Background Jobs | JobService (partial) | NO — routes bypass service | NEW SERVICE NEEDED |
| Education Rules | None | NO | NEW SERVICE NEEDED |
| Audit | AuditService | YES | KEEP |
| Validation | ValidationService | YES | KEEP |

