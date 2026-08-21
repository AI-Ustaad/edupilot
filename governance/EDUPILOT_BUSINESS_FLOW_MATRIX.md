# EDUPILOT — BUSINESS FLOW MATRIX

Canonical E2E flow: School Configuration → Academic Year → Class → Section → Subject → Teacher → Student → Parent → Attendance → Fee Structure → Invoice → Payment → Exam → Marks → Result → Dashboard → Reports

Status legend: ✅ WORKS | ⚠️ PARTIAL | ❌ BROKEN | ❌ MISSING | ⛔ BLOCKED/UNVERIFIED

| # | Transition | Producer | Consumer | ID Passed | Firestore Location | Runtime Status |
|---|---|---|---|---|---|---|
| 1 | Config → Academic Year | config.service | academicYearRepo | tenantId | settings/config | ⚠️ config stored; AY not auto-created |
| 2 | Config → Class/Section | config.service | (none) | — | settings/config only | ❌ not synced to `sections` |
| 3 | Config → Subject | config.service | config doc | — | settings/config | ✅ stored |
| 4 | Class → Section | classRepo | sectionRepo | classGrade | sections | ⚠️ string-based |
| 5 | Teacher → Class | staffRepo | (manual) | staffId | staff | ⚠️ PARTIAL |
| 6 | Student create | students/route | StudentService | tenantId | students | ✅ CODE VERIFIED |
| 7 | Student → Class | StudentService | student doc | classGrade | students | ⚠️ misnamed |
| 8 | Student → Section | StudentService | student doc | section | students | ✅ |
| 9 | Student → Parent | students/route | parents repo | primaryParentId | parents (reverse) | ✅ |
| 10 | Parent create | parents/route | ParentsService | tenantId | parents | ✅ |
| 11 | Attendance → Student | attendance/route | AttendanceService | studentId | attendance | ✅ CODE VERIFIED |
| 12 | Attendance → Class | AttendanceService | attendance doc | classGrade | attendance | ⚠️ string-based |
| 13 | Fee Structure create | (NONE) | — | — | — | ❌ MISSING |
| 14 | Fee → Student | fees/route | FeesService | studentId | fees | ✅ create; ❌ balance broken |
| 15 | Invoice → Payment | invoice.service | Stripe webhook | tenantId(meta) | invoices | ✅ subscription; ❌ student invoices missing |
| 16 | Exam create | (NONE) | — | — | — | ❌ MISSING |
| 17 | Marks → Student | marks/route | MarksService | studentId | marks | ✅ CODE VERIFIED |
| 18 | Marks → Exam | (NONE) | — | term(string) | marks | ❌ no examId |
| 19 | Result calc | marks.service | results route | — | (computed) | ✅ derived |
| 20 | Result → Parent | publishResults | notification subscriber | studentId | users/{uid}/notifications | ✅ |
| 21 | Dashboard read | dashboard/route | configurationDashboardService | tenantId | settings/config + live coll. | ❌ counts 0 (F-01) |
| 22 | Reports | report.worker | QStash | — | — | ❌ QStash body bug (F-03) |
| 23 | Audit log | eventBus | audit subscriber | tenantId | audit | ✅ |

---

## VERDICT BY FLOW
- **Student lifecycle (CRUD):** ✅ CODE VERIFIED (creates, stores, links parent/class/section)
- **Attendance:** ✅ CODE VERIFIED
- **Marks/Results:** ✅ CODE VERIFIED (no exam entity)
- **Fees:** ⚠️ PARTIAL (create works; balance/reminder broken; structure missing)
- **School Configuration Wizard → Dashboard:** ❌ BROKEN (F-01)
- **Exams:** ❌ MISSING
- **Student 360:** ❌ STUB (F-05)
- **Background Reports/Jobs:** ❌ BROKEN (F-03 QStash)
- **Tenant isolation (quiz):** ❌ BROKEN (F-04)
- **superAdmin access:** ❌ BROKEN (F-02)

*Matrix derived strictly from source evidence. Runtime status reflects code verification; full RUNTIME VERIFIED requires a safe emulator/test tenant which was not available (marked ⛔ where applicable).*
