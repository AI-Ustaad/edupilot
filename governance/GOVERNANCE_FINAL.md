# EDUPILOT ENTERPRISE GOVERNANCE FINAL REPORT

**Document:** governance/GOVERNANCE_FINAL.md  
**Date:** 2026-08-04  
**Reviewing Body:** Fortune 500 Enterprise Governance Board (EGB)  
**Status:** FINAL and IMMUTABLE  

---

## PHASE 1 — GOVERNANCE VALIDATION

### Verification Results

**Architecture Review ↔ ADR Alignment:** CONFIRMED  
- ARCHITECTURE_REVIEW.md Finding 1 (Direct Repository Instantiation) ↔ ADR-001: AGREE  
- ARCHITECTURE_REVIEW.md Finding 2 (Missing Service Layer) ↔ ADR-002: AGREE  
- ARCHITECTURE_REVIEW.md Finding 3 (Firestore Admin SDK Import) ↔ ADR-003: AGREE  
- ARCHITECTURE_REVIEW.md Finding 6 (Lint Warnings) ↔ ADR-004: AGREE  
- ARCHITECTURE_REVIEW.md Finding 13 (Unused Exports) ↔ ADR-005: AGREE  

**ADR ↔ RRR Alignment:** CONFIRMED  
- ADR-001 ↔ RRR.md Section 3 Batch 2: AGREE  
- ADR-002 ↔ RRR.md Section 3 Batch 3: AGREE  
- ADR-003 ↔ RRR.md Section 3 Batch 4: AGREE  
- ADR-004 ↔ RRR.md Section 3 Batch 5: AGREE  
- ADR-005 ↔ RRR.md Section 3 Batch 5: AGREE  

**Contradictory Decisions:** NONE FOUND  
All three documents present a consistent narrative: 3 REFACTOR items require remediation, 8 KEEP items are approved for immediate merge, and 2 DEFER items are non-blocking. The RRR.md Section 8 decision of CONDITIONAL RELEASE APPROVAL is fully supported by the ADR decisions and Architecture Review classifications.

---

## PHASE 2 — FINAL GOVERNANCE MATRIX

