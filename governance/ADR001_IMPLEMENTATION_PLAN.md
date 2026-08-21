# ADR001: Implementation Plan — Enterprise Architecture Remediation

**Date:** 2026-08-05  
**Scope:** Backend API routes violating mandatory `Route → Service → Repository → Firestore` architecture  
**Status:** DRAFT  
**Approval Gate:** Requires Architecture Governance Board approval before execution

---

## 1. Executive Summary

This plan addresses 12 architecture violations identified in `ADR001_ARCHITECTURE_REVIEW.md`. All violations are classified as `REFACTOR` — no breaking changes to external APIs are required. The remediation converts direct repository instantiation and missing service wrappers into compliant service-mediated flows.

**Pre-conditions satisfied:**
- TypeScript: 0 compilation errors
- Tests: 698/698 passing across 65 suites
- Build: 85/85 static pages generated successfully
- Circular dependencies: None detected
- Existing service singletons: 7 services, 1 repository already exported as singletons

**Target end state:** Every API route delegates to an Application Service. No route instantiates repositories directly. No route imports `firebase-admin/firestore`.

---

## 2. Global Dependency Injection Strategy

This project uses **Next.js 14 App Router** with no formal DI container. The established pattern is **module-level singleton exports**.

### 2.1 Singleton Convention

```typescript
// services/<feature>.service.ts
export class FeatureService implements IFeatureService { ... }
export const featureService = new FeatureService();
```

```typescript
// repositories/<feature>.repository.ts
export class FeatureRepository extends BaseRepository<T> implements IFeatureRepository { ... }
export const featureRepository = new FeatureRepository();
```

### 2.2 Route Consumption

```typescript
// app/api/v1/<feature>/route.ts
import { featureService } from "@/services/feature.service";
import { featureRepository } from "@/repositories/feature.repository";
```

### 2.3 Service Constructor Injection

Services receive repositories via constructor parameters. Singleton export holds the composed instance.

```typescript
// services/dashboard.service.ts
export class DashboardService {
  constructor(
    private readonly configRepo: ConfigurationRepository,
    private readonly academicYearRepo: AcademicYearRepository,
    // ...
  ) {}
}
export const dashboardService = new DashboardService(
  new ConfigurationRepository(),
  new AcademicYearRepository(),
  // ...
);
```

### 2.4 Repository Singleton Scope

Repositories are stateless and extend `BaseRepository`. Exporting singletons reduces per-request instantiation overhead and aligns with the existing `classRepository` singleton pattern.

---

## 3. Route-by-Route Implementation Plan

### 3.1 `app/api/v1/configuration/dashboard/route.ts`

**Severity:** CRITICAL  
**Migration Order:** 1

#### Current Architecture
- Route instantiates 7 repositories at module scope: `ConfigurationRepository`, `AcademicYearRepository`, `ClassRepository`, `SectionRepository`, `StudentRepository`, `StaffRepository`, `ParentsRepository`
- Business logic for aggregating dashboard metrics lives in the route handler
- No service-layer validation, authorization, or error handling

#### Target Architecture
- `GET` and `POST` handlers delegate entirely to `DashboardService`
- `DashboardService` orchestrates reads across repositories
- Route handles only HTTP concerns (auth, serialization, status codes)

#### Required Service
**New:** `DashboardService` (`services/dashboard.service.ts`)
- Method: `getDashboardMetrics(tenantId: string): Promise<DashboardMetrics>`
- Method: `refreshDashboardStats(tenantId: string): Promise<void>`
- Aggregates counts from academic year, class, section, student, staff, parent, and configuration repositories

#### Required Repository Changes
- No repository interface changes required
- All 7 referenced repositories already extend `BaseRepository` and implement interfaces
- Export singleton instances from each repository module (if not already exported)

#### Dependency Injection Plan
1. Create `services/dashboard.service.ts`
2. Export `dashboardService` singleton composed with all 7 repository singletons
3. Update route to import `dashboardService` and remove all `new Repository()` calls

#### Estimated Complexity
**High** — 7 repository dependencies, orchestration logic moved from route, potential data-shaping changes

#### Estimated Testing Effort
**4–6 new test cases** in `__tests__/services/dashboard.service.test.ts`
- Unit tests for each aggregation method
- Error-path tests when individual repositories fail
- Integration test ensuring route returns expected shape

#### Rollback Strategy
- Route file revert: restore direct repository instantiation (git revert single commit)
- No database migration required
- Feature flag optional: wrap new service call behind flag for instant cut-back

#### Migration Steps
1. Create `DashboardService` and `IDashboardService`
2. Export `dashboardService` singleton
3. Refactor route handlers to use `dashboardService`
4. Remove direct repository imports and instantiations from route
5. Run architecture compliance tests
6. Deploy and monitor dashboard latency

---

### 3.2 `app/api/v1/classes/route.ts`

**Severity:** HIGH  
**Migration Order:** 2

#### Current Architecture
- Instantiates `SectionRepository` in `GET`, `POST`, and `DELETE` handlers
- Imports `FieldValue` from `firebase-admin/firestore`
- Uses `AuditService` alongside direct repository access

#### Target Architecture
- All class and section operations routed through `ClassService`
- `FieldValue` usage moved into `ClassService` or `SectionRepository` (if server-timestamp logic belongs in repository)
- Route delegates to `ClassService` for section creation/update logic

#### Required Service
**Extend:** `ClassService` (`services/class.service.ts`)
- Add/update methods: `createSectionWithClass(...)`, `deleteSectionWithCleanup(...)`
- Absorb `FieldValue` server-timestamp logic into service or repository helper

