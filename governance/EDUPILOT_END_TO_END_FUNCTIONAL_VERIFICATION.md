# EduPilot End-to-End Functional Verification

**Audit date:** 2026-08-18
**Scope:** current repository worktree; no production Firestore or external account was accessed.
**Audit status:** INCOMPLETE — source, automated tests, and production build were inspected; live Firebase/Auth/Stripe/QStash execution requires an isolated environment.

## 1. Executive Summary

**Overall status: PARTIALLY VERIFIED.** The repository has a well-established Next.js → route-helper → service → repository → Firestore architecture, but not every claimed business domain has a complete operational model. This audit verified that configuration provisioning / operational master-data integration is now in place. A previous fix (commit `6efeed8`) completed the hook response-envelope remediation; that is distinct from the current provisioning work.

`npx tsc --noEmit`, `npm run lint`, `npm test -- --runInBand`, and `npm run build` completed successfully. Lint has two pre-existing warnings; the build has a Sentry transitive-dependency warning.

## 2. Architecture Map

`UI → hooks → app/api/v1 route → withAuth/withTenant/withPermission → service → repository → Firestore → events/outbox/jobs → read service/API → UI`.

Evidence: `app/api/v1/**/route.ts` (121 routes), `route-helpers/`, `services/` (62), `repositories/` (94), `lib/events/`, `lib/workers/`. Canonical data is tenant-scoped using `tenantId`; route helpers derive it from authenticated context rather than client payload.

## 3. Entity Inventory

| Domain | Canonical persistence/evidence | Status |
|---|---|---|
| Tenant/configuration | `tenants/{tenantId}/settings/config`, `ConfigurationService` | FIXED / test verified |
| Academic year | `academicYears`, `AcademicYearRepository` | FIXED / test verified |
| Class and section | canonical `sections` documents keyed by `classGrade` + `sectionName` | FIXED / test verified |
| Student/parent/staff | `students`, `parents`, `staff` repositories/services | PARTIAL |
| Attendance | `attendance`, `AttendanceService` | TEST VERIFIED |
| Fees | `fees`, `FeesService` | PARTIAL |
| Marks/results | `marks`; results derived by `MarksService` | PARTIAL — no exam entity link |
| Curriculum/syllabus | configuration and `syllabus` repository | PARTIAL |
| Library/transport/hostel/facilities | corresponding repositories | UNVERIFIED |
| Quiz | `quizzes`, `quiz_submissions` | FIXED / test verified |
| Exams / fee structures / student invoices | no complete create-to-read operational lifecycle found | MISSING / PARTIAL |
| Events/jobs | event outbox, QStash, workers | PARTIAL |

## 4. Student End-to-End Verification

**STATUS: PARTIAL / FIXED.**

Data path: `students UI → hooks → /api/v1/students → route helpers → StudentService → StudentRepository → students → StudentService → student pages/360`.

Evidence: `services/StudentService.ts`, `repositories/student.repository.ts`, `app/api/v1/students/route.ts`, `app/api/v1/students/360/route.ts`, and `__tests__/services/student-360.service.test.ts`.

Fixed: `student360` now reads tenant-scoped attendance, fees, marks, behavior, and timeline data rather than returning literals. Partial updates now merge persisted domain data before mapping, preventing omitted nested fields from being overwritten by create-time defaults. The test proves aggregate lineage and cross-tenant no-read behavior.

Still unverified: actual browser form, Firebase session, live Firestore indexes, parent reverse-link behavior, and external notifications.

## 5. School Configuration Verification

**STATUS: FIXED / TEST VERIFIED.**

Data path: `school setup UI → /api/v1/settings/school-configuration → ConfigurationService → ConfigurationRepository → settings/config → ConfigurationProvisioningService → academicYears/sections/departments → dashboard read`.

`ConfigurationService.saveAndPublishConfiguration` now invokes provisioning, fails visibly on provisioning failure, writes the returned `academicYearId` into configuration metadata, and only caches after successful provisioning. The route no longer overwrites the raw configuration cache with its view model. Evidence: `services/configuration.service.ts`, `services/configuration-provisioning.service.ts`, `app/api/v1/settings/school-configuration/route.ts`, `__tests__/services/configuration.service.test.ts`, and in-memory Firestore `__tests__/services/configuration-provisioning.integration.test.ts`.