| Finding | Evidence | ADR | RRR Decision | Priority | Sprint | Owner | Rollback Complexity | Status |
|---|---|---|---|---|---|---|---|---|
| Direct Repository Instantiation in API Routes | ARCHITECTURE_REVIEW.md Finding 1; 17 lines of direct repo instantiation in route files; configuration/dashboard/route.ts instantiates 7 repositories | ADR-001 | Batch 2: REFACTOR — Direct Repository Instantiation | P1 — CRITICAL (dashboard); HIGH (remaining) | Sprint 10 | Backend Architecture Team Lead | LOW — additive refactoring; no breaking API changes | PENDING REFACTOR |
| Missing Service Layer for AI, Billing, Webhook Routes | ARCHITECTURE_REVIEW.md Finding 2; 9 routes use external libraries directly without service wrapper | ADR-002 | Batch 3: REFACTOR — Missing Service Layer | P2 — MEDIUM | Sprint 11 | Backend Architecture Team Lead | LOW — additive service creation; routes delegate incrementally | PENDING REFACTOR |
| Classes Route — Firestore Admin SDK Import | ARCHITECTURE_REVIEW.md Finding 3; classes/route.ts imports FieldValue from firebase-admin/firestore | ADR-003 | Batch 4: REFACTOR — Firestore Admin SDK Import | P1 — HIGH | Sprint 12 | Backend Architecture Team Lead | LOW — straightforward import removal; no data migration | PENDING REFACTOR |
| TypeScript Compilation — Zero Errors | ARCHITECTURE_REVIEW.md Finding 4; ENTERPRISE_EVIDENCE.md §3 (empty output) | N/A — KEEP | Batch 1: Infrastructure & Compliance Baseline | P3 — LOW | Sprint 10 | Release Manager | NONE — no changes | APPROVED |
| Test Suite — All 698 Tests Passing | ARCHITECTURE_REVIEW.md Finding 5; ENTERPRISE_EVIDENCE.md §5 (65 suites, 698 tests) | N/A — KEEP | Batch 1: Infrastructure & Compliance Baseline | P3 — LOW | Sprint 10 | Release Manager | NONE — no changes | APPROVED |
| Lint Warnings in UI Pages | ARCHITECTURE_REVIEW.md Finding 6; 2 warnings in UI page components only | ADR-004 | Batch 5: DEFER — Lint Warnings & Unused Exports | P3 — LOW | Sprint 12 | Frontend Team Lead | NONE — no changes in this batch | DEFERRED |
| Build Succeeds — All 85 Static Pages Generated | ARCHITECTURE_REVIEW.md Finding 7; ENTERPRISE_EVIDENCE.md §6 (Next.js 14.2.3 build success) | N/A — KEEP | Batch 1: Infrastructure & Compliance Baseline | P3 — LOW | Sprint 10 | Release Manager | NONE — no changes | APPROVED |
| No Circular Dependencies | ARCHITECTURE_REVIEW.md Finding 8; ENTERPRISE_EVIDENCE.md §15 | N/A — KEEP | Batch 1: Infrastructure & Compliance Baseline | P3 — LOW | Sprint 10 | Release Manager | NONE — no changes | APPROVED |
| Singleton Service and Repository Exports | ARCHITECTURE_REVIEW.md Finding 9; ENTERPRISE_EVIDENCE.md §11 | N/A — KEEP | Batch 1: Infrastructure & Compliance Baseline | P3 — LOW | Sprint 10 | Release Manager | NONE — no changes | APPROVED |
| No Routes Calling Firestore Directly | ARCHITECTURE_REVIEW.md Finding 10; ENTERPRISE_EVIDENCE.md §12 (empty) | N/A — KEEP | Batch 1: Infrastructure & Compliance Baseline | P3 — LOW | Sprint 10 | Release Manager | NONE — no changes | APPROVED |
| No Services Calling Firestore Directly | ARCHITECTURE_REVIEW.md Finding 11; ENTERPRISE_EVIDENCE.md §13 (empty) | N/A — KEEP | Batch 1: Infrastructure & Compliance Baseline | P3 — LOW | Sprint 10 | Release Manager | NONE — no changes | APPROVED |
| No TODO/FIXME Items | ARCHITECTURE_REVIEW.md Finding 12; ENTERPRISE_EVIDENCE.md §14 (empty) | N/A — KEEP | Batch 1: Infrastructure & Compliance Baseline | P3 — LOW | Sprint 10 | Release Manager | NONE — no changes | APPROVED |
| Unused Exports Not Verified | ARCHITECTURE_REVIEW.md Finding 13; ENTERPRISE_EVIDENCE.md §16 (ts-prune interactive, did not complete) | ADR-005 | Batch 5: DEFER — Lint Warnings & Unused Exports | P3 — LOW | Sprint 12 | Release Manager | NONE — no changes in this batch | DEFERRED |

---

## PHASE 3 — ENTERPRISE GIT PLAN

| Batch Number | Commit Title | Git Commit Message | Merge Order | Rollback Order | Risk Level | Business Criticality |
|---|---|---|---|---|---|---|
| Batch 1 | Infrastructure & Compliance Baseline Verification | chore(governance): verify TypeScript, tests, build, and architecture compliance baseline | 1 of 5 | N/A — no changes | NONE | HIGH — establishes deployable baseline |
| Batch 2 | Refactor Direct Repository Instantiation (ADR-001) | refactor(architecture): migrate direct repository instantiation to service layer per ADR-001 | 2 of 5 | 2 of 5 (revert additive refactoring) | HIGH (configuration dashboard); MEDIUM (remaining) | CRITICAL — configuration dashboard affects all metrics |
| Batch 3 | Refactor Missing Service Layer (ADR-002) | refactor(architecture): create service wrappers for AI, billing, webhook, OCR, and event routes per ADR-002 | 3 of 5 | 3 of 5 (revert additive service creation) | MEDIUM | HIGH — payment processing and AI provider abstraction |
| Batch 4 | Refactor Firestore Admin SDK Import (ADR-003) | refactor(architecture): remove direct Firestore SDK import from classes route per ADR-003 | 4 of 5 | 4 of 5 (restore import and revert refactoring) | LOW | MEDIUM — section creation data integrity |
| Batch 5 | Defer Lint Warnings & Unused Exports (ADR-004, ADR-005) | chore(governance): defer lint warnings and unused exports verification per ADR-004 and ADR-005 | 5 of 5 | N/A — no changes | NONE | LOW — UI-only and unverified findings |

---

## PHASE 4 — RELEASE GOVERNANCE

