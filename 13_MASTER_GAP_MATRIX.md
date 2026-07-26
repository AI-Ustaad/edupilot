# 13_MASTER_GAP_MATRIX.md

**Project:** EduPilot Enterprise Multi-Tenant School Management SaaS  
**Date:** 2026-07-26  
**Verification Type:** Consolidated Gap Matrix  
**Status:** PRE-PRODUCTION — CRITICAL GAPS IDENTIFIED

---

## Executive Summary

| Category | Total Gaps | Critical | High | Medium | Low |
|----------|-----------|----------|------|--------|-----|
| RBAC | 8 | 2 | 3 | 2 | 1 |
| Tenant Isolation | 5 | 1 | 2 | 1 | 1 |
| Subscription | 8 | 1 | 3 | 3 | 1 |
| Audit | 10 | 3 | 3 | 3 | 1 |
| Notifications | 10 | 1 | 2 | 4 | 3 |
| Events | 10 | 2 | 3 | 3 | 2 |
| Background Jobs | 10 | 2 | 3 | 3 | 2 |
| AI | 10 | 2 | 3 | 3 | 2 |
| Modules | 10 | 1 | 3 | 4 | 2 |
| Testing | 10 | 2 | 3 | 3 | 2 |
| **Total** | **91** | **17** | **28** | **31** | **17** |

---

## Critical Gaps (Immediate Action Required)

| # | Category | Gap | Impact | Evidence | Document |
|---|----------|-----|--------|----------|----------|
| 1 | Events | 0 publishers for Student/Staff/Attendance/Fees | System events broken | `08_EVENT_VERIFICATION.md` | Event system non-functional |
| 2 | Tenant | `getTeacherClasses` leaks data across tenants | Security breach | `04_TENANT_VERIFICATION.md` | Cross-tenant data exposure |
| 3 | Background Jobs | Workers not deployed | Jobs not processed | `09_BACKGROUND_JOB_VERIFICATION.md` | All queued jobs stuck |
| 4 | RBAC | 3 routes have no auth at all | Unauthorized access | `03_RBAC_VERIFICATION.md` | Critical security gaps |
| 5 | RBAC | Role escalation in register-user | Privilege escalation | `03_RBAC_VERIFICATION.md` | Security vulnerability |
| 6 | Subscription | CRON_SECRET in .env.local | Security vulnerability | `05_SUBSCRIPTION_VERIFICATION.md` | Exposed secret |
| 7 | Audit | ~60% of service methods not audited | Compliance risk | `06_AUDIT_VERIFICATION.md` | Incomplete audit trail |
| 8 | Testing | ~95% code untested | Quality risk | `12_TESTING_VERIFICATION.md` | No integration/E2E tests |
| 9 | Background Jobs | Hardcoded CRON_SECRET fallback | Security vulnerability | `09_BACKGROUND_JOB_VERIFICATION.md` | Exposed secret |
| 10 | Audit | No login/logout audit | Security blind spot | `06_AUDIT_VERIFICATION.md` | Cannot trace access |
| 11 | Audit | No permission change audit | Compliance risk | `06_AUDIT_VERIFICATION.md` | Cannot track role changes |
| 12 | Events | Dead letter queue unprocessed | Data loss | `08_EVENT_VERIFICATION.md` | Failed events lost |
| 13 | Audit | No payment audit | Financial risk | `06_AUDIT_VERIFICATION.md` | Cannot trace transactions |
| 14 | AI | No content moderation | Safety risk | `10_AI_VERIFICATION.md` | Unsafe content possible |
| 15 | AI | No AI fallback | Reliability risk | `10_AI_VERIFICATION.md` | Single point of failure |
| 16 | Background Jobs | No job monitoring | Operational risk | `09_BACKGROUND_JOB_VERIFICATION.md` | No visibility |
| 17 | Events | No event persistence | Data loss | `08_EVENT_VERIFICATION.md` | Events lost on restart |

---

## High Gaps (Sprint Required)

