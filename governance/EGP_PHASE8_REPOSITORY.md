# EduPilot Enterprise Governance Program (EGP)
## Phase 8 — Repository Matrix
### Version 2.0 | Fortune 500 Architecture Governance Board

---

## PHASE 8: REPOSITORY MATRIX

| Repository | Current Owner | Used By | Cross Domain? | Decision |
|---|---|---|---|---|
| StudentRepository | StudentService | StudentService, ConfigurationDashboardService | YES (dashboard) | KEEP |
| StaffRepository | StaffService | StaffService, ConfigurationDashboardService | YES (dashboard) | KEEP |
| FeesRepository | FeesService | FeesService, BackgroundJobService (NEW) | YES (jobs) | KEEP |
| AttendanceRepository | AttendanceService | AttendanceService, BackgroundJobService (NEW) | YES (jobs) | KEEP |
| ConfigurationRepository | ConfigurationService | ConfigurationService, ConfigurationDashboardService, CurriculumEngineService | YES | KEEP |
| AcademicYearRepository | AcademicYearService | ConfigurationDashboardService | YES (dashboard) | KEEP |
| ClassRepository | ClassService | ConfigurationDashboardService | YES (dashboard) | KEEP |
| SectionRepository | ClassService | Classes route (VIOLATION), ConfigurationDashboardService | YES | KEEP |
| ParentsRepository | ParentsService | ConfigurationDashboardService | YES (dashboard) | KEEP |
| TenantRepository | TenantService | TenantService, TelemetryService, BillingService (NEW), BackgroundJobService (NEW) | YES | KEEP |
| TenantSetupRepository | TenantService | TenantService | NO | KEEP |
| TenantBrandingRepository | TenantBrandingService | TenantBrandingService | NO | KEEP |
| AuthRepository | AuthService | AuthService, ClaimsService | NO | KEEP |
| UserRepository | AuthService | AuthService | NO | KEEP |
| AuditRepository | AuditService | AuditService, TelemetryService | YES | KEEP |
| SubscriptionRepository | SubscriptionService | TelemetryService, BillingService (NEW) | YES | KEEP |
| InvoiceRepository | InvoiceService | BillingService (NEW) | YES | KEEP |
| JobRepository | JobService | BackgroundJobService (NEW) | YES | KEEP |
| EventOutboxRepository | EventWorker | WebhookService (NEW) | YES | KEEP |
| AiUsageRepository | AIService (NEW) | AIService (NEW) | NO | KEEP |
| StorageRepository | AssignmentService | AssignmentService, OCRService | YES | KEEP |
| CurriculumRepository | CurriculumEngineService | CurriculumEngineService | NO | KEEP |
| DashboardStatsRepository | DashboardService | DashboardService | NO | KEEP |
| FeatureFlagRepository | FeatureFlagService | FeatureFlagService | NO | KEEP |
| AddonsRepository | AddonsService | AddonsService | NO | KEEP |
| BehaviorRepository | BehaviorService | BehaviorService | NO | KEEP |
| BookRepository | BookService | BookService | NO | KEEP |
| BusRepository | BusService | BusService | NO | KEEP |
| ChatRepository | ChatService | ChatService | NO | KEEP |
| DepartmentRepository | — | ConfigurationModulesService | YES | KEEP |
| FeeStructureRepository | — | ConfigurationModulesService | YES | KEEP |
| GradingRepository | — | ConfigurationModulesService | YES | KEEP |
| HouseRepository | — | ConfigurationModulesService | YES | KEEP |
| HostelRepository | — | ConfigurationModulesService | YES | KEEP |
| LibraryRepository | — | ConfigurationModulesService | YES | KEEP |
| RoomRepository | — | ConfigurationModulesService | YES | KEEP |
| BuildingRepository | — | ConfigurationModulesService | YES | KEEP |
| FacilityRepository | — | ConfigurationModulesService | YES | KEEP |
| LeaveRepository | LeaveService | LeaveService | NO | KEEP |
| LedgerRepository | LedgerService | LedgerService | NO | KEEP |
| LessonPlanRepository | LessonPlanService | LessonPlanService | NO | KEEP |
| MarksRepository | MarksService | MarksService | NO | KEEP |
| MenuRepository | MenuService | MenuService | NO | KEEP |
| QuizRepository | QuizService | QuizService | NO | KEEP |
| SettingsRepository | SettingsGeneralService | SettingsGeneralService | NO | KEEP |
| ShiftRepository | — | ConfigurationModulesService | YES | KEEP |
| SyllabusRepository | SyllabusService | SyllabusService | NO | KEEP |
| TimetableRepository | TimetableService | TimetableService | NO | KEEP |
| TransportRepository | — | ConfigurationModulesService | YES | KEEP |
| VideoLectureRepository | VideoLectureService | VideoLectureService | NO | KEEP |
| BaseRepository | All repositories | All repositories | N/A (base class) | KEEP |

---

### Cross-Domain Repository Usage Summary

| Repository | Owner Domain | Consumed By | Target Domain | Risk |
|---|---|---|---|---|
| StudentRepository | Student | ConfigurationDashboardService | Dashboard | LOW (read-only) |
| StaffRepository | Staff | ConfigurationDashboardService | Dashboard | LOW (read-only) |
| FeesRepository | Fees | BackgroundJobService | Jobs | LOW (read-only) |
| AttendanceRepository | Attendance | BackgroundJobService | Jobs | LOW (read-only) |
| TenantRepository | Tenant | TelemetryService, BillingService, BackgroundJobService | SaaS, Billing, Jobs | MEDIUM (write access) |
| ConfigurationRepository | Configuration | CurriculumEngineService | Curriculum | LOW (read-only) |
| AuditRepository | Audit | TelemetryService | Telemetry | LOW (read-only) |
| SubscriptionRepository | Subscription | BillingService | Billing | MEDIUM (write access) |
| InvoiceRepository | Invoice | BillingService | Billing | MEDIUM (write access) |
| JobRepository | Jobs | BackgroundJobService | Jobs | LOW (same domain) |
| EventOutboxRepository | Events | WebhookService | Webhooks | MEDIUM (write access) |

---

### Repositories to Modify

| Repository | Modification | Reason |
|---|---|---|
| SectionRepository | Add `FieldValue` operation support | Classes route currently imports Firestore SDK directly for FieldValue; move this to repository |
| SectionRepository | Add `softDeleteBySectionId` method | Used by classes route; should be in repository |

---

