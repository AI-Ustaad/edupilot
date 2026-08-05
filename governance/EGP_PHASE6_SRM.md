# EduPilot Enterprise Governance Program (EGP)
## Phase 6 — Service Responsibility Matrix
### Version 2.0 | Fortune 500 Architecture Governance Board

---

## PHASE 6: SERVICE RESPONSIBILITY MATRIX

| Service | Current Responsibility | New Responsibility | SRP Safe | Decision |
|---|---|---|---|---|
| StudentService | Student CRUD, admission, 360, comments, promotion, archiving, bulk import, analytics | None | YES | KEEP |
| StaffService | Staff CRUD, hiring, promotion, transfer, termination, archiving, bulk ops, payroll, AI summary, analytics | None | YES | KEEP |
| FeesService | Fee CRUD, list by student, revenue, recent payments | None | YES | KEEP |
| AttendanceService | Attendance CRUD, single/bulk marking, querying, trends, summary | None | YES | KEEP |
| ConfigurationService | Config load/save/publish, health checks, history, view models | None | YES | KEEP |
| ConfigurationDashboardService | Dashboard metrics aggregation from 7 repos | None | YES (design smell: 7 deps) | KEEP |
| ClassService | Class CRUD (getAll, create, delete) | None | YES | KEEP |
| CurriculumEngineService | Academic structure generation from curriculum version | None | YES | KEEP |
| AssignmentService | Assignment CRUD, submissions, file uploads | None | YES | KEEP |
| BehaviorService | Behavior log recording | None | YES | KEEP |
| BookService | Book CRUD, book center | None | YES | KEEP |
| TimetableService | Timetable CRUD, scheduling | None | YES | KEEP |
| ExamService (AI) | AI exam question generation | None | YES | KEEP |
| TimetableService (AI) | AI timetable generation | None | YES | KEEP |
| OCRService | OCR text extraction from images/PDFs/Word docs | File sanitization, validation, provider abstraction | YES | EXTEND |
| AuditService | Audit logging, querying | None | YES | KEEP |
| ValidationService | Zod schema validation | None | YES | KEEP |
| AuthService | Auth operations (create user, login, token, claims) | None | YES | KEEP |
| TenantService | School setup, academic year initialization | None | YES | KEEP |
| TenantResolver | Tenant ID resolution from request context | None | YES | KEEP |
| ClaimsService | User claims synchronization | None | YES | KEEP |
| ConfigurationCacheService | Configuration caching (get/set/invalidate) | None | YES | KEEP |
| ConfigurationHealthService | Configuration health checking | None | YES | KEEP |
| DashboardService | Dashboard data aggregation (students, staff, fees, attendance) | None | YES | KEEP |
| SubscriptionService | Subscription CRUD, activation, cancellation | None | YES | KEEP |
| InvoiceService | Invoice generation and management | None | YES | KEEP |
| JobService | Job CRUD, status tracking | None | YES | KEEP |
| ReportService | Report generation (PDF, document) | None | YES | KEEP |
| SessionService | Session management | None | YES | KEEP |
| SettingsGeneralService | General settings management | None | YES | KEEP |
| SyllabusService | Syllabus CRUD | None | YES | KEEP |
| TelemetryService | SaaS metrics (tenants, subscriptions, MRR, DAU) | None | YES | KEEP |
| TenantBrandingService | Tenant branding (get/save) | None | YES | KEEP |
| UploadService | File upload handling | None | YES | KEEP |
| UserAdminService | User admin operations | None | YES | KEEP |
| VideoLectureService | Video lecture CRUD | None | YES | KEEP |
| AddonsService | Addon management | None | YES | KEEP |
| AdmitCardService | Admit card generation | None | YES | KEEP |
| AnalyticsService | Analytics data aggregation | None | YES | KEEP |
| CertificateService | Certificate generation | None | YES | KEEP |
| ChatService | Chat message handling | None | YES | KEEP |
| LeaveService | Leave request CRUD | None | YES | KEEP |
| LedgerService | Ledger entry management | None | YES | KEEP |
| LessonPlanService | Lesson plan CRUD | None | YES | KEEP |
| MarksService | Marks entry, bulk publish, skills | None | YES | KEEP |
| MenuService | Menu CRUD | None | YES | KEEP |
| ParentsService | Parent CRUD, linking | None | YES | KEEP |
| QuizService | Quiz CRUD, submissions, results | None | YES | KEEP |
| FeatureFlagService | Feature flag management | None | YES | KEEP |
| FeeReminderService | Fee reminder processing | None | YES | KEEP |
| CurriculumModulesService | Configuration modules access (rooms, buildings, etc.) | None | YES | KEEP |
| AIService | **NEW** — AI operations abstraction (exam, timetable, report, chatbot, book center) | Wrap AgentRegistry, AIGateway, GeminiProvider | YES | NEW SERVICE |
| BillingService | **NEW** — Payment processing abstraction (Stripe checkout, webhooks, subscriptions) | Wrap Stripe SDK, subscription management | YES | NEW SERVICE |
| WebhookService | **NEW** — Webhook processing abstraction (QStash signatures, event routing) | Wrap verifyQStashSignature, EventWorker | YES | NEW SERVICE |
| BackgroundJobService | **NEW** — Background job orchestration (attendance reports, fee reminders, events) | Wrap EventWorker, ReportWorker, job repos | YES | NEW SERVICE |
| EducationRulesService | **NEW** — Education rules engine abstraction | Wrap educationRulesEngine | YES | NEW SERVICE |

---

### Services Requiring Extension

| Service | Extension | Reason |
|---|---|---|
| OCRService | Add file sanitization, validation, provider abstraction | Current OCRService exists but is not used by OCR admission route; routes bypass it |

---

### Services Requiring Split

| Service | Split Target | Reason |
|---|---|---|
| StaffService | Split AI summary into AIService | `getAISummary()` in StaffService couples AI logic to staff domain; AI is a cross-cutting concern |
| DashboardService | Split into read-model service | 4 direct service dependencies create tight coupling; consider CQRS read model |

---

### Services Requiring Removal

| Service | Reason |
|---|---|
| None | All existing services serve a valid purpose |

---