### Release Checklist

- [ ] **Batch 1:** Verify zero TypeScript errors (`npx tsc --noEmit`)
- [ ] **Batch 1:** Verify 698/698 tests passing (`npx jest`)
- [ ] **Batch 1:** Verify production build succeeds (`npx next build`) — 85/85 static pages generated
- [ ] **Batch 1:** Verify zero lint errors in API routes (`npx next lint`)
- [ ] **Batch 1:** Verify no circular dependencies in module graph
- [ ] **Batch 1:** Verify architecture compliance tests pass (`__tests__/architecture-compliance.test.ts`)
- [ ] **Batch 2:** Create service layer implementations for Configuration, Class, Curriculum, Job, and Report domains
- [ ] **Batch 2:** Refactor `configuration/dashboard/route.ts` to delegate through service layer
- [ ] **Batch 2:** Refactor `classes/route.ts` to delegate through service layer
- [ ] **Batch 2:** Refactor `curriculum/upgrade/route.ts` to delegate through service layer
- [ ] **Batch 2:** Refactor `jobs/attendance-report/route.ts` to delegate through service layer
- [ ] **Batch 2:** Refactor `jobs/fee-reminder/route.ts` to delegate through service layer
- [ ] **Batch 2:** Refactor `reports/generate/route.tsx` to delegate through service layer
- [ ] **Batch 3:** Create AI service wrappers (agents, chatbot, report-comments, smart-book-center)
- [ ] **Batch 3:** Create EducationRulesService for `education/rules/route.ts`
- [ ] **Batch 3:** Create BillingService for `stripe/create-checkout/route.ts`
- [ ] **Batch 3:** Create WebhookService for `webhooks/qstash/route.ts`
- [ ] **Batch 3:** Create OCRService with file sanitization for `students/ocr-admission/route.ts`
- [ ] **Batch 3:** Create EventService for `jobs/events/route.ts`
- [ ] **Batch 4:** Remove `FieldValue` import from `classes/route.ts`
- [ ] **Batch 4:** Replicate `FieldValue` operation in Repository layer
- [ ] **Batch 4:** Mediate `FieldValue` through Service layer
- [ ] **Batch 5:** Run `ts-prune` to completion for unused exports verification
- [ ] **Batch 5:** Fix lint warnings in `admin/promote/page.tsx` and `staff/page.tsx`
- [ ] **ALL:** Re-run full test suite and build after each batch

### Deployment Checklist

- [ ] **Pre-Deployment:** All 698 tests passing
- [ ] **Pre-Deployment:** Production build succeeds with 85/85 static pages
- [ ] **Pre-Deployment:** Zero TypeScript errors
- [ ] **Pre-Deployment:** Zero lint errors in API routes
- [ ] **Pre-Deployment:** Configuration dashboard metrics verified in staging environment
- [ ] **Pre-Deployment:** Stripe checkout flow verified in staging environment
- [ ] **Pre-Deployment:** QStash webhook signature verification verified in staging environment
- [ ] **Pre-Deployment:** OCR admission file upload and processing verified in staging environment
- [ ] **Pre-Deployment:** Section creation with FieldValue operations verified in staging environment
- [ ] **Deployment:** Deploy Batch 1 (Infrastructure & Compliance Baseline) — no code changes
- [ ] **Deployment:** Deploy Batch 2 (Direct Repository Instantiation refactoring) — staged rollout
- [ ] **Deployment:** Deploy Batch 3 (Missing Service Layer refactoring) — staged rollout
- [ ] **Deployment:** Deploy Batch 4 (Firestore Admin SDK Import refactoring) — staged rollout
- [ ] **Deployment:** Deploy Batch 5 (DEFER items) — non-blocking, deploy after Batches 2–4
- [ ] **Post-Deployment:** Monitor configuration dashboard for data consistency
- [ ] **Post-Deployment:** Monitor payment processing for Stripe checkout correctness
- [ ] **Post-Deployment:** Monitor webhook ingestion for QStash signature verification
- [ ] **Post-Deployment:** Monitor OCR processing for file sanitization effectiveness
- [ ] **Post-Deployment:** Monitor section creation for FieldValue data integrity

### Rollback Checklist

