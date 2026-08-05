# EduPilot Enterprise Governance Program (EGP)
## Phase 12 — Board Decision
### Version 2.0 | Fortune 500 Architecture Governance Board

---

## PHASE 12: BOARD DECISION

---

### Decision 1: AIService (NEW)

| Field | Value |
|---|---|
| **Decision** | APPROVED |
| **Reason** | 8 AI routes currently bypass the service layer and use AgentRegistry/AIGateway/GeminiProvider directly. This violates the mandatory Route → Service → Repository architecture. An AIService provides abstraction for AI provider swapping, centralized error handling, caching, and per-tenant quota enforcement. |
| **Evidence** | `app/api/v1/ai/agents/route.ts` uses `agentRegistry` directly. `app/api/v1/ai/chatbot/route.ts` uses `agentRegistry` directly. `app/api/v1/ai/report-comments/route.ts` uses `agentRegistry` directly. `app/api/v1/ai/smart-book-center/route.ts` uses `agentRegistry` directly. `app/api/v1/ai/timetable/route.ts` uses `agentRegistry` directly. `app/api/v1/ai/exam-questions/route.ts` uses `agentRegistry` directly. `app/api/v1/ai/exam-paper/route.ts` uses `agentRegistry` directly. `app/api/v1/staff/[id]/ai/route.ts` uses `agentRegistry` directly. |
| **Rollback Impact** | LOW — additive service creation; routes delegate incrementally; git revert restores previous state |

---

### Decision 2: BillingService (NEW)

| Field | Value |
|---|---|
| **Decision** | APPROVED |
| **Reason** | 2 Stripe routes currently use the Stripe SDK directly in route handlers. This violates the mandatory architecture and exposes payment flow details. A BillingService centralizes payment logic, enables provider swapping, and improves security posture. |
| **Evidence** | `app/api/v1/stripe/create-checkout/route.ts` uses `stripe` SDK directly. `app/api/v1/stripe/webhook/route.ts` uses Stripe webhook processing directly. |
| **Rollback Impact** | LOW — additive service creation; routes delegate incrementally; git revert restores previous state |

---

### Decision 3: WebhookService (NEW)

| Field | Value |
|---|---|
| **Decision** | APPROVED |
| **Reason** | The QStash webhook route uses `verifyQStashSignature` and `EventWorker` directly without a service wrapper. A WebhookService centralizes signature verification, event routing, and idempotent processing. |
| **Evidence** | `app/api/v1/webhooks/qstash/route.ts` uses external libraries directly. |
| **Rollback Impact** | LOW — additive service creation; routes delegate incrementally; git revert restores previous state |

---

### Decision 4: BackgroundJobService (NEW)

| Field | Value |
|---|---|
| **Decision** | APPROVED |
| **Reason** | 3 job routes directly instantiate repositories or use workers without a service layer. A BackgroundJobService centralizes job orchestration, status tracking, and retry logic. |
| **Evidence** | `app/api/v1/jobs/attendance-report/route.ts` instantiates TenantRepository and AttendanceRepository directly. `app/api/v1/jobs/fee-reminder/route.ts` instantiates FeesRepository and TenantRepository directly. `app/api/v1/jobs/events/route.ts` uses EventWorker directly. |
| **Rollback Impact** | LOW — additive service creation; routes delegate incrementally; git revert restores previous state |

---

### Decision 5: EducationRulesService (NEW)

| Field | Value |
|---|---|
| **Decision** | APPROVED |
| **Reason** | The education rules route uses `educationRulesEngine` directly without a service wrapper. An EducationRulesService abstracts the rules engine and enables testing and provider swapping. |
| **Evidence** | `app/api/v1/education/rules/route.ts` uses `educationRulesEngine` directly. |
| **Rollback Impact** | LOW — additive service creation; routes delegate incrementally; git revert restores previous state |

---

### Decision 6: OCRService Route Refactor (EXTEND)

| Field | Value |
|---|---|
| **Decision** | APPROVED WITH CONDITIONS |
| **Reason** | OCRService exists but is not used by the OCR admission route. The route uses tesseract.js, pdf-parse, and mammoth directly. The route must be refactored to delegate to OCRService. Condition: OCRService must be extended with file sanitization before the route refactor. |
| **Evidence** | `app/api/v1/students/ocr-admission/route.ts` uses OCR libraries directly. `app/api/v1/ocr/extract/route.ts` uses OCR libraries directly. `app/api/v1/staff/ocr/route.ts` uses OCR libraries directly. |
| **Rollback Impact** | LOW — route delegation change; git revert restores previous state |

---

### Decision 7: Classes Route Refactor (VIOLATION FIX)

