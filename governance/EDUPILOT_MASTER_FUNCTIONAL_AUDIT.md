# EDUPILOT — MASTER FUNCTIONAL AUDIT

**Audit Date:** 2026-08-11
**Auditor Role:** Principal Enterprise SaaS Architect + Full-Stack / QA / DB / Security Engineer
**Repository:** /Users/imranhaidersandhu/Documents/edupilot
**Method:** Read-only source inspection + static validation. No destructive ops, no git commit/push, no production data touched.

---

## 0. GOVERNANCE / SAFETY

| Constraint | Status |
|---|---|
| No deletes / git reset / checkout | ✅ Honored |
| No production Firestore writes | ✅ Honored (read-only audit) |
| No commits / pushes | ✅ Honored |
| Evidence-first, no blind refactor | ✅ Honored |
| Runtime tests requiring data | ⛔ No safe emulator/test tenant available → workflows marked `BLOCKED / UNVERIFIED` where runtime proof was needed |

---

## 1. STATIC VALIDATION (ACTUAL RESULTS, UNMODIFIED CODE)

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | ✅ 0 errors |
| Lint | `npm run lint` | ✅ 0 errors, 2 warnings (react-hooks exhaustive-deps; `<img>` in staff page) |
| Unit/Integration | `npm test` | ✅ **698 passed / 698 total across 65 suites** |
| Build | `npm run build` | NOT executed (long; tsc+lint+test already green; build equivalent deferred) |

> Conclusion: the codebase compiles and the existing test suite is green. This confirms **CODE VERIFIED** for the paths covered by tests, but NOT **RUNTIME VERIFIED** for live Firestore workflows.

---

## 2. ARCHITECTURE MAP (PROVEN)

```
UI (app/(protected)/...)
   → hooks (hooks/use*.ts)
   → API Route (app/api/v1/.../route.ts)            [121 route files]
       → Route Middleware (middleware.ts: auth-cookie gate only)
       → Route Helpers (route-helpers/withAuthAndPermission, withTenant)
       → Service (services/*.service.ts, 60 files, DI via interfaces/)
       → Repository (repositories/*.repository.ts, 93 files)
       → Firestore (firebase-admin)
       → Events (lib/events eventBus) → Outbox (event-outbox) → QStash → Workers → Subscribers
       → External APIs (Gemini AI, Stripe, SendGrid/Resend, Twilio)
```

**Layering is correctly enforced for the canonical modules** (students, fees, marks, attendance, settings, dashboard, auth). Services implement interfaces; repositories are injected. This is a KEEP-grade architecture.

### Deviations found
- `app/api/v1/classes/route.ts` imports `SectionRepository` directly and runs audit logic inline → REFACTOR.
- `app/api/v1/jobs/fee-reminder/route.ts` runs full business logic (overdue query + email loop) directly in the route → REFACTOR/BUG.
- `app/api/v1/jobs/attendance-report/route.ts` mixes direct repo + service → REFACTOR.
- `app/api/v1/education/rules/route.ts` calls domain engine directly (no service wrapper) → DEFER.
- `jobs/*` and `cron/*` routes are guarded only by `CRON_SECRET`, bypassing `withAuth`/`withTenant` → DEFER (acceptable for cron but inconsistent scoping).

---

## 3. MODULE INVENTORY (40 MODULES)