#### Required Repository Changes
- `SectionRepository` already exists and extends `BaseRepository`
- No interface changes required
- Ensure `SectionRepository` is exported as singleton

#### Dependency Injection Plan
1. `ClassService` already exported as singleton (`classService`)
2. Inject `SectionRepository` into `ClassService` constructor if not already present
3. Update route to import `classService` and remove `SectionRepository` instantiation
4. Remove `FieldValue` import from route; move to service/repository if still needed

#### Estimated Complexity
**Medium** — `FieldValue` migration requires care to preserve server-timestamp semantics; 3 handlers to refactor

#### Estimated Testing Effort
**3–4 new test cases** in `__tests__/services/class.service.test.ts`
- Section creation via service
- Section deletion cleanup
- Server-timestamp verification

#### Rollback Strategy
- Revert route to direct `SectionRepository` instantiation
- `FieldValue` import can be restored instantly
- No data migration required

#### Migration Steps
1. Audit `FieldValue` usage in route to determine exact operation
2. Add section orchestration methods to `ClassService`
3. Export `sectionRepository` singleton
4. Update route to use `classService` only
5. Run `architecture-compliance.test.ts`
6. Smoke-test class CRUD endpoints

---

### 3.3 `app/api/v1/curriculum/upgrade/route.ts`

**Severity:** HIGH  
**Migration Order:** 3

#### Current Architecture
- Instantiates `ConfigurationRepository` directly in both `GET` and `POST` handlers
- Already uses `configurationService` for some operations, creating mixed access patterns

#### Target Architecture
- All configuration access flows through `ConfigurationService`
- Route becomes a thin HTTP adapter

#### Required Service
**Extend:** `ConfigurationService` (`services/configuration.service.ts`)
- Ensure method exists: `getUpgradeConfiguration(tenantId)`
- Ensure method exists: `applyUpgradeConfiguration(tenantId, payload)`
- Absorb direct `ConfigurationRepository` calls into service methods

#### Required Repository Changes
- `ConfigurationRepository` already exists; export as singleton if not already exported

#### Dependency Injection Plan
1. Verify `ConfigurationService` already holds `ConfigurationRepository` via constructor
2. Update route to import `configurationService` singleton
3. Remove `new ConfigurationRepository()` from both handlers

#### Estimated Complexity
**Low** — Service already exists; route just needs to delegate existing repository calls to the service

#### Estimated Testing Effort
**2 new test cases** in `__tests__/services/configuration.service.test.ts`
- GET upgrade config via service
- POST upgrade config via service

#### Rollback Strategy
- Revert route file to direct repository instantiation
- Service methods remain available for other consumers

#### Migration Steps
1. Review `ConfigurationService` for missing upgrade methods
2. Add missing methods if needed
3. Update route handlers
4. Run architecture compliance tests

---

### 3.4 `app/api/v1/jobs/attendance-report/route.ts`

**Severity:** HIGH  
**Migration Order:** 4

#### Current Architecture
- Instantiates `TenantRepository` and `AttendanceRepository` directly
- Uses `AttendanceService` but also creates `new AttendanceService(new AttendanceRepository())` inline

#### Target Architecture
- Single `attendanceService` singleton used throughout
- `AttendanceService` already composes `AttendanceRepository`
- `TenantRepository` access moved into `AttendanceService` or a shared `TenantAwareService` base

#### Required Service
**Extend:** `AttendanceService` (`services/attendance.service.ts`)
- Inject `TenantRepository` if tenant resolution is needed for report generation
- Export singleton `attendanceService`

#### Required Repository Changes
- `AttendanceRepository` and `TenantRepository` already exist
- Export both as singletons

#### Dependency Injection Plan
1. Export `attendanceService` singleton composed with `AttendanceRepository` and `TenantRepository`
2. Update route to import `attendanceService`
3. Remove all direct repository instantiation and inline `new AttendanceService(...)`

#### Estimated Complexity
**Medium** — Inline service instantiation pattern must be replaced with singleton import; tenant context may need propagation

#### Estimated Testing Effort
**3 new test cases** in `__tests__/services/attendance.service.test.ts`
- Report generation with tenant context
- Error handling for missing tenant

#### Rollback Strategy
- Revert route to inline instantiation
- Service singleton remains usable by other routes

#### Migration Steps
1. Update `AttendanceService` constructor to accept `TenantRepository`
2. Export singleton
3. Refactor route
4. Validate report generation output

---

### 3.5 `app/api/v1/jobs/fee-reminder/route.ts`

**Severity:** HIGH  
**Migration Order:** 5

#### Current Architecture
- Instantiates `FeesRepository` and `TenantRepository` directly
- No service layer exists for fee reminder job logic

#### Target Architecture
- New `FeeReminderService` orchestrates fee lookup, tenant resolution, and reminder dispatch
- Route delegates to service

#### Required Service
**New:** `FeeReminderService` (`services/fee-reminder.service.ts`)
- Method: `sendFeeReminders(tenantId: string): Promise<ReminderResult>`
- Composes `FeesRepository` and `TenantRepository`
- Handles reminder eligibility logic and dispatch (e.g., QStash or email)

#### Required Repository Changes
- `FeesRepository` and `TenantRepository` already exist
- Export as singletons

#### Dependency Injection Plan
1. Create `FeeReminderService` with repository dependencies
2. Export `feeReminderService` singleton
3. Update route to import `feeReminderService`
4. Remove direct repository instantiation