## 6. Staff Verification

**STATUS: UNVERIFIED.** Staff repository/service and routes exist, but no live tenant lifecycle was run.

## 7. Class/Section/Subject Verification

**STATUS: FIXED / TEST VERIFIED.**

The operational model represents a class/section pair in `sections`; a class count is unique `classGrade`, while section count is documents. Provisioning is idempotent and does not resurrect soft-deleted sections. Evidence: `repositories/section.repository.ts`, `services/configuration-dashboard.service.ts`, `__tests__/services/configuration-dashboard.service.test.ts`, and configuration-provisioning integration tests.

## 8. Attendance Verification

**STATUS: TEST VERIFIED / LIVE UNVERIFIED.**

`AttendanceService` writes deterministic student/date records and reads them tenant-scoped. Student 360 now consumes the same student-scoped read repository. No live Firestore run was authorized.

## 9. Fees Verification

**STATUS: PARTIAL / FIXED.**

The fee model stores `status` and `amountPaid`; reminders previously queried a nonexistent `paid` field. `FeesRepository.findWithFilters` now interprets `paid` from persisted `status`, and reminders use `amountPaid`. The scheduled route delegates to `FeeReminderService`. Evidence: `repositories/fees.repository.ts`, `services/fee-reminder.service.ts`, `app/api/v1/jobs/fee-reminder/route.ts`, `repositories/fees.repository.test.ts`.

Fee structures, student invoices, separate payment records, and an authoritative outstanding-balance model remain PARTIAL/MISSING.

## 10. Exams Verification

**STATUS: MISSING.** No complete exam entity/repository/create API was found. Do not infer one from marks terminology.

## 11. Marks/Results Verification

**STATUS: PARTIAL.** Marks are tenant-scoped and results are computed on read (`services/marks.service.ts`). They are not tied to an exam ID or persisted result entity; report-card lifecycle is unverified.

## 12. Curriculum/Syllabus Verification

**STATUS: PARTIAL.** Configuration stores subjects; syllabus has repository/routes. Operational propagation to assessment was not proven.

## 13. Dashboard Verification

**STATUS: FIXED / TEST VERIFIED.** Dashboard services no longer convert repository failures into factual zeroes. Configuration dashboard counts classes as unique grades and sections as canonical documents. Evidence: `services/dashboard.service.ts`, `services/configuration-dashboard.service.ts`, `__tests__/services/configuration-dashboard.service.test.ts`.

## 14. Analytics Verification

**STATUS: PARTIAL.** Analytics services/routes exist, but no isolated tenant runtime scenario was executed.

## 15. Reports Verification

**STATUS: PARTIAL.** Report worker paths exist. Signed QStash delivery is not live-verified.

## 16. Data Lineage

Verified downstream reads:

- Configuration → academic year, sections, departments, configuration dashboard.
- Student → attendance, fees, marks, behavior, timeline via Student 360.
- Quiz submission → `quiz_submissions` with supplied trusted `tenantId` → tenant-scoped quiz read.
- Stripe checkout → subscription metadata → signed webhook service calls.

## 17. Tenant Isolation

**STATUS: FIXED / PARTIALLY TEST VERIFIED.** The quiz repository now persists the trusted service tenant ID rather than relying on caller data. Student 360 does not read downstream data when tenant-scoped student lookup fails. Full route-by-route IDOR testing remains unverified.

## 18. Authorization

**STATUS: FIXED / PARTIALLY TEST VERIFIED.** `schoolAdmin` and `superAdmin` now receive the canonical admin permission set used by both RBAC wrappers. Evidence: `lib/auth/roles.ts`, `__tests__/lib/auth/roles.test.ts`. Agent-specific authorization remains unresolved (see limitations).

## 19. Events/Jobs

**STATUS: FIXED / PARTIAL.** QStash signature verification now returns its validated raw body; the webhook parses that value instead of reading the request twice. Evidence: `lib/qstash-verify.ts`, `app/api/webhooks/qstash/route.ts`, `__tests__/lib/qstash-verify.test.ts`.