| # | Module | Status | Evidence |
|---|---|---|---|
| 1 | Auth (Firebase Admin cookie session) | KEEP | `lib/firebase-admin.ts`, `lib/auth/auth-server.ts` |
| 2 | Tenant resolution | KEEP (dual-path) | `services/tenant.resolver.ts`, `route-helpers/withTenant.ts` |
| 3 | School Configuration (write) | KEEP (writer) | `services/configuration.service.ts` |
| 4 | Students | KEEP + BUG | `services/StudentService.ts`, `repositories/student.repository.ts` |
| 5 | Parents | KEEP | `repositories/parents.repository.ts` |
| 6 | Admissions | PARTIAL | admission approval service exists; OCR route only extracts text |
| 7 | Staff | KEEP | `repositories/staff.repository.ts` |
| 8 | Teachers | KEEP (part of staff) | — |
| 9 | Academic Years | KEEP | `repositories/academic-year.repository.ts` |
| 10 | Classes | KEEP (collection `sections`) | `repositories/class.repository.ts` |
| 11 | Sections | KEEP | `repositories/section.repository.ts` |
| 12 | Subjects | KEEP (in config) | `configuration.service.ts` |
| 13 | Curriculum | KEEP | `curriculum-engine` tested |
| 14 | Attendance | KEEP | `services/attendance.service.ts` |
| 15 | Fees | KEEP (write) + BUG | `services/fees.service.ts` |
| 16 | Invoices | KEEP (Stripe subscription only) | `services/invoice.service.ts` |
| 17 | Payments | KEEP (fee=doc) + BUG | `fees.repository.ts` |
| 18 | Exams | **MISSING** | no exam entity/repo/collection |
| 19 | Marks | KEEP | `services/marks.service.ts` |
| 20 | Results | KEEP (derived) | `marks.service.ts:getAggregatedResults` |
| 21 | Timetable | PARTIAL | validators exist; no student link |
| 22 | Homework | KEEP (permissions) | — |
| 23 | Lesson Plans | KEEP (permissions) | — |
| 24 | Library | KEEP (repo) | `libraryRepo` |
| 25 | Transport | KEEP (repo) | `transportRepo` |
| 26 | Hostel | KEEP (repo) | `hostelRepo` |
| 27 | Facilities | KEEP (repo) | `facilityRepo` |
| 28 | Reports | KEEP (worker) | `lib/workers/report.worker.ts` |
| 29 | Notifications | KEEP + REFACTOR | `lib/notifications.ts`, `lib/email.ts` |
| 30 | Dashboard | KEEP (layering) + BUG (data) | `configuration-dashboard.service.ts` |
| 31 | Analytics | KEEP | — |
| 32 | AI (Gemini) | KEEP (single provider) | `lib/ai/providers/GeminiProvider.ts` |
| 33 | Subscriptions | KEEP | `subscription.repository.ts` |
| 34 | Stripe | KEEP (webhook sig OK) + BUG | `stripe/webhook/route.ts` |
| 35 | Audit | KEEP | `audit.repository.ts` |
| 36 | GDPR / protected data | UNVERIFIED | not inspected |
| 37 | Background jobs | KEEP (arch) + BUG (QStash) | `lib/qstash-verify.ts` |
| 38 | Cron | KEEP | `cron/*` routes |
| 39 | File uploads | KEEP (firebase storage) | `lib/firebase-admin.ts` |
| 40 | Video lectures | KEEP (permissions) | — |
| 41 | Feature flags | KEEP (permissions) | — |

---

## 4. STUDENT 360 FUNCTIONAL TRACE

**Creation path (PROVEN):**
`POST /api/v1/students` → `StudentService.create` (`services/StudentService.ts:24`) → `CreateStudentSchema.parse` (`dto/CreateStudentDTO.ts:4`) → `StudentPersistenceMapper.toFirestore` → `StudentRepository.save` → `BaseRepository.create` writes `tenants/{tenantId}/students` with Firestore auto-id as `studentId`.

**tenantId:** taken from `context.user.tenantId` (`students/route.ts:25`), stored twice (service + base repo).

**Student 360 relationship graph (PROVEN edges only):**
```
Student doc (collection "students")
├── tenantId              ✅ PROVEN (base.repository.ts:34)
├── primaryParentId       ✅ PROVEN (singular; reverse link in parents.studentIds[])
├── classGrade            ✅ PROVEN but MISNAMED (DTO classId → stored as classGrade)
├── section               ✅ PROVEN (DTO sectionId → stored as "section", default "A")
├── comments[]            ✅ PROVEN
├── campusId              ❌ NOT stored (omitted by mapper; fromFirestore maps it to tenantId — BUG)
├── academicYearId        ❌ NOT on student doc
├── admissionId           ❌ NOT on student doc
├── attendance            ❌ reverse only (attendance.studentId); no student-side link
├── fees/invoices         ❌ reverse only (fee.studentId); 360 stub hardcoded 0
├── exams/marks/results   ❌ reverse only (marks.studentId); 360 stub hardcoded []
├── transport/hostel       ❌ absent from doc
└── student360 aggregate  ❌ HARDCODED STUBS (StudentService.ts:141-148)
```