| Field | Value |
|---|---|
| **Decision** | APPROVED |
| **Reason** | The classes route directly instantiates SectionRepository and imports FieldValue from firebase-admin/firestore. This is the only route with a direct Firestore SDK import. The route must delegate to ClassService and the FieldValue operation must be moved to the repository layer. |
| **Evidence** | `app/api/v1/classes/route.ts` imports `FieldValue` from `firebase-admin/firestore` (line 1). The route directly instantiates `SectionRepository` in GET, POST, and DELETE handlers (lines 20, 42, 75). |
| **Rollback Impact** | LOW — route delegation change; git revert restores previous state |

---

### Decision 8: Configuration Dashboard Refactor (ADR-001 Phase 1)

| Field | Value |
|---|---|
| **Decision** | APPROVED (Already Completed) |
| **Reason** | The configuration dashboard route was refactored to delegate to ConfigurationDashboardService, eliminating 7 direct repository instantiations. This was completed in ADR-001 Phase 1 and verified by the governance board. |
| **Evidence** | `app/api/v1/configuration/dashboard/route.ts` now delegates to `configurationDashboardService`. `services/configuration-dashboard.service.ts` implements `IConfigurationDashboardService`. |
| **Rollback Impact** | LOW — additive refactoring; git revert restores previous state |

---

### Decision 9: Singleton Migration (ADR-001 Phase 1)

| Field | Value |
|---|---|
| **Decision** | APPROVED (Already Completed) |
| **Reason** | Singleton exports were added to 6 repositories (ConfigurationRepository, AcademicYearRepository, ClassRepository, SectionRepository, StudentRepository, StaffRepository, ParentsRepository) to reduce per-request instantiation overhead. |
| **Evidence** | `governance/ADR001_GOVERNANCE.md` documents the singleton exports and their validation. |
| **Rollback Impact** | LOW — additive exports; git revert removes exports |

---

### Decision 10: Direct Repository Instantiation in Routes (ADR-001 Remaining)

| Field | Value |
|---|---|
| **Decision** | APPROVED |
| **Reason** | 6 API routes still directly instantiate repositories (17 instances total). These must be refactored to delegate through service layers. The highest priority is the configuration dashboard (already done) and the classes route (Decision 7). |
| **Evidence** | `governance/ARCHITECTURE_REVIEW.md` Finding 1 documents 17 lines of direct repository instantiation in route files. |
| **Rollback Impact** | LOW — additive refactoring; each route can be refactored independently |

---

### Decision 11: Missing Service Layer for Routes (ADR-002)

| Field | Value |
|---|---|
| **Decision** | APPROVED |
| **Reason** | 9 routes use external libraries directly without service wrappers (AI, billing, webhooks, OCR, events, education rules). New services must be created to wrap these operations. |
| **Evidence** | `governance/ARCHITECTURE_REVIEW.md` Finding 2 documents 9 routes with missing service layers. |
| **Rollback Impact** | LOW — additive service creation; routes delegate incrementally |

---

### Decision 12: Firestore SDK Import in Classes Route (ADR-003)

| Field | Value |
|---|---|
| **Decision** | APPROVED |
| **Reason** | The classes route is the only API route that imports `FieldValue` from `firebase-admin/firestore`. This must be removed and the FieldValue operation must be mediated through the service and repository layers. |
| **Evidence** | `app/api/v1/classes/route.ts` line 1: `import { FieldValue } from "firebase-admin/firestore";` |
| **Rollback Impact** | LOW — import removal and operation migration; no data migration required |

---

### Board Decision Summary

| # | Decision | Verdict | Priority | Sprint |
|---|---|---|---|---|
| 1 | AIService Creation | APPROVED | P1 — CRITICAL | Sprint 11 |
| 2 | BillingService Creation | APPROVED | P1 — CRITICAL | Sprint 11 |
| 3 | WebhookService Creation | APPROVED | P1 — CRITICAL | Sprint 11 |
| 4 | BackgroundJobService Creation | APPROVED | P2 — HIGH | Sprint 11 |
| 5 | EducationRulesService Creation | APPROVED | P2 — HIGH | Sprint 11 |
| 6 | OCRService Route Refactor | APPROVED WITH CONDITIONS | P2 — HIGH | Sprint 11 |
| 7 | Classes Route Refactor | APPROVED | P1 — HIGH | Sprint 12 |
| 8 | Configuration Dashboard Refactor | APPROVED (Done) | P1 — CRITICAL | Sprint 10 (Complete) |
| 9 | Singleton Migration | APPROVED (Done) | P3 — LOW | Sprint 10 (Complete) |
| 10 | Direct Repo Instantiation (Remaining) | APPROVED | P1 — HIGH | Sprint 10-12 |
| 11 | Missing Service Layer (Remaining) | APPROVED | P2 — MEDIUM | Sprint 11 |
| 12 | Firestore SDK Import | APPROVED | P1 — HIGH | Sprint 12 |

---