#### Estimated Complexity
**Medium** — New service creation, business logic extraction from route handler

#### Estimated Testing Effort
**4 new test cases** in `__tests__/services/fee-reminder.service.test.ts`
- Reminder eligibility filtering
- Tenant-scoped reminder dispatch
- Empty result handling

#### Rollback Strategy
- Revert route to direct repository usage
- New service remains in codebase (additive)

#### Migration Steps
1. Extract reminder logic from route into `FeeReminderService`
2. Export singleton
3. Update route
4. Test end-to-end reminder job

---

### 3.6 `app/api/v1/reports/generate/route.tsx`

**Severity:** MEDIUM  
**Migration Order:** 6

#### Current Architecture
- Uses dynamic `import("@/repositories/student.repository")` inside handler
- `StudentRepository` instantiated per request via dynamic import

#### Target Architecture
- Import `StudentRepository` singleton at module top-level (or via `StudentService`)
- Route uses static import

#### Required Service
**Optional:** `ReportService` already exists (`services/report.service.ts`). Verify it exposes the needed student-report methods. If not, extend it.

#### Required Repository Changes
- `StudentRepository` already exists; export as singleton

#### Dependency Injection Plan
1. Export `studentRepository` singleton
2. Replace dynamic import with static import in route
3. If report logic is non-trivial, delegate to `ReportService`

#### Estimated Complexity
**Low** — Mostly a mechanical change from dynamic to static import

#### Estimated Testing Effort
**1–2 test updates** in existing report tests to ensure static import path works

#### Rollback Strategy
- Restore dynamic import pattern
- No service changes required

#### Migration Steps
1. Export `studentRepository` singleton
2. Update route import style
3. Run report generation tests

---

### 3.7 AI Routes (`agents`, `chatbot`, `report-comments`, `smart-book-center`)

**Severity:** MEDIUM  
**Migration Order:** 7

#### Current Architecture
- All four routes import `agentRegistry` from `@/lib/ai/agents/AgentRegistry` directly
- No service wrapper; AI provider coupling lives in route handlers

#### Target Architecture
- New `AIService` wraps `AgentRegistry` and provides stable interface
- Routes import `aiService` singleton
- Enables AI provider swapping without route changes

#### Required Service
**New:** `AIService` (`services/ai.service.ts`)
- Methods: `executeAgent(agentName, context)`, `chatCompletion(messages)`, `generateReportComments(data)`, `recommendBookCenter(params)`
- Internally delegates to `AgentRegistry`
- Handles provider abstraction, retry logic, and error normalization

#### Required Repository Changes
- `AiUsageRepository` already exists for tracking AI consumption
- No changes required

#### Dependency Injection Plan
1. Create `AIService` with `AgentRegistry` injected via constructor
2. Export `aiService` singleton
3. Update all 4 AI routes to import `aiService`
4. Remove direct `AgentRegistry` imports from routes

#### Estimated Complexity
**Medium** — 4 routes to update; service must preserve existing `AgentRegistry` behavior

#### Estimated Testing Effort
**6–8 new test cases** in `__tests__/services/ai.service.test.ts`
- Agent execution pass-through
- Error normalization
- Retry behavior (if added)

#### Rollback Strategy
- Revert each route to direct `AgentRegistry` import individually
- Service remains in codebase for future use

#### Migration Steps
1. Implement `AIService`
2. Migrate one AI route at a time (start with lowest traffic: `report-comments`)
3. Validate agent responses match pre-refactor behavior
4. Migrate remaining 3 routes

---

### 3.8 `app/api/v1/education/rules/route.ts`

**Severity:** MEDIUM  
**Migration Order:** 8

#### Current Architecture
- Imports `educationRulesEngine` from `@/lib/education/rules/EducationRulesEngine` directly
- No service wrapper

#### Target Architecture
- New `EducationRulesService` wraps the engine
- Route delegates to service

#### Required Service
**New:** `EducationRulesService` (`services/education-rules.service.ts`)
- Method: `evaluateRules(studentId, context): Promise<RuleResult[]>`
- Method: `applyRuleSet(tenantId, ruleSet, payload): Promise<void>`

#### Required Repository Changes
- No repository changes required for rule evaluation
- If rules persist results, use existing `BehaviorRepository` or `LedgerRepository`

#### Dependency Injection Plan
1. Create `EducationRulesService`
2. Export singleton
3. Update route import

#### Estimated Complexity
**Low** — Single engine wrapper

#### Estimated Testing Effort
**3 new test cases** in `__tests__/services/education-rules.service.test.ts`

#### Rollback Strategy
- Revert route to direct engine import

#### Migration Steps
1. Create service
2. Update route
3. Run education-rules API test

---

### 3.9 `app/api/v1/stripe/create-checkout/route.ts`

**Severity:** MEDIUM  
**Migration Order:** 9

#### Current Architecture
- Uses `stripe` SDK directly in route handler
- No `BillingService` abstraction

#### Target Architecture
- New `BillingService` wraps Stripe SDK
- Route handles only HTTP; all payment logic in service

#### Required Service
**New:** `BillingService` (`services/billing.service.ts`)
- Method: `createCheckoutSession(tenantId, userId, priceId, successUrl, cancelUrl): Promise<Session>`
- Method: `handleWebhook(event): Promise<void>` (if webhook logic also moves here)
- Encapsulates Stripe SDK version and configuration

#### Required Repository Changes
- `SubscriptionRepository` already exists
- `TenantRepository` already exists
- No interface changes required