**Key BUG:** `student360()` returns hardcoded zeros/empty arrays — the "Student 360" view is NOT implemented; it is a stub.

**Other bugs:** `classId`/`sectionId` naming drift (`classGrade`/`section`); `campusId` lost; `bulkCreate` feeds legacy-shaped rows into a schema expecting nested `personal/academic` → all bulk rows fail validation. `promote()` is a no-op stub.

---

## 5. SCHOOL CONFIGURATION DASHBOARD BUG (ROOT CAUSE PROVEN)

**Symptom:** After publishing config, dashboard shows School Name = N/A (actually resolves), Classes = 0, Teachers = 0, Students = 0, Completion = 0%.

**Root cause (BUG, CRITICAL):**
- The **wizard writes ONLY** `tenants/{tenantId}/settings/config` (a single embedded doc). `services/configuration.service.ts:181` (`publishConfiguration`) never writes to live `sections`/`staff`/`students` collections.
- The **dashboard reads** `classes`/`sections`/`students`/`staff` counts from LIVE collections via `getCounts` (`configuration-dashboard.service.ts:139-142`: `classRepo.getAll`, `sectionRepo.findAllActive`, `studentRepo.count`, `staffRepo.findAll`). These are empty for a freshly configured tenant.
- The `SCHOOL_SETUP_COMPLETED` subscriber only logs + invalidates cache (`lib/subscribers/lifecycle.subscriber.ts:44-54`) — it does NOT sync the academic structure into live collections.
- `calcCompletion` (`configuration-dashboard.service.ts:178-313`) marks 20 checks false → 0%.

**School Name** actually resolves correctly (both writer and reader use `config.school.name`); the prior governance doc blaming "envelope unwrap" is INCORRECT — the cause is the empty live collections.

**Fix options:** (a) dashboard counts Classes/Sections from embedded `config.academic.*` (low-risk), or (b) add a real sync step in publish/suscriber. Option (a) recommended.

---

## 6. FEES / EXAMS / ATTENDANCE

- **Fees:** create/read KEEP. **BUG:** `fees.repository.ts:39` filters by `paid` field that does not exist on `FeeDocument` (only `status`/`amountPaid`); `fee-reminder.service.ts:33` interpolates `${feeData.amount}` (field is `amountPaid`) → prints `undefined`. No balance/paidAmount computation.
- **Fee structure:** **MISSING** — `FeeStructureRepository` has only a read method; no write path; config route dir empty.
- **Invoice:** KEEP but only for Stripe subscription billing, NOT student fee invoices.
- **Exams:** **MISSING entirely** — no exam entity/repo/collection, no examId, no enrollment. Marks use free-text `term`/`subject`.
- **Marks:** KEEP. docId = `${studentId}_${term}_${subject}`.
- **Results:** KEEP (computed on-read; not persisted).
- **Attendance:** KEEP. Daily + 7-day trend only; **no monthly aggregation**. Uses `classGrade`/`section` strings.

---

## 7. TENANT ISOLATION

Spot-checked students/fees/attendance → all reads/writes enforce `where('tenantId','==',...)`. ✅
**BUG:** `repositories/quiz.repository.ts:22` `createSubmission(data, _tenantId)` ignores tenantId (underscore prefix) and writes `quiz_submissions` WITHOUT a tenantId field, while `findSubmissionsByQuiz` filters by tenantId → cross-tenant isolation broken at write. ✅ PROVEN.

---

## 8. RBAC / SECURITY

