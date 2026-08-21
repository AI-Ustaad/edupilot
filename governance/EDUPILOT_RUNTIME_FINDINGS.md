# EDUPILOT — RUNTIME FINDINGS

Classification: ✅ RUNTIME VERIFIED | 🟡 TEST VERIFIED (green suite) | 🔵 CODE VERIFIED (source only) | ⛔ UNVERIFIED (no safe runtime env) | ❌ BROKEN (proven defect)

---

## STATIC / TEST RUNTIME
| Check | Result | Status |
|---|---|---|
| `tsc --noEmit` | 0 errors | ✅ |
| `next lint` | 0 errors, 2 warnings | 🟡 |
| `jest` | 698 passed / 65 suites | 🟡 |
| `next build` | not executed | ⛔ |
| Live Firestore E2E | no emulator/test tenant | ⛔ |

---

## PROVEN RUNTIME DEFECTS (source-confirmed, would fail at runtime)

### ❌ F-01 Config Dashboard 0% (HIGH IMPACT)
- Evidence: `configuration-dashboard.service.ts:139-142` counts from `classRepo.getAll`/`sectionRepo.findAllActive`/`studentRepo.count`/`staffRepo.findAll`; writer `configuration.service.ts:181` only writes `settings/config`.
- Runtime effect: after publishing, dashboard shows Classes=0, Teachers=0, Students=0, Completion=0%.
- Confidence: 🔵 CODE VERIFIED — root cause proven by reading both writer and reader.

### ❌ F-02 superAdmin/schoolAdmin 403 (HIGH IMPACT)
- Evidence: `roles.ts` lacks superAdmin/schoolAdmin; `withPermission.ts:19` `ROLE_PERMISSIONS[userRole] || []` → empty → 403.
- Runtime effect: global admin roles cannot use any `withPermission`-guarded route (incl. super-admin analytics).
- Confidence: 🔵 CODE VERIFIED.

### ❌ F-03 QStash webhook crash (HIGH IMPACT)
- Evidence: `qstash-verify.ts:10` `req.text()`; `qstash/route.ts:17` `req.json()` → second read throws.
- Runtime effect: ALL QStash jobs (report generation + event outbox drain) return 500 and retry-loop.
- Confidence: 🔵 CODE VERIFIED (Next.js Request single-read semantics well established).

### ❌ F-04 Quiz tenant isolation break
- Evidence: `quiz.repository.ts:22` `createSubmission(data, _tenantId)` writes without tenantId; reader filters by tenantId.
- Runtime effect: cross-tenant quiz submissions; tenant-scoped reads return nothing for the writer's tenant.
- Confidence: 🔵 CODE VERIFIED.

### ❌ F-05 Student360 hardcoded
- Evidence: `StudentService.ts:141-148` returns literal zeros/empty arrays.
- Runtime effect: 360 view shows no real attendance/fees/marks data.
- Confidence: 🔵 CODE VERIFIED.

### ❌ F-06 Fee reminder broken
- Evidence: `fee-reminder.service.ts:33` `${feeData.amount}` (field is `amountPaid`); `fees.repository.ts:39` `.where("paid")` on missing field.
- Runtime effect: reminder emails print `undefined`; overdue filter never matches.
- Confidence: 🔵 CODE VERIFIED.

### ❌ F-07 Stripe silent no-op / self-fetch
- Evidence: `stripe/webhook/route.ts` reads `metadata.tenantId` (missing → silent skip); `create-checkout` self-`fetch` to activate.
- Runtime effect: subscription may not activate; self-call may be blocked by middleware.
- Confidence: 🔵 CODE VERIFIED (partial).

### ⚠️ F-08 AI agent open routing
- Evidence: `ai/agents/route.ts:15` `agentRegistry.execute(agentType from body)` with only withAuth/withTenant.
- Runtime effect: any user can invoke finance/hr/admission/principal agents.
- Confidence: 🔵 CODE VERIFIED.

---

## WHAT WORKS (RUNTIME-SAFE PER EVIDENCE)
- Student CRUD + parent link + class/section link (🔵 CODE VERIFIED; 🟡 tests pass)
- Attendance create/read (🔵 + 🟡)
- Marks/Results (🔵 + 🟡)
- Auth cookie flow (🔵)
- Stripe webhook signature verification (🔵)
- Event-outbox + EventWorker architecture (🔵)
- Tenant scoping in students/fees/attendance (🔵)

---

## UNVERIFIED (needs safe env)
- GDPR / protected-data handling
- Monthly attendance aggregation (method absent)
- Live Firestore count correctness post-config
- Emulator-based E2E of full business flow
- Production build success

*No source modified. No production data accessed.*