#### Dependency Injection Plan
1. Create `BillingService` with Stripe SDK and repositories injected
2. Export `billingService` singleton
3. Update route to use `billingService`
4. Remove direct `stripe` SDK calls from route

#### Estimated Complexity
**Medium** — Payment logic is security-sensitive; must preserve exact Stripe behavior

#### Estimated Testing Effort
**4 new test cases** in `__tests__/services/billing.service.test.ts`
- Checkout session creation
- Webhook handling
- Error scenarios (invalid price, failed payment)

#### Rollback Strategy
- Revert route to direct Stripe SDK usage
- Service remains for future routes

#### Migration Steps
1. Implement `BillingService`
2. Update route
3. Run Stripe webhook tests
4. Verify checkout flow in staging

---

### 3.10 `app/api/v1/webhooks/qstash/route.ts`

**Severity:** MEDIUM  
**Migration Order:** 10

#### Current Architecture
- Uses `verifyQStashSignature`, `runReportWorker`, `EventWorker` directly
- No service wrapper

#### Target Architecture
- New `WebhookService` wraps QStash verification and worker dispatch
- Route validates signature via service, then delegates work

#### Required Service
**New:** `WebhookService` (`services/webhook.service.ts`)
- Method: `verifyAndDispatch(event: QStashEvent): Promise<void>`
- Internally uses `verifyQStashSignature` and routes to workers

#### Required Repository Changes
- `EventOutboxRepository` already exists for event processing
- No changes required

#### Dependency Injection Plan
1. Create `WebhookService`
2. Export singleton
3. Update route

#### Estimated Complexity
**Low** — Signature verification is a thin wrapper

#### Estimated Testing Effort
**2 new test cases** in `__tests__/services/webhook.service.test.ts`

#### Rollback Strategy
- Revert route to direct imports

#### Migration Steps
1. Create service
2. Update route
3. Send test QStash event

---

### 3.11 `app/api/v1/students/ocr-admission/route.ts`

**Severity:** MEDIUM  
**Migration Order:** 11

#### Current Architecture
- Uses `tesseract.js`, `pdf-parse`, `mammoth` directly in route handler
- No sanitization or orchestration layer

#### Target Architecture
- Extend existing `OCRService` (`services/OCRService.ts`) or create `AdmissionOCRService`
- Route delegates file processing to service

#### Required Service
**Extend:** `OCRService`
- Add method: `processAdmissionDocument(file: File, tenantId: string): Promise<AdmissionData>`
- Handle tesseract.js, pdf-parse, mammoth orchestration
- Add file sanitization layer

#### Required Repository Changes
- `StudentRepository` already exists
- No changes required

#### Dependency Injection Plan
1. Extend `OCRService` with admission-specific methods
2. Export `ocrService` singleton (already exists)
3. Update route to use `ocrService`

#### Estimated Complexity
**Medium** — Multiple file format parsers; sanitization logic must be correct

#### Estimated Testing Effort
**4 new test cases** in `__tests__/services/ocr.service.test.ts`
- PDF parsing
- DOCX parsing
- Image OCR
- Error handling for corrupt files

#### Rollback Strategy
- Revert route to direct library usage
- Service remains available

#### Migration Steps
1. Implement admission processing in `OCRService`
2. Update route
3. Test with sample PDF/image/DOCX files

---

### 3.12 `app/api/v1/jobs/events/route.ts`

**Severity:** MEDIUM  
**Migration Order:** 12

#### Current Architecture
- Uses `EventWorker` directly
- No service wrapper

#### Target Architecture
- New `EventJobService` wraps `EventWorker`
- Route triggers job via service

#### Required Service
**New:** `EventJobService` (`services/event-job.service.ts`)
- Method: `processEventJob(jobId: string): Promise<void>`
- Delegates to `EventWorker` internally

#### Required Repository Changes
- `JobRepository` already exists
- No changes required

#### Dependency Injection Plan
1. Create `EventJobService`
2. Export singleton
3. Update route

#### Estimated Complexity
**Low** — Thin wrapper around existing worker

#### Estimated Testing Effort
**2 new test cases** in `__tests__/services/event-job.service.test.ts`

#### Rollback Strategy
- Revert route to direct `EventWorker` import

#### Migration Steps
1. Create service
2. Update route
3. Run job processing test

---

## 4. Repository Changes Summary

| Repository | Action | Rationale |
|---|---|---|
| `ConfigurationRepository` | Export singleton | Used by dashboard and curriculum services |
| `AcademicYearRepository` | Export singleton | Dashboard aggregation |
| `ClassRepository` | Export singleton | Dashboard and class service |
| `SectionRepository` | Export singleton | Class service composition |
| `StudentRepository` | Export singleton | Dashboard and report generation |
| `StaffRepository` | Export singleton | Dashboard aggregation |
| `ParentsRepository` | Export singleton | Dashboard aggregation |
| `AttendanceRepository` | Export singleton | Attendance service composition |
| `TenantRepository` | Export singleton | Fee reminder and attendance services |
| `FeesRepository` | Export singleton | Fee reminder service |
| `AiUsageRepository` | Export singleton | AI service tracking |

All repositories already extend `BaseRepository` and implement typed interfaces. No interface changes are required. The only change is adding `export const <name>Repository = new <Name>Repository();` to each module.

---

## 5. New Services Summary