- **BUG (broken privilege):** `ROLE_PERMISSIONS` (`lib/auth/roles.ts`) defines only `admin/teacher/accountant/parent`. `superAdmin`/`schoolAdmin` (defined in `types/auth.ts`) have NO entries. `withPermission` (`lib/auth/withPermission.ts:19`) does `ROLE_PERMISSIONS[userRole] || []` → all `withPermission`-guarded routes return **403 for superAdmin/schoolAdmin**. `GLOBAL_ROLES` (`auth-server.ts:5`) is defined but never consulted. Super-admin analytics route is unreachable.
- **REFACTOR:** Two divergent `withPermission` implementations (`withPermission.ts` vs `rbac.ts`) with different signatures.
- **REFACTOR:** `ai/agents/route.ts:15` lets any authenticated user pick an arbitrary agent (finance/hr/admission/principal) — no role restriction.
- Permission checks happen only at route layer; no service-layer re-check (defense-in-depth gap). Tenant scoping in repos mitigates cross-tenant leakage.
- AI key passed in URL query string (`GeminiProvider.ts:44`) → leaks into logs. REFACTOR.
- Duplicate email systems (SendGrid `notifications.ts` + Resend `email.ts`). REFACTOR.
- **Telegram:** CONFIRMED ABSENT repo-wide (grep). Your "connected Telegram" claim is not reflected in this codebase.
- Stripe webhook signature verified ✅. Self-`fetch` activate may hit middleware; silent no-op on missing `metadata.tenantId`. BUG/MISSING.

---

## 9. EVENTS / JOBS

- Event-outbox + EventWorker + QStash + subscribers: KEEP (robust architecture).
- **BUG:** `lib/qstash-verify.ts:10` reads `req.text()` to verify signature; `app/api/webhooks/qstash/route.ts:17` then reads `req.json()`. In Next.js the Request body stream is single-read → `req.json()` throws → **ALL QStash jobs (report generation + event outbox processing) fail**. PROVEN. Fix: clone request or pass body through.

---

## 10. ARCHITECTURE SCORE (0–100, evidence-based)

| Dimension | Score | Rationale |
|---|---|---|
| Architecture | 82 | Clean layered design; minor route-layer violations |
| Data Integrity | 55 | classId/sectionId naming drift, campusId lost, fee field model broken, exams missing |
| Tenant Isolation | 80 | Strong in core repos; quiz repo breaks it |
| Security | 62 | superAdmin locked out; agent routing open; key-in-URL; no service-layer guard |
| API Consistency | 78 | Mostly Route→Service→Repository; jobs routes + classes route deviate |
| Service Layer | 85 | Well-structured DI |
| Repository Layer | 80 | Solid; quiz + fee filter bugs |
| Testing | 75 | 698 passing but coverage gaps (config dashboard, exams, tenant isolation) |
| Runtime Reliability | 58 | QStash body double-read breaks background jobs; Stripe silent failures |
| Observability | 70 | Logger + Sentry present; no structured metrics |
| Maintainability | 68 | Dual withPermission, dual email, doc clutter (100+ generated .md), leetspeak comments |

**Overall: ~71 / 100** — architecturally sound foundation, but several P0/P1 correctness and security bugs block safe production use of key workflows.

---

## 11. FINDINGS (PRIORITIZED)

### P0 CRITICAL
| ID | Module | File | Behavior | Expected | Action |
|---|---|---|---|---|---|
| F-01 | Config Dashboard | `configuration-dashboard.service.ts:139-142` | Counts from empty live collections after publish → 0/0% | Count from config or sync live | Sync structure OR count from config |
| F-02 | RBAC | `lib/auth/roles.ts` + `withPermission.ts:19` | superAdmin/schoolAdmin get 403 on all guarded routes | Global roles bypass/granted | Add superAdmin/schoolAdmin to ROLE_PERMISSIONS or consult GLOBAL_ROLES |
| F-03 | Jobs | `lib/qstash-verify.ts:10` + `qstash/route.ts:17` | QStash webhook throws on double body read → all jobs fail | Jobs process | `req.clone()` or pass body through |

### P1 HIGH
| ID | Module | File | Behavior | Expected | Action |
|---|---|---|---|---|---|
| F-04 | Tenant | `quiz.repository.ts:22` | quiz_submissions written without tenantId | tenant-scoped | Pass & store tenantId |
| F-05 | Student360 | `StudentService.ts:141-148` | 360 aggregate hardcoded stubs | live aggregation | Wire attendance/fees/marks repos |
| F-06 | Fees | `fee-reminder.service.ts:33` + `fees.repository.ts:39` | amount undefined; `paid` filter on missing field | correct balance/reminder | Fix field names; compute balance |
| F-07 | Stripe | `stripe/webhook/route.ts` + `create-checkout` | silent no-op on missing metadata.tenantId; self-fetch may hit middleware | reliable activation | Add logging/DLQ; call service directly |
| F-08 | AI | `ai/agents/route.ts:15` | any user invokes any agent | role-restricted agents | Map agent→permission |

