# EduPilot Enterprise Governance Program (EGP)
## Phase 7 — Interface Matrix
### Version 2.0 | Fortune 500 Architecture Governance Board

---

## PHASE 7: INTERFACE MATRIX

| Interface | Implementations | Consumers | Needed? | Decision |
|---|---|---|---|---|
| IStudentService | StudentService | 8+ route handlers | YES | KEEP |
| IStaffService | StaffService | 7+ route handlers | YES | KEEP |
| IFeesService | FeesService | 3 route handlers | YES | KEEP |
| IAttendanceService | AttendanceService | 4 route handlers | YES | KEEP |
| IConfigurationService | ConfigurationService | 3 route handlers | YES | KEEP |
| IConfigurationDashboardService | ConfigurationDashboardService | 1 route handler | YES | KEEP |
| IClassService | ClassService | 0 (route bypasses it) | YES (for future refactor) | KEEP |
| ICurriculumEngineService | CurriculumEngineService | 4 curriculum routes | YES | KEEP |
| IAssignmentService | AssignmentService | 3 route handlers | YES | KEEP |
| IBehaviorService | BehaviorService | 1 route handler | YES | KEEP |
| IBookService | BookService | 2 route handlers | YES | KEEP |
| ITimetableService | TimetableService | 2 route handlers | YES | KEEP |
| IAIExamService | ExamService | 1 AI route | YES | KEEP |
| IAITimetableService | TimetableService (AI) | 1 AI route | YES | KEEP |
| IAIService | **AIService (NEW)** | 8 AI routes | YES | CREATE |
| IBillingService | **BillingService (NEW)** | 2 Stripe routes | YES | CREATE |
| IWebhookService | **WebhookService (NEW)** | 1 webhook route | YES | CREATE |
| IOCRService | OCRService | 0 (routes bypass it) | YES (for future refactor) | KEEP |
| IBackgroundJobService | **BackgroundJobService (NEW)** | 3 job routes | YES | CREATE |
| IEducationRulesService | **EducationRulesService (NEW)** | 1 education route | YES | CREATE |
| IAuthService | AuthService | Auth routes | YES | KEEP |
| ITenantService | TenantService | Setup routes | YES | KEEP |
| ITenantResolver | TenantResolver | Route helpers, middleware | YES | KEEP |
| IClaimsService | ClaimsService | AuthService | YES | KEEP |
| IConfigurationCacheService | ConfigurationCacheService | ConfigurationService | YES | KEEP |
| IConfigurationHealthService | ConfigurationHealthService | ConfigurationService | YES | KEEP |
| IDashboardService | DashboardService | Dashboard route | YES | KEEP |
| ISubscriptionService | SubscriptionService | Subscription routes | YES | KEEP |
| IInvoiceService | InvoiceService | Invoice routes | YES | KEEP |
| IJobService | JobService | Job routes | YES | KEEP |
| IReportService | ReportService | Report routes | YES | KEEP |
| ISessionService | SessionService | Session routes | YES | KEEP |
| IFeatureFlagService | FeatureFlagService | Feature flag routes | YES | KEEP |
| IMarksService | MarksService | Marks routes | YES | KEEP |
| ILessonPlanService | LessonPlanService | Lesson plan routes | YES | KEEP |
| IH homeworkService | HomeworkService | Homework routes | YES | KEEP |
| IQuizService | QuizService | Quiz routes | YES | KEEP |
| IParentService | ParentsService | Parent routes | YES | KEEP |
| IStudentRepository | StudentRepository | StudentService | YES | KEEP |
| IStaffRepository | StaffRepository | StaffService | YES | KEEP |
| IFeesRepository | FeesRepository | FeesService | YES | KEEP |
| IAttendanceRepository | AttendanceRepository | AttendanceService | YES | KEEP |
| IConfigurationRepository | ConfigurationRepository | ConfigurationService | YES | KEEP |
| IClassRepository | ClassRepository | ClassService | YES | KEEP |
| ICurriculumRepository | CurriculumRepository | CurriculumEngineService | YES | KEEP |
| IAssignmentRepository | AssignmentRepository | AssignmentService | YES | KEEP |
| IBehaviorRepository | BehaviorRepository | BehaviorService | YES | KEEP |
| IBookRepository | BookRepository | BookService | YES | KEEP |
| ITimetableRepository | TimetableRepository | TimetableService | YES | KEEP |
| IAiUsageRepository | AiUsageRepository | AIService (NEW) | YES | KEEP |
| ISubscriptionRepository | SubscriptionRepository | BillingService (NEW) | YES | KEEP |
| IInvoiceRepository | InvoiceRepository | BillingService (NEW) | YES | KEEP |
| IJobRepository | JobRepository | BackgroundJobService (NEW) | YES | KEEP |
| IEventOutboxRepository | EventOutboxRepository | WebhookService (NEW) | YES | KEEP |
| IStorageRepository | StorageRepository | AssignmentService, OCRService | YES | KEEP |
| ITenantRepository | TenantRepository | TenantService, BillingService, TelemetryService, BackgroundJobService | YES | KEEP |
| ISettingsRepository | SettingsRepository | Settings routes | YES | KEEP |
| ISectionRepository | SectionRepository | ClassService, Classes route (VIOLATION) | YES | KEEP |
| IUserRepository | UserRepository | AuthService | YES | KEEP |
| IValidationService | ValidationService | StaffService, AttendanceService, FeesService, AssignmentService, OCRService | YES | KEEP |
| IAuditService | AuditService | StaffService, AttendanceService, FeesService, AssignmentService, Classes route | YES | KEEP |
| IDashboardStatsRepository | DashboardStatsRepository | DashboardStats repository | YES | KEEP |
| IFacilityRepository | FacilityRepository | — | YES | KEEP |
| IDepartmentRepository | DepartmentRepository | — | YES | KEEP |
| ILibraryRepository | LibraryRepository | — | YES | KEEP |
| ITransportRepository | TransportRepository | — | YES | KEEP |
| IHostelRepository | HostelRepository | — | YES | KEEP |
| IRoomRepository | RoomRepository | — | YES | KEEP |
| IBuildingRepository | BuildingRepository | — | YES | KEEP |
| IFeeStructureRepository | FeeStructureRepository | — | YES | KEEP |
| IHouseRepository | HouseRepository | — | YES | KEEP |
| IShiftRepository | ShiftRepository | — | YES | KEEP |
| IGradingRepository | GradingRepository | — | YES | KEEP |
| IAddonsRepository | AddonsRepository | — | YES | KEEP |
| ILeaveRepository | LeaveRepository | — | YES | KEEP |
| ILedgerRepository | LedgerRepository | — | YES | KEEP |
| IChatRepository | ChatRepository | — | YES | KEEP |
| IVideoLectureRepository | VideoLectureRepository | — | YES | KEEP |
| IFeatureFlagRepository | FeatureFlagRepository | — | YES | KEEP |
| IAcademicYearRepository | AcademicYearRepository | — | YES | KEEP |
| IConfigurationDashboardService | ConfigurationDashboardService | 1 route | YES | KEEP |
| ITenantBrandingRepository | TenantBrandingRepository | — | YES | KEEP |
| ITenantBrandingService | TenantBrandingService | — | YES | KEEP |
| ITenantSetupRepository | TenantSetupRepository | — | YES | KEEP |
| IShiftRepository | ShiftRepository | — | YES | KEEP |
| IBusRepository | BusRepository | — | YES | KEEP |
| ICampusRepository | — | — | YES | KEEP |
| IAIGateway | AIGateway | AIService (NEW) | YES | CREATE |

---

### Interfaces to Remove

| Interface | Reason |
|---|---|
| None | All interfaces serve a measurable purpose (abstraction, mocking, testing, dependency inversion) |

---

### Interfaces to Merge

| Interface | Merge With | Reason |
|---|---|---|
| IAIGateway | IAIService | Gateway is an implementation detail of the AI service; merge into IAIService |

---