| Service | File | Status | Dependencies |
|---|---|---|---|
| `DashboardService` | `services/dashboard.service.ts` | NEW | 7 repositories |
| `AIService` | `services/ai.service.ts` | NEW | `AgentRegistry` |
| `BillingService` | `services/billing.service.ts` | NEW | Stripe SDK, `SubscriptionRepository`, `TenantRepository` |
| `WebhookService` | `services/webhook.service.ts` | NEW | `verifyQStashSignature`, `EventOutboxRepository` |
| `EducationRulesService` | `services/education-rules.service.ts` | NEW | `EducationRulesEngine` |
| `FeeReminderService` | `services/fee-reminder.service.ts` | NEW | `FeesRepository`, `TenantRepository` |
| `EventJobService` | `services/event-job.service.ts` | NEW | `EventWorker`, `JobRepository` |

Existing services to extend:
- `ClassService` — add section orchestration
- `AttendanceService` — add `TenantRepository`
- `ConfigurationService` — verify upgrade methods
- `OCRService` — add admission processing

---

## 6. Testing Strategy

### 6.1 Regression Guard
- All 698 existing tests must remain green after each route migration
- Run `npm test` after every route refactor

### 6.2 Architecture Compliance
- `__tests__/architecture-compliance.test.ts` must pass after all migrations
- Add route-level compliance assertions for each refactored route

### 6.3 New Service Tests
Create dedicated test suites for each new service:
- `__tests__/services/dashboard.service.test.ts`
- `__tests__/services/ai.service.test.ts`
- `__tests__/services/billing.service.test.ts`
- `__tests__/services/webhook.service.test.ts`
- `__tests__/services/education-rules.service.test.ts`
- `__tests__/services/fee-reminder.service.test.ts`
- `__tests__/services/event-job.service.test.ts`

### 6.4 Route Integration Tests
Update existing API tests to verify routes still return correct shapes:
- `__tests__/api/configuration-dashboard.test.ts` (create if missing)
- `__tests__/api/classes.test.ts`
- `__tests__/api/curriculum-engine.test.ts`
- `__tests__/api/attendance-report.test.ts`
- `__tests__/api/job-status.test.ts`
- `__tests__/api/reports.test.ts` (create if missing)
- `__tests__/api/ai-chatbot.test.ts` (create if missing)
- `__tests__/api/education-rules.test.ts`
- `__tests__/api/stripe-webhook.test.ts` (update for service)
- `__tests__/api/webhooks-qstash.test.ts` (create if missing)
- `__tests__/api/students-ocr.test.ts` (create if missing)

---

## 7. Rollback Strategy

### 7.1 Per-Route Rollback
Each route migration is **additive and independent**:
1. Revert the single route file to its pre-refactor state
2. Revert the associated service file if newly created
3. Run `npm test` to confirm no regressions
4. No database migrations or schema changes are involved

### 7.2 Feature Flag Option
For CRITICAL and HIGH severity routes (migrations 1–5), consider a runtime feature flag:
```typescript
const useNewArchitecture = process.env.USE_NEW_DASHBOARD_SERVICE === "true";
if (useNewArchitecture) {
  return dashboardService.getMetrics(tenantId);
}
// fallback to old path
```
This enables instant cut-back without git revert.

### 7.3 No-Data-Migration Guarantee
- No Firestore schema changes
- No document structure changes
- All changes are in-memory code organization only

---

## 8. Migration Timeline

| Phase | Migrations | Duration | Risk |
|---|---|---|---|
| **Phase 1: Critical** | 1. Dashboard route | 1–2 days | Medium |
| **Phase 2: High** | 2–5. Classes, Curriculum, Attendance-report, Fee-reminder | 3–5 days | Medium |
| **Phase 3: Medium** | 6–12. Reports, AI, Education, Billing, Webhook, OCR, Events | 5–7 days | Low |
| **Phase 4: Validation** | Architecture compliance, full test suite, build | 1 day | — |

**Total Estimated Duration:** 10–15 business days

**Recommended cadence:** One migration per day with dedicated testing and PR review.

---

## 9. Approval Checklist

- [ ] Architecture Governance Board review
- [ ] Phase 1 approved
- [ ] Phase 2 approved
- [ ] Phase 3 approved
- [ ] CI/CD pipeline validated for new service test suites

---

## 10. Phase 5 — Configuration Dashboard Runtime Remediation

> **Continuation note (continuity with Phase 1):** ADR-001 Phase 1 — *Configuration Dashboard Route* (§3.1 & §8 Migration Timeline) was **COMPLETED** per `governance/ADR001_CHANGELOG.md` ("Phase 1 remediated the architecture violation in `app/api/v1/configuration/dashboard/route.ts`"). The runtime audit `governance/CONFIGURATION_DASHBOARD_RUNTIME_AUDIT.md` confirms the route-layer refactoring is in place (the route delegates to `configurationDashboardService.getDashboardMetrics(tenantId)`; all direct repository imports were removed). However, runtime observation proves the dashboard **still renders `N/A` / `0`** for every metric. The defect is therefore a **runtime data-flow** issue in the Hook→UI layer, not a route-layer architecture violation. This phase implements the evidence-backed fixes from the runtime audit. It does **not** duplicate ADR-001 Phase 1 (route→service), which is already complete, nor Phase 2–4 (migration timeline).

### 10.1 Runtime Trace (Proven Data Path)

> Evidence: `governance/CONFIGURATION_DASHBOARD_RUNTIME_AUDIT.md` — Trace (lines 270–296), Root Cause Analysis §§302–349, Per-Metric Trace §353–362, Runtime Evidence Summary §366–377.