| # | Category | Gap | Impact | Evidence | Document |
|---|----------|-----|--------|----------|----------|
| 18 | RBAC | 12 routes lack permission checks | Security gaps | `03_RBAC_VERIFICATION.md` | Unauthorized access possible |
| 19 | Tenant | No tenant-level encryption | Data exposure | `04_TENANT_VERIFICATION.md` | Shared schema risk |
| 20 | Subscription | No upgrade/downgrade UI | User experience | `05_SUBSCRIPTION_VERIFICATION.md` | Users cannot change plans |
| 21 | Subscription | No invoice generation | Billing gap | `05_SUBSCRIPTION_VERIFICATION.md` | No invoices |
| 22 | Subscription | No payment history | Financial tracking | `05_SUBSCRIPTION_VERIFICATION.md` | No payment records |
| 23 | Audit | No read operation audit | Compliance gap | `06_AUDIT_VERIFICATION.md` | No access tracking |
| 24 | Notifications | No notification templates | Inconsistent UX | `07_NOTIFICATION_VERIFICATION.md` | Inconsistent emails |
| 25 | Notifications | No notification queue | Performance | `07_NOTIFICATION_VERIFICATION.md` | Blocking requests |
| 26 | Events | No schema validation | Data integrity | `08_EVENT_VERIFICATION.md` | Invalid events possible |
| 27 | Events | No error isolation | Reliability | `08_EVENT_VERIFICATION.md` | Cascade failures |
| 28 | Background Jobs | No retry logic | Reliability | `09_BACKGROUND_JOB_VERIFICATION.md` | Failed jobs lost |
| 29 | AI | No prompt templates | Inconsistent outputs | `10_AI_VERIFICATION.md` | Variable quality |
| 30 | AI | No streaming | User experience | `10_AI_VERIFICATION.md` | Slow responses |
| 31 | Modules | 10 modules missing interfaces | Maintainability | `11_MODULE_VERIFICATION.md` | Technical debt |
| 32 | Testing | No integration tests | Quality | `12_TESTING_VERIFICATION.md` | Undetected regressions |
| 33 | Testing | No E2E tests | Quality | `12_TESTING_VERIFICATION.md` | Broken workflows |
| 34 | RBAC | No server-side page protection | Security | `03_RBAC_VERIFICATION.md` | Client-side only |
| 35 | Audit | No AI interaction audit | Compliance | `06_AUDIT_VERIFICATION.md` | AI usage untracked |
| 36 | Notifications | No delivery tracking | Analytics | `07_NOTIFICATION_VERIFICATION.md` | No open rates |
| 37 | Events | No event replay | Recovery | `08_EVENT_VERIFICATION.md` | Cannot recover state |
| 38 | Background Jobs | No job alerts | Operations | `09_BACKGROUND_JOB_VERIFICATION.md` | Silent failures |
| 39 | AI | No conversation history | UX | `10_AI_VERIFICATION.md` | No context |
| 40 | Modules | Dashboard no interface | Maintainability | `11_MODULE_VERIFICATION.md` | Technical debt |
| 41 | Modules | Analytics no interface | Maintainability | `11_MODULE_VERIFICATION.md` | Technical debt |
| 42 | Testing | No auth tests | Quality | `12_TESTING_VERIFICATION.md` | Auth untested |
| 43 | Testing | No tenant tests | Quality | `12_TESTING_VERIFICATION.md` | Multi-tenancy untested |
| 44 | Testing | No RBAC tests | Quality | `12_TESTING_VERIFICATION.md` | Permissions untested |

---

## Medium Gaps (Planned)

