# Enterprise Architecture Decision Records (ADR)

**Generated from:** `governance/ARCHITECTURE_REVIEW.md`
**Date:** 2026-08-04
**Scope:** Governance folder only (`governance/`)
**Mandatory Architecture:** Route → Application Service → Repository → Firestore

---

## ADR-001: Refactor Direct Repository Instantiation in API Routes

- **ADR ID:** ADR-001
- **Title:** Refactor Direct Repository Instantiation in API Routes
- **Problem Statement:** API route handlers directly instantiate repository classes, bypassing the mandatory Route → Service → Repository → Firestore architecture. This creates tight coupling, untestable business logic, and inconsistent data access patterns across route files.
- **Verified Evidence:** `governance/repositories.txt` contains 17 lines of direct repository instantiation in route files. `app/api/v1/configuration/dashboard/route.ts` instantiates 7 repositories at module scope: `ConfigurationRepository`, `AcademicYearRepository`, `ClassRepository`, `SectionRepository`, `StudentRepository`, `StaffRepository`, `ParentsRepository`. `app/api/v1/curriculum/upgrade/route.ts` instantiates `ConfigurationRepository` in both GET and POST handlers alongside `configurationService`. `app/api/v1/classes/route.ts` instantiates `SectionRepository` in GET, POST, and DELETE handlers alongside `AuditService`. `app/api/v1/jobs/attendance-report/route.ts` instantiates `TenantRepository` and `AttendanceRepository` alongside `AttendanceService`. `app/api/v1/jobs/fee-reminder/route.ts` instantiates `FeesRepository` and `TenantRepository` with no service layer. `app/api/v1/reports/generate/route.tsx` uses dynamic import of `StudentRepository` directly in handler.
- **Decision:** Refactor all route handlers that directly instantiate repositories to delegate data access through the service layer, following the mandatory Route → Service → Repository → Firestore chain.
- **Alternatives Considered:** (1) Keep direct repository instantiation in routes — rejected because it violates the mandatory architecture and creates untestable business logic. (2) Create a facade layer between routes and repositories — rejected because the architecture mandates a service layer, not a facade. (3) Incremental refactoring per route — accepted as the migration strategy (each route can be refactored independently).
- **Business Justification:** Business logic scattered across route handlers is untestable in isolation. Changes to data access patterns require modifications to multiple route files. The configuration dashboard (7 repos) is the most severe violation — a single misconfiguration affects all dashboard metrics.
- **Architecture Justification:** The mandatory architecture requires Route → Service → Repository → Firestore. Direct repository instantiation in routes violates this chain, bypassing the service layer that provides validation, authorization, audit logging, and business logic encapsulation.
- **Runtime Impact:** Routes bypass service-layer validation, transformation, and orchestration. Direct repository access creates tight coupling between HTTP handlers and data access. No centralized error handling or retry logic at the service boundary. Memory overhead from multiple repository instances per request.
- **Dependency Impact:** Route handlers are tightly coupled to specific repository implementations. Changing repository interfaces requires updating every route that instantiates them directly. No abstraction layer between HTTP and data access.
- **Rollback Impact:** Refactoring to service layer is additive — existing direct repository calls can be removed after service is created. No breaking changes to external APIs during migration. Each route can be refactored independently.
- **Risks:** (1) Service layer may not yet exist for all affected domains, requiring service creation alongside refactoring. (2) Configuration dashboard with 7 repositories is the most complex refactoring and carries the highest risk of regression. (3) Tenant isolation logic may be affected if service layer does not replicate repository-level tenant filtering.
- **Consequences:** If not addressed, business logic remains scattered and untestable. Repository interface changes require updates across all route files. Security authorization checks are bypassed at the service boundary.
- **Priority:** P1 — CRITICAL for configuration dashboard (7 repos); HIGH for remaining routes
- **Sprint Assignment:** Phase 1 (REFACTOR: direct repo access)

---

## ADR-002: Refactor Missing Service Layer for AI, Billing, and Webhook Routes