- [ ] **Batch 1:** No rollback required — verification only
- [ ] **Batch 2:** Rollback Owner: Backend Architecture Team Lead
- [ ] **Batch 2:** Rollback Trigger: Any route returning 5xx errors after refactoring; configuration dashboard metrics showing incorrect data; tenant isolation failure detected
- [ ] **Batch 2:** Rollback Commands: `git revert <commit-hash>` for the refactoring commit; redeploy previous route handler version from the last known-good commit
- [ ] **Batch 2:** Rollback Impact: Reverts route handlers to direct repository instantiation. No external API changes — the same API contract is preserved. Each route can be rolled back independently.
- [ ] **Batch 3:** Rollback Owner: Backend Architecture Team Lead
- [ ] **Batch 3:** Rollback Trigger: Payment processing failures after BillingService creation; AI response degradation after AI service creation; webhook signature verification failures after QStash service creation; OCR processing failures after OCR service creation
- [ ] **Batch 3:** Rollback Commands: `git revert <commit-hash>` for the service creation and route delegation commit; redeploy previous route handler version from the last known-good commit
- [ ] **Batch 3:** Rollback Impact: Reverts routes to direct external library usage. No external API changes — the same API contract is preserved. Each service can be rolled back independently.
- [ ] **Batch 4:** Rollback Owner: Backend Architecture Team Lead
- [ ] **Batch 4:** Rollback Trigger: Section creation failures after FieldValue operation is moved to repository; data inconsistency in section documents
- [ ] **Batch 4:** Rollback Commands: `git revert <commit-hash>` for the import removal and service/repository refactoring commit; redeploy previous route handler version from the last known-good commit
- [ ] **Batch 4:** Rollback Impact: Restores firebase-admin/firestore import in the classes route. No data migration required. No external API changes.
- [ ] **Batch 5:** No rollback required — no changes are made in this batch

### Smoke Test Checklist

- [ ] **Batch 1:** Verify homepage loads without errors
- [ ] **Batch 1:** Verify login page renders correctly
- [ ] **Batch 1:** Verify admin dashboard accessible with valid credentials
- [ ] **Batch 1:** Verify API health endpoint returns 200 (`/api/health`)
- [ ] **Batch 2:** Verify configuration dashboard loads all 7 metric categories without errors
- [ ] **Batch 2:** Verify classes route creates sections correctly with proper tenant isolation
- [ ] **Batch 2:** Verify curriculum upgrade route processes curriculum changes correctly
- [ ] **Batch 2:** Verify attendance report job completes and returns expected data
- [ ] **Batch 2:** Verify fee reminder job processes reminders correctly
- [ ] **Batch 2:** Verify report generation returns valid PDF/document output
- [ ] **Batch 3:** Verify AI agents route returns valid agent responses
- [ ] **Batch 3:** Verify AI chatbot route processes messages correctly
- [ ] **Batch 3:** Verify AI report comments generate valid output
- [ ] **Batch 3:** Verify AI smart book center returns book recommendations
- [ ] **Batch 3:** Verify education rules route applies rules correctly
- [ ] **Batch 3:** Verify Stripe checkout creates valid checkout sessions
- [ ] **Batch 3:** Verify QStash webhook processes events and returns 200
- [ ] **Batch 3:** Verify OCR admission route processes uploaded files and extracts data
- [ ] **Batch 3:** Verify event worker route processes background jobs correctly
- [ ] **Batch 4:** Verify section creation includes correct server timestamps or array unions
- [ ] **Batch 4:** Verify section documents in Firestore contain expected FieldValue operations
- [ ] **Batch 5:** Verify lint warnings are visible in CI but do not block build
- [ ] **Batch 5:** Verify ts-prune runs to completion in separate governance task

---

## PHASE 5 — TECHNICAL DEBT REGISTER

### Immediate Debt

| Debt Item | Source | Impact | Remediation | Owner | Target Sprint |
|---|---|---|---|---|---|
| Direct repository instantiation in 6 API routes (17 instances) | ARCHITECTURE_REVIEW.md Finding 1; ADR-001 | HIGH — violates mandatory architecture; bypasses service-layer validation, authorization, and audit logging | Refactor routes to delegate through service layer | Backend Architecture Team Lead | Sprint 10 |
| Missing service layer for 9 API routes (AI, billing, webhook, OCR, events, education rules) | ARCHITECTURE_REVIEW.md Finding 2; ADR-002 | MEDIUM — external library dependencies coupled to HTTP lifecycle; no abstraction for provider swapping | Create domain-specific service wrappers for each route | Backend Architecture Team Lead | Sprint 11 |
| Direct Firestore Admin SDK import in classes route | ARCHITECTURE_REVIEW.md Finding 3; ADR-003 | HIGH — only route with direct Firestore SDK access; bypasses repository abstraction | Remove import; move FieldValue operation to Repository layer | Backend Architecture Team Lead | Sprint 12 |
| Configuration dashboard instantiates 7 repositories at module scope | ARCHITECTURE_REVIEW.md Finding 1 (severity detail) | CRITICAL — single misconfiguration affects all dashboard metrics; no batching or caching | Refactor to use shared service instance with batching and caching | Backend Architecture Team Lead | Sprint 10 |