| # | Category | Gap | Impact | Evidence | Document |
|---|----------|-----|--------|----------|----------|
| 45 | RBAC | No button/component-level enforcement | UX | `03_RBAC_VERIFICATION.md` | Inconsistent UI |
| 46 | Tenant | No tenant data segregation at DB level | Scalability | `04_TENANT_VERIFICATION.md` | Shared schema |
| 47 | Subscription | No proration logic | Billing | `05_SUBSCRIPTION_VERIFICATION.md` | Incorrect billing |
| 48 | Subscription | No trial period | Conversion | `05_SUBSCRIPTION_VERIFICATION.md` | Missing feature |
| 49 | Subscription | No subscription analytics | Insights | `05_SUBSCRIPTION_VERIFICATION.md` | No metrics |
| 50 | Audit | No export functionality | Compliance | `06_AUDIT_VERIFICATION.md` | Cannot export logs |
| 51 | Audit | No search functionality | Usability | `06_AUDIT_VERIFICATION.md` | Cannot find logs |
| 52 | Audit | No retention policy | Storage | `06_AUDIT_VERIFICATION.md` | Unbounded growth |
| 53 | Notifications | No scheduled notifications | Feature | `07_NOTIFICATION_VERIFICATION.md` | Missing feature |
| 54 | Notifications | No digest notifications | Feature | `07_NOTIFICATION_VERIFICATION.md` | Missing feature |
| 55 | Notifications | No notification history | UX | `07_NOTIFICATION_VERIFICATION.md` | Limited history |
| 56 | Events | No event versioning | Maintenance | `08_EVENT_VERIFICATION.md` | Breaking changes hard |
| 57 | Events | No event metrics | Observability | `08_EVENT_VERIFICATION.md` | No visibility |
| 58 | Background Jobs | No job scheduling UI | UX | `09_BACKGROUND_JOB_VERIFICATION.md` | No control |
| 59 | Background Jobs | No job cancellation | Control | `09_BACKGROUND_JOB_VERIFICATION.md` | Cannot stop jobs |
| 60 | AI | No AI caching | Cost | `10_AI_VERIFICATION.md` | Duplicate requests |
| 61 | AI | No AI analytics | Insights | `10_AI_VERIFICATION.md` | No usage data |
| 62 | Modules | Academics missing interfaces | Maintainability | `11_MODULE_VERIFICATION.md` | Technical debt |
| 63 | Modules | Communication missing interfaces | Maintainability | `11_MODULE_VERIFICATION.md` | Technical debt |
| 64 | Testing | No DB tests | Quality | `12_TESTING_VERIFICATION.md` | Queries untested |
| 65 | Testing | No event tests | Quality | `12_TESTING_VERIFICATION.md` | Events untested |
| 66 | Testing | No job tests | Quality | `12_TESTING_VERIFICATION.md` | Jobs untested |
| 67 | Testing | No coverage reporting | Visibility | `12_TESTING_VERIFICATION.md` | No metrics |
| 68 | RBAC | Some permissions unused | Cleanup | `03_RBAC_VERIFICATION.md` | Dead code |
| 69 | Audit | No IP/useragent logging | Forensics | `06_AUDIT_VERIFICATION.md` | Limited context |
| 70 | Notifications | No webhook notifications | Integration | `07_NOTIFICATION_VERIFICATION.md` | No external hooks |
| 71 | Events | No serialization format | Compatibility | `08_EVENT_VERIFICATION.md` | Schema drift |
| 72 | Background Jobs | No job progress tracking | UX | `09_BACKGROUND_JOB_VERIFICATION.md` | No updates |
| 73 | AI | No prompt versioning | Maintenance | `10_AI_VERIFICATION.md` | No history |
| 74 | Modules | Library basic only | Feature | `11_MODULE_VERIFICATION.md` | Limited features |
| 75 | Modules | Transport basic only | Feature | `11_MODULE_VERIFICATION.md` | Limited features |

---

## Low Gaps (Backlog)

| # | Category | Gap | Impact | Evidence | Document |
|---|----------|-----|--------|----------|----------|
| 76 | Tenant | Cache key collisions possible | Risk | `04_TENANT_VERIFICATION.md` | Unlikely |
| 77 | Tenant | No tenant backup/restore | Disaster recovery | `04_TENANT_VERIFICATION.md` | Risk |
| 78 | Subscription | No dunning logic | Revenue | `05_SUBSCRIPTION_VERIFICATION.md` | Minor |
| 79 | Audit | No HIPAA compliance | Compliance | `06_AUDIT_VERIFICATION.md` | If needed |
| 80 | Notifications | No unsubscribe links | Compliance | `07_NOTIFICATION_VERIFICATION.md` | Minor |
| 81 | Events | No circuit breaker | Reliability | `08_EVENT_VERIFICATION.md` | Low risk |
| 82 | Background Jobs | No job priority | Performance | `09_BACKGROUND_JOB_VERIFICATION.md` | Minor |
| 83 | AI | No A/B testing | Optimization | `10_AI_VERIFICATION.md` | Nice to have |
| 84 | AI | No fine-tuning | Quality | `10_AI_VERIFICATION.md` | Advanced |
| 85 | Modules | Hostel basic only | Feature | `11_MODULE_VERIFICATION.md` | Minor |
| 86 | RBAC | No permission inheritance | Maintenance | `03_RBAC_VERIFICATION.md` | Minor |
| 87 | Tenant | No tenant data export | GDPR | `04_TENANT_VERIFICATION.md` | Partial |
| 88 | Audit | No SOC 2 full compliance | Compliance | `06_AUDIT_VERIFICATION.md` | Partial |
| 89 | Notifications | No notification preferences UI | UX | `07_NOTIFICATION_VERIFICATION.md` | Minor |
| 90 | Events | No snapshotting | Recovery | `08_EVENT_VERIFICATION.md` | Advanced |
| 91 | Background Jobs | No job metrics | Observability | `09_BACKGROUND_JOB_VERIFICATION.md` | Minor |