- **ADR ID:** ADR-002
- **Title:** Refactor Missing Service Layer for AI, Billing, and Webhook Routes
- **Problem Statement:** Nine API routes use external libraries and business logic directly in route handlers without a service wrapper, violating the mandatory architecture that requires all business logic to reside in Application Services.
- **Verified Evidence:** `app/api/v1/ai/agents/route.ts` uses `agentRegistry` from `@/lib/ai/agents/AgentRegistry` directly — no service wrapper. `app/api/v1/ai/chatbot/route.ts` uses `agentRegistry` directly — no service wrapper. `app/api/v1/ai/report-comments/route.ts` uses `agentRegistry` directly — no service wrapper. `app/api/v1/ai/smart-book-center/route.ts` uses `agentRegistry` directly — no service wrapper. `app/api/v1/education/rules/route.ts` uses `educationRulesEngine` directly — no service wrapper. `app/api/v1/stripe/create-checkout/route.ts` uses `stripe` SDK directly — no `BillingService`. `app/api/v1/webhooks/qstash/route.ts` uses `verifyQStashSignature`, `runReportWorker`, `EventWorker` directly — no service wrapper. `app/api/v1/students/ocr-admission/route.ts` uses `tesseract.js`, `pdf-parse`, `mammoth` directly — no service wrapper. `app/api/v1/jobs/events/route.ts` uses `EventWorker` directly — no service wrapper.
- **Decision:** Create Application Service wrappers for AI agent registry, education rules engine, Stripe billing, QStash webhooks, OCR admission processing, and event worker, then refactor routes to delegate to these services.
- **Alternatives Considered:** (1) Keep external library usage in route handlers — rejected because it violates the mandatory architecture and creates untestable, non-reusable code paths. (2) Create a generic proxy service for all external integrations — rejected because the architecture requires domain-specific services that encapsulate business logic, not generic proxies. (3) Incremental service creation per domain — accepted as the migration strategy.
- **Business Justification:** AI logic cannot be tested in isolation from HTTP handlers. Switching AI providers requires modifying route handlers instead of a single service. Payment processing logic in routes is a security risk — business rules for checkout flow are not centralized. Webhook signature verification and routing logic is not reusable.
- **Architecture Justification:** The mandatory architecture requires all business logic to reside in Application Services. Routes that use external libraries directly bypass this layer, creating untestable, non-reusable, and security-sensitive code paths.
- **Runtime Impact:** External library dependencies are coupled to HTTP request lifecycle. No abstraction for swapping AI providers, payment processors, or webhook handlers. Error handling is duplicated across routes.
- **Dependency Impact:** Routes depend directly on external libraries (tesseract.js, stripe SDK, pdf-parse, mammoth). Changing AI provider requires modifying every AI route. Payment processor changes require modifying stripe/create-checkout route.
- **Rollback Impact:** Creating services is additive — routes can delegate to new services incrementally. No breaking changes to APIs during migration. Each service can be tested independently before route delegation.
- **Risks:** (1) OCR admission route processes user-uploaded files directly in handler — no sanitization layer; the new service must include file validation and sanitization. (2) Stripe checkout logic in route handler exposes payment flow details; the new BillingService must not alter existing payment behavior. (3) Webhook signature verification in route handler means security logic is not centralized; the new service must preserve signature verification correctness.
- **Consequences:** If not addressed, AI provider changes require modifying every AI route. Payment processing logic remains scattered and insecure. Webhook handling is not reusable. External library upgrades require touching multiple route files.
- **Priority:** P2 — MEDIUM severity across all affected routes
- **Sprint Assignment:** Phase 2 (REFACTOR: missing services)

---

## ADR-003: Refactor Firestore Admin SDK Import in Classes Route

- **ADR ID:** ADR-003
- **Title:** Refactor Firestore Admin SDK Import in Classes Route
- **Problem Statement:** `app/api/v1/classes/route.ts` imports `FieldValue` from `firebase-admin/firestore` and uses it directly in the route handler, violating the mandatory architecture that requires all Firestore access to go through Repositories accessed only through Services.
- **Verified Evidence:** `app/api/v1/classes/route.ts` imports `FieldValue` from `firebase-admin/firestore`. This is the only API route file that imports from `firebase-admin/firestore`. The import is used for `FieldValue` in the section creation logic.
- **Decision:** Remove the `firebase-admin/firestore` import from the classes route and move the `FieldValue` operation into a Repository, accessed through the Service layer.
- **Alternatives Considered:** (1) Keep the `FieldValue` import in the route — rejected because it violates the mandatory architecture by accessing Firestore directly from the route. (2) Move `FieldValue` to a shared utility module — rejected because this still bypasses the Repository abstraction and does not address the architectural violation. (3) Refactor to use Repository + Service — accepted as it restores the mandatory architecture chain.
- **Business Justification:** Firestore-specific logic leaks into route handler. If `FieldValue` usage changes (e.g., server timestamps), the route must be modified directly. Violates the mandatory architecture by accessing Firestore directly from the route.
- **Architecture Justification:** The mandatory architecture requires all Firestore access to go through Repositories, which are accessed only through Services. Direct `firebase-admin/firestore` imports in routes violate this chain.
- **Runtime Impact:** Direct Firestore admin SDK access in route handler bypasses repository abstraction. `FieldValue` operations (likely server-side timestamps or array unions) are not mediated by service layer.
- **Dependency Impact:** Route is coupled to `firebase-admin/firestore` API. Migration to a different Firestore client would require route modification.
- **Rollback Impact:** Removing `FieldValue` import and moving Firestore operations to a service is straightforward. No data migration required.
- **Risks:** (1) The `FieldValue` operation must be correctly replicated in the Repository layer to avoid data inconsistency. (2) The Service layer must be extended to mediate `FieldValue` operations without introducing regressions in section creation logic.
- **Consequences:** If not addressed, Firestore SDK changes would require route modification. Tenant isolation depends on correct `FieldValue` usage in the route handler, which is not mediated by service-layer security checks.
- **Priority:** P1 — HIGH severity (only route with direct Firestore SDK import)
- **Sprint Assignment:** Phase 1 (REFACTOR: direct repo access)