### Deferred Debt

| Debt Item | Source | Impact | Remediation | Owner | Target Sprint |
|---|---|---|---|---|---|
| Lint warnings in UI pages (exhaustive-deps, no-img-element) | ARCHITECTURE_REVIEW.md Finding 6; ADR-004 | LOW — UI-only; may cause stale closures and slower LCP | Fix promote/page.tsx useMemo dependency; replace img with next/image in staff/page.tsx | Frontend Team Lead | Sprint 12 |
| Unused exports verification incomplete (ts-prune interactive failure) | ARCHITECTURE_REVIEW.md Finding 13; ADR-005 | LOW — unverified; potential bundle size and maintenance burden | Run ts-prune to completion in dedicated governance task | Release Manager | Sprint 12 |

### Future Improvements

| Improvement | Source | Impact | Priority | Owner | Target Sprint |
|---|---|---|---|---|---|
| Implement connection pooling and caching at service layer for configuration dashboard | ARCHITECTURE_REVIEW.md Finding 1 (Performance Impact) | MEDIUM — reduces memory overhead and request latency for 7 parallel repository calls | P2 — MEDIUM | Backend Architecture Team Lead | Sprint 13 |
| Add centralized error handling and retry logic at service boundary | ARCHITECTURE_REVIEW.md Finding 1 (Runtime Impact) | MEDIUM — improves resilience for all refactored routes | P2 — MEDIUM | Backend Architecture Team Lead | Sprint 13 |
| Create abstraction layer for AI provider swapping | ARCHITECTURE_REVIEW.md Finding 2 (Dependency Impact) | HIGH — enables AI provider changes without modifying route handlers | P2 — MEDIUM | AI/ML Team Lead | Sprint 14 |
| Implement caching for AI responses and education rules results | ARCHITECTURE_REVIEW.md Finding 2 (Performance Impact) | MEDIUM — reduces latency and external API costs | P3 — LOW | Backend Architecture Team Lead | Sprint 14 |
| Centralize webhook signature verification in service layer | ARCHITECTURE_REVIEW.md Finding 2 (Security Impact) | HIGH — improves security posture for webhook ingestion | P2 — MEDIUM | Security Team Lead | Sprint 13 |
| Add file sanitization layer for OCR admission processing | ARCHITECTURE_REVIEW.md Finding 2 (Security Impact) | HIGH — prevents malicious file upload attacks | P1 — CRITICAL | Security Team Lead | Sprint 11 |

### Architecture Modernization

| Modernization Item | Source | Impact | Priority | Owner | Target Sprint |
|---|---|---|---|---|---|
| Enforce mandatory Route → Service → Repository → Firestore architecture across all routes | ARCHITECTURE_REVIEW.md Summary; RRR.md Section 2 | HIGH — establishes consistent, testable, secure architecture pattern | P1 — CRITICAL | Enterprise Architect | Sprint 10–12 |
| Migrate all singleton exports to dependency injection container | ARCHITECTURE_REVIEW.md Finding 9 (Dependency Impact) | LOW — improves testability and module interchangeability | P3 — LOW | Backend Architecture Team Lead | Sprint 15 |
| Implement module extraction strategy for clean dependency graph | ARCHITECTURE_REVIEW.md Finding 8 (Dependency Impact) | LOW — enables safe refactoring and module reuse | P3 — LOW | Enterprise Architect | Sprint 16 |

---

## PHASE 6 — EXECUTIVE SUMMARY

### Board-Level Executive Summary

**Project:** EduPilot Enterprise Architecture Modernization  
**Date:** 2026-08-04  
**Reviewing Body:** Fortune 500 Enterprise Governance Board (EGB)  

#### Current State Assessment

