# EduPilot Backend Architecture Audit

**Date:** 2026-08-04
**Scope:** All API routes under `app/api/`
**Mandatory Architecture:** Route → Application Service → Repository → Firestore
**Rule:** No route may instantiate repositories directly, access adminDb/Firestore directly, or contain business logic that belongs in a service.

---

## 1. Complete Route Audit Table

### 1.1 Routes Following Architecture Correctly (KEEP)

These routes properly delegate to a service layer without direct repository or Firestore access.

| Route | Current Architecture | Target Architecture | Business Risk | Refactor Required | Estimated Impact |
|---|---|---|---|---|---|
| `app/api/health/route.ts` | MINIMAL_OR_STATIC | ROUTE → SERVICE → REPOSITORY → FIRESTORE | NONE | NONE | Trivial |
| `app/api/sentry-example-api/route.ts` | MINIMAL_OR_STATIC | ROUTE → SERVICE → REPOSITORY → FIRESTORE | NONE | NONE | Trivial |
| `app/api/v1/academic-year/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/academic-year/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/addons/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/admin/feature-flags/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/admin/parents/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/admin/rebuild-stats/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/admin/users/role/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/admin/users/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/admissions/approve/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/admit-cards/bulk/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/ai/exam-paper/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/ai/exam-questions/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/ai/timetable/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/analytics/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/assignments/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/assignments/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/assignments/submit/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/attendance/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/attendance/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/attendance/export/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/audit/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/auth/login/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/auth/parent-login/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/auth/register-user/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/auth/session/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/behavior/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/books/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/books/books/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/buses/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/buses/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/certificate/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/chat/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/create-user/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/cron/fee-reminder/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/curriculum/engine/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/dashboard/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/feature-flags/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/feature-flags/disabled/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/fees/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/fees/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/gdpr/delete/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/gdpr/export/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/homework/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/jobs/[jobId]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/leave/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/leave/arrange/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/ledger/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/lesson-plans/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/marks/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/marks/bulk/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/marks/publish/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/marks/skills/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/menu/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/parents/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/parents/attendance/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/parents/dashboard/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/parents/fees/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/parents/results/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/protected-data/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/quizzes/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/quizzes/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/quizzes/results/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/quizzes/submit/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/reports/generate-bulk/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/reports/generate/route.tsx` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/results/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/settings/curriculum/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/settings/general/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/settings/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/settings/whitelabel/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/staff/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/staff/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/staff/[id]/ai/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/staff/[id]/timeline/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/staff/analytics/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/staff/bulk/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/staff/ocr/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/stripe/webhook/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/students/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/students/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/students/[id]/comment/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/students/[id]/timeline/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/students/bulk/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/students/get/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/students/promote/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/students/risk/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/students/360/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/subscriptions/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/subscriptions/activate/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/super-admin/analytics/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/super-admin/telemetry/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/syllabus/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/syllabus/[id]/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/timetable/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/upload/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/users/register-school/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/video-lectures/route.ts` | ROUTE_TO_SERVICE_REPO | ROUTE → SERVICE → REPOSITORY → FIRESTORE | LOW | MINOR | Low |
| `app/api/v1/auth/logout/route.ts` | MINIMAL_OR_STATIC | ROUTE → SERVICE → REPOSITORY → FIRESTORE | NONE | NONE | Trivial |
| `app/api/v1/auth/me/route.ts` | MINIMAL_OR_STATIC | ROUTE → SERVICE → REPOSITORY → FIRESTORE | NONE | NONE | Trivial |
| `app/api/v1/curriculum/load/route.ts` | MINIMAL_OR_STATIC | ROUTE → SERVICE → REPOSITORY → FIRESTORE | NONE | NONE | Trivial |
| `app/api/v1/curriculum/preview/route.ts` | MINIMAL_OR_STATIC | ROUTE → SERVICE → REPOSITORY → FIRESTORE | NONE | NONE | Trivial |
| `app/api/v1/users/get/route.ts` | MINIMAL_OR_STATIC | ROUTE → SERVICE → REPOSITORY → FIRESTORE | NONE | NONE | Trivial |

### 1.2 Routes Requiring REFACTOR (Repository Direct Access or Mixed Patterns)

| Route | Current Architecture | Target Architecture | Business Risk | Refactor Required | Estimated Impact |
|---|---|---|---|---|---|
| `app/api/v1/classes/route.ts` | ROUTE → REPOSITORY (direct `SectionRepository` instantiation + `AuditService`). Also imports `firebase-admin/firestore` (FieldValue). | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | MAJOR | High |
| `app/api/v1/curriculum/upgrade/route.ts` | ROUTE → REPOSITORY (direct `ConfigurationRepository` instantiation alongside `configurationService`). Route reads config via repo and service, then does business logic (version merging, upgrade patching). | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | MAJOR | High |
| `app/api/v1/jobs/attendance-report/route.ts` | ROUTE → REPOSITORY (direct `AttendanceRepository`, `TenantRepository` instantiation alongside `AttendanceService`). Route iterates tenants, creates service with repo injected, sends emails. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | MAJOR | High |
| `app/api/v1/jobs/fee-reminder/route.ts` | ROUTE → REPOSITORY (direct `FeesRepository`, `TenantRepository` instantiation, no service). Route iterates tenants, queries fees directly, sends emails. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | CREATE_SERVICE | Medium |
| `app/api/v1/configuration/dashboard/route.ts` | ROUTE → REPOSITORY (direct instantiation of 7 repositories: ConfigurationRepository, AcademicYearRepository, ClassRepository, SectionRepository, StudentRepository, StaffRepository, ParentsRepository). No service layer. Route contains business logic (completion calculation, counting). | ROUTE → SERVICE → REPOSITORY → FIRESTORE | CRITICAL | CREATE_SERVICE | High |
| `app/api/v1/ocr/extract/route.ts` | ROUTE → SERVICE (AuditService) but contains business logic (OCR extraction, file type detection, field parsing) directly in the route handler. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | MEDIUM | MINOR | Low |

### 1.3 Routes Requiring CREATE_SERVICE (No Service Exists)

| Route | Current Architecture | Target Architecture | Business Risk | Refactor Required | Estimated Impact |
|---|---|---|---|---|---|
| `app/api/v1/ai/agents/route.ts` | ROUTE → EXTERNAL (uses `agentRegistry` from `@/lib/ai/agents/AgentRegistry` directly in route). Has request validation, error handling, and response formatting in route. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | CREATE_SERVICE | Medium |
| `app/api/v1/ai/chatbot/route.ts` | ROUTE → EXTERNAL (uses `agentRegistry` directly in route). Has request validation and error handling in route. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | CREATE_SERVICE | Medium |
| `app/api/v1/ai/report-comments/route.ts` | ROUTE → EXTERNAL (uses `agentRegistry` directly in route). Has request validation and response formatting in route. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | CREATE_SERVICE | Medium |
| `app/api/v1/ai/smart-book-center/route.ts` | ROUTE → EXTERNAL (uses `agentRegistry` directly in route). Has request validation and response formatting in route. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | CREATE_SERVICE | Medium |
| `app/api/v1/education/rules/route.ts` | ROUTE → EXTERNAL (uses `educationRulesEngine` directly in route). Has switch-based routing, request validation, and error handling in route. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | CREATE_SERVICE | Medium |
| `app/api/v1/stripe/create-checkout/route.ts` | ROUTE → EXTERNAL (uses `stripe` SDK directly in route). Has plan validation, checkout session creation, and URL construction in route. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | CREATE_SERVICE | Medium |
| `app/api/v1/webhooks/qstash/route.ts` | ROUTE → EXTERNAL (uses `verifyQStashSignature`, `runReportWorker`, `EventWorker` directly in route). Has signature verification, payload routing, and error handling in route. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | CREATE_SERVICE | Medium |
| `app/api/v1/students/ocr-admission/route.ts` | ROUTE → EXTERNAL (uses `tesseract.js`, `pdf-parse`, `mammoth` directly in route). Has file type detection, OCR processing, field extraction in route. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | CREATE_SERVICE | Medium |
| `app/api/v1/jobs/events/route.ts` | ROUTE → EXTERNAL (uses `EventWorker` directly in route). Has cron secret validation, batch processing in route. | ROUTE → SERVICE → REPOSITORY → FIRESTORE | HIGH | CREATE_SERVICE | Medium |

### 1.4 Summary Counts

| Category | Count |
|---|---|
| KEEP (correctly follows pattern) | ~95 |
| REFACTOR (repository direct access or mixed patterns) | 6 |
| CREATE_SERVICE (no service exists, business logic in route) | 9 |
| **Total Routes** | **110** |

---

## 2. Route Categorization

### 2.1 KEEP (No Action Required)

Routes that correctly follow Route → Service → Repository → Firestore. These may have minor issues (e.g., `MINOR` refactor for validation logic in route) but are architecturally sound.

**Count:** ~95 routes

**Criteria:**
- Route delegates to an Application Service
- Service handles all business logic and data access
- No direct repository instantiation in the route
- No direct Firestore/adminDb access in the route

### 2.2 REFACTOR (Requires Code Changes)

Routes that violate the architecture by directly instantiating repositories, accessing Firestore directly, or mixing service calls with direct data access.

**Count:** 6 routes

| Route | Violation Type | Severity |
|---|---|---|
| `app/api/v1/classes/route.ts` | Direct `SectionRepository` instantiation + `firebase-admin/firestore` import | HIGH |
| `app/api/v1/curriculum/upgrade/route.ts` | Direct `ConfigurationRepository` instantiation alongside service | HIGH |
| `app/api/v1/jobs/attendance-report/route.ts` | Direct `AttendanceRepository` + `TenantRepository` instantiation alongside service | HIGH |
| `app/api/v1/jobs/fee-reminder/route.ts` | Direct `FeesRepository` + `TenantRepository` instantiation, no service | HIGH |
| `app/api/v1/configuration/dashboard/route.ts` | 7 repositories instantiated directly, no service, business logic in route | CRITICAL |
| `app/api/v1/ocr/extract/route.ts` | Business logic (OCR extraction) in route, only uses AuditService for logging | MEDIUM |

### 2.3 DEFER (Low Priority / Future Consideration)

Routes that are minimal/static or have low risk. These do not need immediate refactoring but should be monitored.

**Count:** ~7 routes

| Route | Reason |
|---|---|
| `app/api/health/route.ts` | Static health check, no data access |
| `app/api/sentry-example-api/route.ts` | Example/demo route |
| `app/api/v1/auth/logout/route.ts` | Session clearing only, no data access |
| `app/api/v1/auth/me/route.ts` | Returns session user, no data access |
| `app/api/v1/curriculum/load/route.ts` | Static/minimal, no data access |
| `app/api/v1/curriculum/preview/route.ts` | Static/minimal, no data access |
| `app/api/v1/users/get/route.ts` | Returns session user, no data access |

---

## 3. Phased Migration Plan

### Phase 1: Zero-Risk Refactors (Immediate)

**Goal:** Fix routes where business logic and data access are incorrectly placed in the route handler, creating immediate architectural violations and maintenance risks.

**Routes:**

| Route | Action | Description |
|---|---|---|
| `app/api/v1/configuration/dashboard/route.ts` | CREATE_SERVICE | Extract all 7 repository calls and completion calculation logic into a `DashboardConfigurationService`. Route should only handle HTTP concerns (auth, tenant context, response formatting). |
| `app/api/v1/jobs/fee-reminder/route.ts` | CREATE_SERVICE | Extract fee querying and email sending logic into a `FeeReminderCronService`. Route should only handle cron authentication and response formatting. |
| `app/api/v1/classes/route.ts` | CREATE_SERVICE + REMOVE_REPO | Extract `SectionRepository` usage and audit logging into a `ClassService`. Remove `firebase-admin/firestore` import and `FieldValue` usage from route. |
| `app/api/v1/curriculum/upgrade/route.ts` | CREATE_SERVICE | Extract `ConfigurationRepository` usage and version merging logic into a `CurriculumUpgradeService`. Route should only handle HTTP concerns. |
| `app/api/v1/jobs/attendance-report/route.ts` | CREATE_SERVICE | Extract tenant iteration, attendance querying, and email sending into an `AttendanceReportService`. Remove direct `AttendanceRepository` and `TenantRepository` instantiation from route. |
| `app/api/v1/ocr/extract/route.ts` | MINOR | Move OCR extraction logic (file type detection, field parsing, buffer conversion) into an `OcrExtractionService`. Route should only handle file upload and response formatting. |

**Estimated Effort:** 2-3 sprints
**Risk:** Low (each refactor is well-scoped and isolated)
**Validation:** Run existing unit tests after each refactor

### Phase 2: Medium Complexity (After Phase 1 Approval)

**Goal:** Create missing service layers for routes that currently bypass the service layer entirely, using external libraries or engines directly.

**Routes:**

| Route | Action | Description |
|---|---|---|
| `app/api/v1/ai/agents/route.ts` | CREATE_SERVICE | Create `AIAgentsService` that wraps `agentRegistry`. Route delegates to service for agent execution, listing, and error handling. |
| `app/api/v1/ai/chatbot/route.ts` | CREATE_SERVICE | Create `AIChatbotService` that wraps `agentRegistry`. Route delegates to service for chat execution and response formatting. |
| `app/api/v1/ai/report-comments/route.ts` | CREATE_SERVICE | Create `AIReportService` that wraps `agentRegistry` for report comment generation. |
| `app/api/v1/ai/smart-book-center/route.ts` | CREATE_SERVICE | Create `AIBookCenterService` that wraps `agentRegistry` for book search and recommendations. |
| `app/api/v1/education/rules/route.ts` | CREATE_SERVICE | Create `EducationRulesService` that wraps `educationRulesEngine`. Route delegates to service for all rule-based queries. |
| `app/api/v1/stripe/create-checkout/route.ts` | CREATE_SERVICE | Create `BillingService` that wraps Stripe checkout session creation, plan validation, and subscription activation. |
| `app/api/v1/webhooks/qstash/route.ts` | CREATE_SERVICE | Create `QstashWebhookService` that handles signature verification, payload routing, and worker dispatch. |
| `app/api/v1/students/ocr-admission/route.ts` | CREATE_SERVICE | Create `OcrAdmissionService` that wraps Tesseract.js, PDF parsing, and field extraction logic. |
| `app/api/v1/jobs/events/route.ts` | CREATE_SERVICE | Create `EventProcessingService` that wraps `EventWorker` batch processing. |

**Estimated Effort:** 4-6 sprints
**Risk:** Medium (service creation requires careful interface design and testing)
**Validation:** Integration tests for each new service; verify routes still pass after refactor

### Phase 3: Large Architectural Refactors (Long-Term)

**Goal:** Address systemic issues across multiple routes, standardize service patterns, and establish governance controls.

**Initiatives:**

| Initiative | Description | Routes Affected |
|---|---|---|
| **Service Layer Standardization** | Enforce a consistent service pattern: all services must be instantiated via dependency injection, not `new` in routes. Consider a service factory or container. | All ~95 KEEP routes |
| **Repository Access Governance** | Add lint rules or architectural tests that prevent direct repository instantiation in route files. Routes must go through a service. | All routes |
| **Business Logic Extraction** | Audit all routes for validation logic, data transformations, and conditional logic that should be in services. Move route-level business logic to services. | All REFACTOR + CREATE_SERVICE routes |
| **Cron/Job Service Pattern** | Establish a standard pattern for cron and background job routes: they must use a service that encapsulates all business logic and data access. | `jobs/*`, `cron/*` routes |
| **Webhook Service Pattern** | Establish a standard pattern for webhook routes: signature verification, payload parsing, and event routing must be in a service. | `webhooks/*`, `stripe/webhook` |
| **AI/ML Service Abstraction** | Create a unified AI service layer that abstracts all AI/ML operations (agent registry, exam generation, OCR, report comments). | All AI routes |

**Estimated Effort:** 6-12 sprints
**Risk:** High (systemic changes require careful coordination and testing)
**Validation:** Full test suite; architecture compliance checks; performance benchmarks

---

## 4. Critical Findings

### 4.1 Most Critical Violation

**`app/api/v1/configuration/dashboard/route.ts`** is the most architecturally violated route:
- Instantiates 7 repositories directly in route-level scope
- Contains business logic (completion percentage calculation, data aggregation)
- Has no corresponding service
- Will become unmaintainable as configuration modules grow

### 4.2 Systemic Issue: `new Service()` in Routes

The majority of routes instantiate services directly (`new AcademicYearService()`). While this follows the Route → Service → Repository pattern at a high level, it violates dependency injection best practices. Services should be injected, not manually instantiated. This should be addressed in Phase 3.

### 4.3 Missing Service Layer for AI Features

All AI-related routes (`ai/agents`, `ai/chatbot`, `ai/report-comments`, `ai/smart-book-center`) use `agentRegistry` directly from `@/lib/ai/agents/AgentRegistry` without a service wrapper. This means AI logic is not testable in isolation and cannot be swapped for alternative implementations.

### 4.4 Cron/Job Routes Bypass Service Layer

Three cron/job routes (`jobs/fee-reminder`, `jobs/attendance-report`, `jobs/events`) either directly instantiate repositories or use workers directly without a service layer. These are particularly risky because they run on schedules and errors are harder to debug.

---

## 5. Governance Recommendations

1. **Add architectural lint rules** to prevent direct repository imports in route files
2. **Require service layer review** for any new route that touches Firestore
3. **Establish a service template** that all new services must follow
4. **Add architecture compliance checks** to CI/CD pipeline
5. **Create a service registry** to track which services exist and which routes use them
6. **Mandate dependency injection** for all services (no `new Service()` in routes)

---

## 6. Approval Gate

**No code modifications shall be made until this audit is reviewed and approved by the Architecture Governance Board.**

- [ ] Audit reviewed and approved
- [ ] Phase 1 plan approved
- [ ] Phase 2 plan approved (contingent on Phase 1 completion)
- [ ] Phase 3 plan approved (contingent on Phase 2 completion)