## 20. API Contract Verification

**STATUS: VERIFIED.** Hook response-envelope remediation was completed in commit `6efeed8` (previous fix). The current batch addresses configuration provisioning / operational master-data integration. The 121 routes were inventoried and the configuration dashboard API response contract was exercised by the new integration test.

## 21. Cache Consistency

**STATUS: PARTIAL / FIXED.** Configuration cache is only populated with the raw configuration by the service; API view-model reads no longer poison that cache. Write/read timing against live cache infrastructure remains unverified.

## 22. Error Handling

**STATUS: FIXED / PARTIAL.** Critical dashboard and parent-dashboard reads no longer swallow failures as empty/zero data. Configuration provisioning fails rather than producing a false successful publication. Other noncritical fallback patterns require a route-by-route follow-up.

## 23. Orphan Record Analysis

**STATUS: UNVERIFIED.** No production dataset was inspected. The in-memory provisioning scenario verifies no duplicate normalized section/department creation and no soft-delete resurrection.

## 24. Defects Found

| Priority | Defect | Resolution |
|---|---|---|
| P0 | Quiz submissions omitted tenant ID | FIXED |
| P0 | QStash webhook read request body twice | FIXED |
| P1 | Published configuration did not provision operational entities | FIXED |
| P1 | Student 360 returned hard-coded aggregate values | FIXED |
| P1 | Partial student update could erase persisted fields | FIXED |
| P1 | Global admin aliases received no permissions | FIXED |
| P1 | Dashboard data errors became real-looking zeroes | FIXED |
| P1 | Stripe free plan used an unauthenticated self-request; subscription events lacked metadata | FIXED |
| P2 | Fee reminders queried nonexistent payment field | FIXED |
| P2 | Class metric double-counted class/section records | FIXED |
| P1 | Exams/fee-structure/invoice lifecycle is incomplete | OPEN / MISSING |
| P1 | AI agent route lacks per-agent authorization policy | OPEN |

## 25. Fixes Applied

See the evidence files named above. Changes are minimal and retain Route → Service → Repository → Firestore boundaries; no production data operation occurred.

## 26. Tests Added/Updated

- `__tests__/services/configuration.service.test.ts`
- `__tests__/services/configuration-provisioning.service.test.ts`
- `__tests__/services/configuration-provisioning.e2e.integration.test.ts`
- `__tests__/services/configuration-dashboard.service.test.ts`
- `__tests__/services/student-360.service.test.ts`
- `__tests__/lib/auth/roles.test.ts`
- `__tests__/lib/qstash-verify.test.ts`
- `__tests__/api/stripe-create-checkout.test.ts`
- updated fee and quiz repository tests

## 27. Validation Results

| Command | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS with 2 existing warnings |
| `npm test -- --runInBand` | PASS — 75 suites, 774 tests |
| `npm run build` | PASS with Sentry transitive dependency warning and same lint warnings |

## 28. Remaining Limitations

- Live Firebase Auth/Firestore, rules, indexes, and tenant A/B isolation were not executable safely here.
- Stripe, QStash, email, Redis/Upstash, and Vercel runtime paths require sandbox credentials/test accounts.
- No full “school day” workflow can be honestly asserted because Exam and fee-structure/invoice domains are incomplete.
- `app/api/v1/ai/agents/route.ts` is authenticated but does not show an explicit per-agent authorization policy.

## 29. Production Readiness Matrix

| Critical flow | Status |
|---|---|
| Configuration publish/provision/read | TEST VERIFIED; live Firebase UNVERIFIED |
| Student CRUD/360 read | PARTIAL / TEST VERIFIED |
| Tenant isolation | PARTIAL / FIXED |
| Authorization | PARTIAL / FIXED |
| Attendance | TEST VERIFIED; live UNVERIFIED |
| Fees | PARTIAL |
| Exams/results | MISSING / PARTIAL |
| Dashboards | TEST VERIFIED; live cache UNVERIFIED |
| Reports/jobs | PARTIAL |

**Do not treat this report as production sign-off until an isolated Firebase emulator/test-tenant school-day scenario and external webhook tests are completed.**