---

## Priority Matrix

| Priority | Count | Categories | Action |
|----------|-------|------------|--------|
| P0 - Critical | 17 | Events, Tenant, RBAC, Audit, Testing, Jobs | Immediate |
| P1 - High | 28 | All categories | This sprint |
| P2 - Medium | 31 | All categories | Next sprint |
| P3 - Low | 17 | All categories | Backlog |

---

## Implementation Roadmap

### Phase 1: Critical (Week 1-2)
- [ ] Fix `getTeacherClasses` tenant leak
- [ ] Deploy worker processes
- [ ] Add auth to 3 unprotected routes
- [ ] Fix role escalation in register-user
- [ ] Move CRON_SECRET out of .env.local
- [ ] Implement event publishers
- [ ] Process dead letter queue

### Phase 2: High (Week 3-4)
- [ ] Add missing permission checks to 12 routes
- [ ] Implement server-side page protection
- [ ] Add login/logout audit
- [ ] Add permission change audit
- [ ] Add payment audit
- [ ] Implement notification queue
- [ ] Add content moderation
- [ ] Add AI fallback
- [ ] Create notification templates
- [ ] Add event schema validation

### Phase 3: Medium (Week 5-8)
- [ ] Create module interfaces (10 modules)
- [ ] Add integration tests
- [ ] Add E2E tests
- [ ] Implement event persistence
- [ ] Add event error isolation
- [ ] Add job retry logic
- [ ] Add streaming responses
- [ ] Add conversation history
- [ ] Implement upgrade/downgrade UI
- [ ] Add invoice generation

### Phase 4: Low (Week 9-12)
- [ ] Add tenant encryption
- [ ] Implement trial periods
- [ ] Add notification analytics
- [ ] Add AI analytics
- [ ] Implement event versioning
- [ ] Add job scheduling UI
- [ ] Add A/B testing for prompts
- [ ] Implement fine-tuning

---

## Evidence Summary

| Document | Gaps | Critical | High | Medium | Low |
|----------|------|----------|------|--------|-----|
| `03_RBAC_VERIFICATION.md` | 8 | 2 | 3 | 2 | 1 |
| `04_TENANT_VERIFICATION.md` | 5 | 1 | 2 | 1 | 1 |
| `05_SUBSCRIPTION_VERIFICATION.md` | 8 | 1 | 3 | 3 | 1 |
| `06_AUDIT_VERIFICATION.md` | 10 | 3 | 3 | 3 | 1 |
| `07_NOTIFICATION_VERIFICATION.md` | 10 | 1 | 2 | 4 | 3 |
| `08_EVENT_VERIFICATION.md` | 10 | 2 | 3 | 3 | 2 |
| `09_BACKGROUND_JOB_VERIFICATION.md` | 10 | 2 | 3 | 3 | 2 |
| `10_AI_VERIFICATION.md` | 10 | 2 | 3 | 3 | 2 |
| `11_MODULE_VERIFICATION.md` | 10 | 1 | 3 | 4 | 2 |
| `12_TESTING_VERIFICATION.md` | 10 | 2 | 3 | 3 | 2 |
| **Total** | **91** | **17** | **28** | **31** | **17** |