```
Save (Wizard Capture, SmartConfigurationWizard)
  → POST /api/v1/settings/school-configuration        (route.ts:60, withAuth+withTenant)
     → ConfigurationService.saveAndPublishConfiguration (configuration.service.ts:108)
        → ConfigurationRepository.publishConfiguration (configuration.repository.ts:98)
           → Firestore write: tenants/{tenantId}/settings/config   +  history subcollection
  → GET  /api/v1/configuration/dashboard               (configuration/dashboard/route.ts:7)
     → ConfigurationDashboardService.getDashboardMetrics (configuration-dashboard.service.ts:31)
        → createSuccessResponse(metrics)              → ENVELOPE { success, message, data: metrics, ... }
  → Hook: useConfigurationDashboard.ts:16  → safeObject(res)  → returns res.data (THE ENVELOPE)
     ⚠ line 288 — "DOES NOT unwrap the `data` field from the envelope"
  → UI:  configuration-dashboard/page.tsx  → data?.schoolInfo          → undefined → "N/A"
                                                data?.configuredClasses   → undefined → 0
                                                data?.configurationCompletion → undefined → 0%
```

**Breakpoint:** audit line 288 + line 368 ("Hook returns API envelope, not metrics payload") + line 370 ("Page accesses `data?.configurationCompletion` but the value is at `data?.data?.configurationCompletion`"). This is the **PRIMARY root cause (RANK 1, proven)** — `safeObject` unwraps the axios body (`res.data`) but not the API envelope's inner `data` field.

### 10.2 Implementation Item — RANK 1 (PRIMARY, PROVEN): Hook Response-Envelope Unwrapping

| Field | Detail |
|---|---|
| **Problem** | `useConfigurationDashboard()` returns the full API envelope (`{ success, message, data: metrics, ... }`) instead of the metrics payload. The page then reads `data?.schoolInfo` / `data?.configurationCompletion` / `data?.configuredClasses` on the envelope, which are all `undefined`, so every field falls back to its default (`"N/A"`, `0`, `0%`). |
| **Evidence** | `CONFIGURATION_DASHBOARD_RUNTIME_AUDIT.md` PRIMARY root cause §302–324, evidence summary §368 & §370. `hooks/useConfigurationDashboard.ts:17` → `return safeObject(payload)`. `lib/api/safeResponse.ts:10` → `safeObject` unwraps only `res.data`; `lib/api/safeResponse.ts:18` → `unwrapApiResponse` is the existing utility that unwraps the envelope `data` field (audit line 324 explicitly proposes this fix). |
| **Current Layer** | Hook — `hooks/useConfigurationDashboard.ts:16` (`return safeObject(payload);`) |
| **Target Layer** | Hook — return the unwrapped metrics payload |
| **Required Change** | Replace `return safeObject(payload);` with `return unwrapApiResponse(payload);`. `unwrapApiResponse` already exists at `lib/api/safeResponse.ts:18` and returns `response?.data ?? response`, which resolves the envelope mismatch in a single leaf change. No service/repo/route change required. |
| **Files Affected** | `hooks/useConfigurationDashboard.ts` (single line) |
| **Dependency Impact** | None — the hook is a leaf consumer. The only caller is `app/(protected)/admin/configuration-dashboard/page.tsx`, which expects the metrics payload, not the envelope. |
| **Runtime Impact** | HIGH (positive) — resolves `N/A` school name, real `configuredClasses`/`configuredTeachers`/`configuredStudents` counts, and real `configurationCompletion` percentage in one change. |
| **Data Impact** | None — read path; no Firestore mutation. |
| **Security Impact** | None — no auth/tenant/data-scope change. |
| **Testing Requirement** | (1) Unit: with fetch returning `{ success:true, data:{ schoolInfo:{name:"X"}, configurationCompletion } }`, the hook returns `{ schoolInfo:{name:"X"}, configurationCompletion }` (envelope not present). (2) Integration: publish a school config, invalidate the `useConfigurationDashboard` query, assert `result.schoolInfo.name` is defined (not `"N/A"`). |
| **Rollback Strategy** | Revert the single line back to `return safeObject(payload);`. The page immediately falls back to defaults — no crash, no data change, no migration. |
| **Risk** | LOW |
| **Acceptance Criteria** | After a configuration is published, the Configuration Dashboard renders the real school name (not `"N/A"`) and real metric counts within one query-cache invalidation cycle. |

---

### 10.3 Implementation Item — RANK 2 (SECONDARY): Hardcoded Zero Metrics

| Field | Detail |
|---|---|
| **Problem** | Seven dashboard metrics (`rooms`, `buildings`, `facilities`, `library`, `transport`, `hostel`, `feeStructure`) were hardcoded to `0` with no repository calls, so even after unwrapping the hook envelope those values would never reflect real data. |
| **Evidence** | `CONFIGURATION_DASHBOARD_RUNTIME_AUDIT.md` SECONDARY root cause §326–337; per-metric trace §357–362 (rooms/buildings/facilities/library/transport/hostel mapped to no collection). Remediation recorded in `governance/CONFIGURATION_DASHBOARD_FINDING_2.md` (Status: **RESOLVED**) and applied in commit `6efeed8` — *fix(configuration): load dashboard metrics from repositories*. Verified: `services/configuration-dashboard.service.ts` now contains 36 repository references and calls `feeStructureRepo.getFeeStructures(tenantId)`, etc.; the former `: 0` literals with no backing query are gone (current code computes `rooms: Array.isArray(rooms) ? rooms.length : 0` from real results). |
| **Current Layer** | Service — `services/configuration-dashboard.service.ts` (getCounts) |
| **Target Layer** | n/a — already remediated |
| **Required Change** | None — resolved. |
| **Files Affected** | `services/configuration-dashboard.service.ts` (already corrected) |
| **Dependency Impact** | None. |
| **Runtime Impact** | n/a (resolved). |
| **Data Impact** | None. |
| **Security Impact** | None. |
| **Testing Requirement** | Covered by Finding #2 regression tests. |
| **Rollback Strategy** | n/a. |
| **Risk** | — |
| **Acceptance Criteria** | — |
| **Status** | ✅ **RESOLVED** (no outstanding implementation). |

