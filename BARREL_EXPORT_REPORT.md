# Barrel Export Report

**Generated:** 2026-07-28
**Sprint:** PI-1 Final Certification Audit

---

## Executive Summary

Barrel exports are severely incomplete. Only `dto/index.ts` has acceptable coverage (93.3%). All other barrel files are missing the majority of exports.

---

## Barrel Export Statistics

| Barrel File | Exports | Total Files | Coverage | Status |
|-------------|---------|-------------|----------|--------|
| `services/index.ts` | 6 | 51 | 11.8% | FAIL |
| `repositories/index.ts` | 1 | 43 | 2.3% | FAIL |
| `interfaces/index.ts` | 80 | 80 | 100.0% | PASS |
| `types/index.ts` | 2 | 20 | 10.0% | FAIL |
| `entities/index.ts` | 0 | 5 | 0.0% | FAIL |
| `validators/index.ts` | 0 | 17 | 0.0% | FAIL |
| `dto/index.ts` | 14 | 15 | 93.3% | PASS |

---

## Missing Exports

### services/index.ts (6/51)
Missing 45 service exports including:
- `academic-year.service.ts`
- `addons.service.ts`
- `admit-card.service.ts`
- `certificate.service.ts`
- `chat.service.ts`
- `fee-reminder.service.ts`
- `leave.service.ts`
- `ledger.service.ts`
- `settings-general.service.ts`
- `syllabus.service.ts`
- `user-admin.service.ts`
- And 34 others

### repositories/index.ts (1/43)
Missing 42 repository exports. Uses object-literal pattern instead of standard barrel.

### types/index.ts (2/20)
Missing 18 type exports including:
- `attendance.ts`
- `auth.ts`
- `bus.ts`
- `configuration/*.ts`
- `curriculum/*.ts`
- `fees.ts`
- `homework.ts`
- `marks.ts`
- `menu.ts`
- `ocr.ts`
- `parents.ts`
- `quiz.ts`
- `staff.ts`
- `student.ts`
- `teacher.ts`
- `timetable.ts`
- `video-lecture.ts`

### entities/index.ts (0/5)
File does not exist. Missing all 5 entity exports.

### validators/index.ts (0/17)
File does not exist. Missing all 17 validator exports.

---

## Circular Export Check

No circular exports detected. All barrel files import from their respective directories without circular references.

---

## Verification Evidence

**Command:** Node script analyzing all barrel files
**Result:** Only dto/index.ts and interfaces/index.ts have acceptable coverage

---

## Conclusion

Barrel export compliance: **FAIL**

This is the only major unresolved item from PI-1. All barrel exports must be completed in Sprint 7.