### P2 MEDIUM
| ID | Module | File | Behavior | Expected | Action |
|---|---|---|---|---|---|
| F-09 | Students | `StudentPersistenceMapper.ts:62-63` | classId→classGrade, sectionId→section | consistent IDs | Rename/alias |
| F-10 | Students | `StudentPersistenceMapper.ts:120` | campusId mapped from tenantId | stored campusId | Persist campusId |
| F-11 | Students | `StudentService.ts:196` bulkCreate | legacy rows fail CreateStudentSchema | bulk succeeds | Adapt mapper |
| F-12 | Exams | (none) | no exam module | exam entity/repo/enrollment | Implement |
| F-13 | Fee Structure | `fee-structure.repository.ts` | read-only; no write | create fee structures | Add write path |
| F-14 | Attendance | `attendance.service.ts` | no monthly aggregation | monthly summary | Add method |
| F-15 | Security | `GeminiProvider.ts:44` | API key in URL query | header/auth | Move to header |
| F-16 | Notifications | `notifications.ts` + `email.ts` | two email systems | one system | Consolidate |
| F-17 | RBAC | `withPermission.ts` vs `rbac.ts` | two impls | one impl | Unify |

### P3 LOW
| ID | Module | File | Action |
|---|---|---|---|
| F-18 | Routes | `classes/route.ts`, `jobs/*` | Move logic to services |
| F-19 | Config Dashboard | `configuration-dashboard.service.ts:179` | dead tenantId param |
| F-20 | Repo | root clutter (100+ generated .md/.py) | Move audit docs out of root |
| F-21 | Lint | `staff/page.tsx`, `promote/page.tsx` | fix 2 warnings |

---

## 12. EXECUTIVE ANSWERS (24 questions)

1. **Does Student creation work?** CODE VERIFIED yes (route→service→repo→Firestore).
2. **Where stored?** `tenants/{tenantId}/students` (collection `"students"`), Firestore auto-id.
3. **Where linked?** tenantId (✅), primaryParentId (✅), classGrade/section (misnamed).
4. **Links to Class?** Partial — stored as `classGrade` not `classId`.
5. **Links to Section?** Yes as `section`.
6. **Links to Parent?** Yes via `primaryParentId` (singular; reverse in parents repo).
7. **Links to Fees?** Reverse only (fee.studentId); no student-side fee array.
8. **Links to Exams?** No exam module exists.
9. **Links to Attendance?** Reverse only (attendance.studentId).
10. **Config persists?** Yes — to `settings/config` doc (verified writer).
11. **Dashboard reads same data?** Partially — School Name/Subjects from config (correct); counts from empty live collections (BUG).
12. **Tenant boundaries safe?** Mostly; quiz repo breaks isolation (F-04).
13. **APIs consistent Route→Service→Repository?** Mostly; jobs + classes deviate.
14. **Production-ready:** Auth, Students CRUD, Attendance, Marks, Results, Stripe webhook, Subscriptions, Event/Jobs architecture (except QStash bug), RBAC for admin/teacher/accountant/parent.
15. **Broken:** Config Dashboard counts (F-01), superAdmin access (F-02), QStash jobs (F-03), Student360 (F-05), fee reminders (F-06), Exams (missing).
16. **Partial:** Admissions, Timetable, AI agents (routing), Fee structure.
17. **Unverified:** GDPR, runtime E2E (no safe test env), monthly attendance, live Firestore counts.
18. **P0/P1:** F-01..F-08 above.
19. **Must fix before prod:** F-01 (dashboard), F-02 (superAdmin), F-03 (QStash), F-04 (quiz tenant), F-06 (fees), F-07 (stripe).
20. **Do NOT change (works):** Core layered architecture, tenant scoping in students/fees/attendance, Stripe signature verification, event-outbox/worker design, Firebase auth cookie flow, existing 698 passing tests.

---

*Generated by Master Functional Audit. CODE VERIFIED / TEST VERIFIED / RUNTIME VERIFIED classifications applied per evidence. No source modified.*