### 10.4 Implementation Item — RANK 3 (TERTIARY, PROVEN): Class/Section Shared Collection

| Field | Detail |
|---|---|
| **Problem** | `counts.classes` and `counts.sections` always return the **same value**, because `ClassRepository.getAll()` and `SectionRepository.findAllActive()` both query the identical `sections` Firestore collection with the same filter (`tenantId` + `!deleted`). With Grade 5 having Sections A, B, C the dashboard reports `classes=3` and `sections=3` — a logical inconsistency, since there is one class with three sections. |
| **Evidence** | `CONFIGURATION_DASHBOARD_RUNTIME_AUDIT.md` TERTIARY root cause §339–341; per-metric trace §358–359 (Classes row: `ClassRepository.getAll()` on `sections`; Sections row: `SectionRepository.findAllActive()` on `sections`); evidence summary §374. Governance decision & boundary analysis: `governance/FINDING_03_CLASS_SECTION_GOVERNANCE.md` — `APPROVE — REFACTOR`, §12.2 ("If keeping single `sections` collection: `ClassRepository` queries distinct `classGrade` values"). Supporting runtime evidence: `governance/configuration-dashboard-audit/08_configuration_repo_usage.txt`, `09_student_repo.txt`, `10_runtime.txt`. |
| **Current Layer** | Repository + Dashboard service — `repositories/class.repository.ts`, `repositories/section.repository.ts`, `services/configuration-dashboard.service.ts` (class count = `classRepo.getAll(tenantId).length`) |
| **Target Layer** | Repository — `ClassRepository` counts **distinct `classGrade` values**; `SectionRepository` counts **section documents** (`findAllActive`). Dashboard service consumes both distinct counts. |
| **Required Change** | (1) Add `classRepository.getClassGrades(tenantId): Promise<string[]>` returning distinct `classGrade` values (Finding #3 §9.1 target interface: `getClassGrades(tenantId)`). (2) In `ConfigurationDashboardService.getCounts()`, set `classes` = distinct grade count; `sections` = `sectionRepo.findAllActive(tenantId).length`. (3) Add to `interfaces/IClassRepository.ts`. |
| **Files Affected** | `repositories/class.repository.ts`, `interfaces/IClassRepository.ts`, `services/configuration-dashboard.service.ts`, `repositories/class.repository.test.ts`, `repositories/section.repository.test.ts` |
| **Dependency Impact** | Medium — `ClassRepository.getAll()` is also consumed by `ClassService` (§8.1 dependency matrix). Renaming/replacing `getAll` for the dashboard must not break `ClassService`. Mitigate: add a new `getClassGrades()` method (additive) and update only the dashboard service caller; keep `getAll()` for `ClassService`. |
| **Runtime Impact** | With multiple sections per grade, `configuredClasses` becomes the distinct grade count and `configuredSections` the section-document count, so the two metrics are no longer artificially identical. |
| **Data Impact** | None — read-only count logic; no Firestore schema or document change. |
| **Security Impact** | None — tenant filter preserved on all queries. |
| **Testing Requirement** | (1) Unit: with `sections` containing Grade 5 → {A,B,C} and Grade 6 → {A}, assert `classes === 2` and `sections === 4`. (2) Regression: `ClassService.getAllClasses()` still returns the full document set unchanged. (3) Dashboard integration: `configuredClasses !== configuredSections` when multiple sections share a grade. |
| **Rollback Strategy** | Revert `getCounts()` to `classRepo.getAll(tenantId).length` for classes; counts revert to the (incorrect) identical values. No data change. |
| **Risk** | MEDIUM — counting semantics change for `classes`; verify no other consumer depends on `classes === sections`. |
| **Acceptance Criteria** | A tenant with one grade and N sections reports `configuredClasses === 1` and `configuredSections === N`. |
| **Evidence-Gap Note** | FINDING #3 §12.1 marks the **target domain model** (single `sections` collection vs. separate `classes` collection) as *"EVIDENCE INSUFFICIENT — ADDITIONAL AUDIT REQUIRED."* The **distinct-`classGrade`-count** approach follows Finding #3's recommended path for the single-collection option (§12.2). The specific domain-model choice is therefore **UNVERIFIED** until business validation; the counting fix itself is evidence-backed (audit §339–341). |

---

### 10.5 Implementation Item — RANK 4 (QUATERNARY, CONDITIONAL): Tenant ID Resolution Dependency

| Field | Detail |
|---|---|
| **Problem** | The entire read chain begins with resolving a tenant ID from the authenticated user. If the `users` Firestore document lacks a `tenantId` field, `tenantResolver` falls back to a UID-derived ID that may not match any existing tenant document, so every downstream query (`tenants/{derivedId}/settings/config`, `sections`, `students`, etc.) returns empty → all counts `0` and `schoolInfo` `null`. |
| **Evidence** | `CONFIGURATION_DASHBOARD_RUNTIME_AUDIT.md` QUATERNARY root cause §343–349; evidence summary §376 ("Depends on `users` document in Firestore having a `tenantId` field. If absent, a derived ID is used which may not match existing tenant data."). Source: `services/tenant.resolver.ts`. |
| **Current Layer** | Tenant resolution — `services/tenant.resolver.ts` (feeds `tenantId` into every query in the trace above) |
| **Target Layer** | Guaranteed tenant-ID mapping |
| **Required Change** | Ensure `tenantId` is present on every `users` document (set at user-creation/onboarding) and/or prove the UID-derived fallback resolves to the correct tenant. |
| **Files Affected** | `services/tenant.resolver.ts`, Firestore `users` document schema, onboarding/auth user-creation path |
| **Dependency Impact** | High (chain-wide) — every layer above depends on a correct tenantId. |
| **Runtime Impact** | Only manifests when a user document is missing `tenantId`; otherwise no effect. |
| **Data Impact** | A one-time backfill of `tenantId` onto existing `users` documents (if missing). |
| **Security Impact** | Tenant isolation depends on correct tenantId; a wrong ID silently returns empty data (safe-fail, no cross-tenant leak). |
| **Testing Requirement** | (1) Unit: `tenantResolver.resolve(user)` returns the stored `tenantId` when present, and the derived ID only as a verified fallback. (2) Integration: assert a user WITH `tenantId` resolves the config document; create a test-only case proving the null-`tenantId` condition (UNVERIFIED until reproduced). |
| **Rollback Strategy** | No code rollback needed — the tenant resolver is unchanged unless modified. |
| **Risk** | LOW (only affects the null-`tenantId` edge case) |
| **Acceptance Criteria** | Every authenticated user resolves to a tenant whose `settings/config` document exists; no dashboard user sees all-zero metrics due to tenant-ID mismatch. |
| **Evidence-Gap Note** | The **dependency** is proven (audit §343–349); the **manifestation** ("derived ID may not match") is asserted conditionally ("may not match"). No test or runtime capture confirming a null-`tenantId` user produces an empty dashboard was found in the collected evidence. Per governance rule, the **fix is UNVERIFIED** — it must not be treated as proven until a null-`tenantId` case is reproduced and the derived ID is confirmed to mismatch. Implementation is gated on reproduction. |

### 10.6 Rollout & Verification Sequence

1. **Step 1 — Apply Rank 1 (P1) hook unwrap first.** It is the single change that unblocks the dashboard display; deploy and confirm the school name / counts move from `"N/A"`/`0` to real values.
2. **Step 2 — Verify.** Publish a school configuration in staging; assert the dashboard renders the real `schoolInfo.name` and `configurationCompletion.percentage` within one invalidation cycle (matches acceptance criteria of §10.2).
3. **Step 3 — Apply Rank 3 (P3) class/section counting** per the Finding #3 migration sequence (§5 Phases 1–9 of `FINDING_03_CLASS_SECTION_GOVERNANCE.md`). Verify `configuredClasses !== configuredSections` for a tenant with multiple sections per grade.
4. **Step 4 — Gate Rank 4 (P4).** Do **not** implement until a null-`tenantId` user is reproduced and the derived-ID mismatch is confirmed (UNVERIFIED). Treat as a hardening follow-up, not a runtime fix.
5. **Step 5 — Regression.** `tsc --noEmit`, ESLint, and the full Jest suite (`jest`, 698/698 baseline per `ADR001_CHANGELOG.md`) must pass; architecture-compliance tests (3/3) remain green.

### 10.7 Phase 5 Acceptance Criteria (Consolidated)

| # | Criterion | Linked Item |
|---|---|---|
| 1 | Dashboard renders real school name (not `"N/A"`) after publish | §10.2 (P1) |
| 2 | `configuredClasses`, `configuredTeachers`, `configuredStudents`, etc. reflect Firestore (not hardcoded `0`) | §10.2 (P1) + §10.3 (P2 RESOLVED) |
| 3 | `configuredClasses !== configuredSections` when multiple sections share a grade | §10.4 (P3) |
| 4 | No regression: `tsc --noEmit` = 0 errors; ESLint clean; Jest 698/698; arch-compliance 3/3 | §10.6 Step 5 |
| 5 | P4 left UNVERIFIED until null-`tenantId` reproduction | §10.5 |

### 10.8 Phase 5 Rollback

| Item | Rollback | Reversibility |
|---|---|---|
| P1 hook unwrap | Revert `hooks/useConfigurationDashboard.ts` line to `return safeObject(payload);` | Instant; page returns to `"N/A"`/`0` fallback — no crash |
| P3 class count | Revert `getCounts()` `classes` to `classRepo.getAll(tenantId).length` | Instant; counts revert to identical (incorrect) values |
| P2 | No action (already committed via `6efeed8`) | n/a |
| P4 | Not implemented (UNVERIFIED) | n/a |

No Firestore migration is required for Phase 5. All changes are in the hook, the dashboard service count logic, and the `IClassRepository`/`ClassRepository` (additive `getClassGrades`).

---

*Document generated from `governance/ARCHITECTURE_REVIEW.md` and `governance/ENTERPRISE_EVIDENCE.md`. Phase 5 evidence: `governance/CONFIGURATION_DASHBOARD_RUNTIME_AUDIT.md`, `governance/CONFIGURATION_DASHBOARD_FINDING_2.md`, `governance/FINDING_03_CLASS_SECTION_GOVERNANCE.md`.*