---

## ADR-004: Defer Lint Warnings in UI Pages

- **ADR ID:** ADR-004
- **Title:** Defer Lint Warnings in UI Pages (Not API Routes)
- **Problem Statement:** Two lint warnings exist in UI page components (`app/(protected)/admin/promote/page.tsx` and `app/(protected)/staff/page.tsx`) that are outside the scope of backend architecture governance. These warnings do not affect API routes or the mandatory architecture.
- **Verified Evidence:** `governance/lint.txt` shows 2 warnings: (1) `app/(protected)/admin/promote/page.tsx` line 31:9 — `react-hooks/exhaustive-deps` warning. (2) `app/(protected)/staff/page.tsx` line 257:29 — `@next/next/no-img-element` warning. Both warnings are in UI page components, not API routes. No lint errors in any API route files.
- **Decision:** Defer resolution of these lint warnings to a future sprint, as they are UI concerns outside the backend architecture governance scope and do not affect the mandatory Route → Service → Repository → Firestore architecture.
- **Alternatives Considered:** (1) Fix lint warnings immediately — rejected because they are in UI pages, not API routes, and are outside the governance scope of this architecture review. (2) Suppress the warnings — rejected because the warnings indicate real code quality issues (stale closures, LCP performance) that should be addressed eventually. (3) Defer with a tracking ticket — accepted as it acknowledges the issues without blocking architectural refactoring.
- **Business Justification:** Lint warnings in UI pages do not affect API architecture. These are front-end concerns outside the scope of backend architecture governance.
- **Architecture Justification:** The mandatory architecture governs backend API routes. Lint warnings in UI page components do not violate the Route → Service → Repository → Firestore chain and are not within the scope of this governance review.
- **Runtime Impact:** No runtime impact — lint warnings are static analysis findings. `exhaustive-deps` warning may cause stale closures in React components. `no-img-element` warning may impact LCP performance.
- **Dependency Impact:** No impact — lint warnings are code quality issues.
- **Rollback Impact:** No rollback needed — these are pre-existing UI issues.
- **Risks:** (1) `exhaustive-deps` warning may cause stale closures leading to subtle React bugs. (2) `no-img-element` warning may cause slower LCP and higher bandwidth usage. These risks are low severity and do not affect backend architecture.
- **Consequences:** If deferred, the UI pages remain with lint warnings. No impact on API architecture compliance or the mandatory backend architecture.
- **Priority:** P3 — LOW severity (UI-only, no backend impact)
- **Sprint Assignment:** Phase 3 (DEFER: lint, unused exports)

---

## ADR-005: Defer Unused Exports Verification

- **ADR ID:** ADR-005
- **Title:** Defer Unused Exports Verification
- **Problem Statement:** The `ts-prune` tool for detecting unused exports was invoked interactively and did not complete. No unused export data is available in the governance folder, leaving this governance check unverified.
- **Verified Evidence:** `governance/ENTERPRISE_EVIDENCE.md` section 16 (UNUSED EXPORTS) shows `ts-prune` was invoked interactively and did not complete. The tool prompted "Ok to proceed?" and no output was captured. No unused export data is available in the governance folder.
- **Decision:** Defer the unused exports verification to a separate governance task that runs `ts-prune` to completion, as the current evidence is incomplete and no conclusions can be drawn.
- **Alternatives Considered:** (1) Re-run `ts-prune` immediately as part of this review — rejected because the tool requires interactive input and cannot be completed in the current governance scan. (2) Assume no unused exports — rejected because the absence of evidence is not evidence of absence. (3) Defer to a dedicated governance task — accepted as it ensures the check is completed properly with full evidence capture.
- **Business Impact:** Unused exports increase bundle size marginally and create maintenance burden. Cannot be assessed without running ts-prune to completion.
- **Architecture Justification:** The unused exports check was not completed in the governance evidence. This should be run as a separate governance task to completion. The mandatory architecture does not directly depend on unused export detection, but clean exports support module clarity.
- **Runtime Impact:** No impact — unused exports do not affect runtime behavior.
- **Dependency Impact:** Cannot be assessed without completing ts-prune analysis.
- **Rollback Impact:** No rollback applicable — this finding is unverified.
- **Risks:** (1) Unused exports may exist and increase bundle size without being detected. (2) The governance folder lacks the evidence needed to confirm or deny unused exports. (3) Without completing this check, the architecture review has an incomplete coverage gap.
- **Consequences:** If deferred without follow-up, unused exports remain undetected. The governance evidence for this check remains incomplete. Bundle size may be marginally larger than necessary.
- **Priority:** P3 — LOW severity (unverified finding, no runtime impact)
- **Sprint Assignment:** Phase 3 (DEFER: lint, unused exports)