The EduPilot codebase is in a **deployable but architecturally non-compliant** state. The mandatory enterprise architecture mandates the chain Route → Application Service → Repository → Firestore. While the repository layer is fully compliant (81+ repositories extending BaseRepository with typed interfaces), and the service layer is mature (30+ services implementing domain interfaces), **11 API routes violate the mandatory architecture** by directly instantiating repositories or external libraries without service wrappers.

#### Key Findings

1. **Testing and Build Health:** The codebase has zero TypeScript errors, 698/698 tests passing (including architecture compliance tests), and a successful production build generating all 85 static pages. This provides a verified safety net for refactoring.

2. **Architecture Violations:** Three categories of violations exist:
   - **Direct repository instantiation** in 6 routes (17 instances), most severely in the configuration dashboard (7 repositories at module scope)
   - **Missing service layer** for 9 routes using external libraries (AI agent registry, Stripe SDK, QStash webhooks, OCR libraries, event workers, education rules engine)
   - **Direct Firestore SDK import** in the classes route (FieldValue from firebase-admin/firestore)

3. **Security Concerns:** Direct repository access bypasses service-layer authorization checks. Stripe checkout logic in route handlers exposes payment flow details. OCR admission route processes user-uploaded files without sanitization.

4. **Positive Findings:** No circular dependencies, no routes calling Firestore directly, no services calling Firestore directly, no TODO/FIXME items, and singleton exports for services and repositories are functioning correctly.

#### Governance Decision

The Enterprise Governance Board issues **CONDITIONAL RELEASE APPROVAL**. The release may proceed to staged merge with the following conditions:

- **Batch 1 (Infrastructure & Compliance Baseline)** merges immediately — no code changes required; verifies the deployable baseline.
- **Batches 2–4 (REFACTOR)** merge according to the sprint roadmap:
  - **Sprint 10:** Refactor direct repository instantiation (configuration dashboard is highest priority)
  - **Sprint 11:** Create service wrappers for AI, billing, webhook, OCR, and event routes
  - **Sprint 12:** Remove Firestore SDK import from classes route and defer lint warnings/unused exports
- **Batch 5 (DEFER)** is non-blocking and deploys after Batches 2–4.

All rollback plans are additive and non-breaking. No data migration is required. The same API contracts are preserved throughout the migration.

#### Risk Summary

| Risk Category | Rating | Mitigation |
|---|---|---|
| Technical Risk | MEDIUM | Additive refactoring; each route can be refactored independently |
| Business Risk | MEDIUM | Staged rollout; configuration dashboard has highest priority |
| Security Risk | MEDIUM | Centralizing payment, webhook, and OCR logic in services improves posture |
| Rollback Risk | LOW | All refactoring is additive; git revert restores previous state |
| Performance Risk | LOW | Shared service instances replace per-request instantiation |

#### Recommendation

Proceed with **CONDITIONAL RELEASE APPROVAL** and staged merge per the sprint roadmap. The codebase is production-safe today, but full architectural compliance requires the documented refactoring in Batches 2–4.

---

## FINAL BOARD DECISION

**CONDITIONAL RELEASE APPROVAL**

The Enterprise Governance Board approves the release for staged merge based exclusively on the supplied governance documents:

- ENTERPRISE_EVIDENCE.md confirms zero TypeScript errors, 698/698 tests passing, successful build, no circular dependencies, and no direct Firestore access from routes or services.
- ARCHITECTURE_REVIEW.md documents 3 REFACTOR findings (direct repository instantiation, missing service layer, direct Firestore SDK import), 8 KEEP findings, and 2 DEFER findings, all with additive rollback plans and no breaking API changes.
- ADR.md provides 5 Architecture Decision Records (ADR-001 through ADR-005) covering all REFACTOR and DEFER findings with complete decision rationale, alternatives considered, and sprint assignments.
- RRR.md Section 8 documents the CONDITIONAL RELEASE APPROVAL decision with 6 supporting justifications derived exclusively from the above governance documents.

The release is approved for Batch 1 (Infrastructure & Compliance Baseline) to merge immediately. Batches 2–4 (REFACTOR) are approved for staged merge per the Sprint 10–12 roadmap. Batch 5 (DEFER) is non-blocking. No finding constitutes a blocking condition.

**This decision is justified exclusively by the supplied governance documents and does not incorporate any external evidence or inference.**
