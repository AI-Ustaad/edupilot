# DOMAIN EVENT AUDIT

**Date:** 2026-07-26  
**Auditor:** Independent Enterprise Architecture Review Board  
**Scope:** Complete domain event flow verification  
**Method:** Source code inspection only. No documentation trusted.

---

## EXECUTIVE SUMMARY

| Workflow | Event Published? | Event Persisted? | Event Dispatched? | Handler Executed? | Integration Test? | Verified Runtime? | Status |
|----------|-----------------|-----------------|-------------------|-------------------|-------------------|-------------------|--------|
| Student Creation | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | FAILED |
| Student Update | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | FAILED |
| Attendance Marking | ✅ YES | ❌ NO | ✅ YES | ✅ YES | ❌ NO | ❌ NO | PARTIAL |
| Fee Payment | ✅ YES | ❌ NO | ✅ YES | ✅ YES | ❌ NO | ❌ NO | PARTIAL |
| Exam/Result Publication | ✅ YES | ❌ NO | ✅ YES | ✅ YES | ❌ NO | ❌ NO | PARTIAL |
| Invoice Creation | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | FAILED |
| Notification Sending | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | FAILED |
| Subscription Activation | ✅ YES | ❌ NO | ✅ YES | ❌ NO | ❌ NO | ❌ NO | PARTIAL |
| Subscription Cancellation | ✅ YES | ❌ NO | ✅ YES | ❌ NO | ❌ NO | ❌ NO | PARTIAL |
| User Registration | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | FAILED |
| Tenant Creation | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | FAILED |
| AI Job Completion | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | FAILED |
| Audit Logging | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | ❌ NO | FAILED |

---

## CRITICAL FINDINGS

### Finding 1: EventStore Never Initialized

**File:** `lib/events/event-bus.ts`  
**Lines:** 12-19

```typescript
constructor() {
  this.dispatcher = new EventDispatcher();
  this.eventStore = {
    append: async () => "",
    replay: async () => [],
    getByIdempotencyKey: async () => false,
    markAsProcessed: async () => {},
  } as EventStore;
}
```

**Evidence:** The `EventBus` constructor creates a no-op mock `EventStore`. The `initialize(eventStore)` method at line 22 is **never called anywhere in production code**. `FirestoreEventStore` (`lib/events/event-store.ts`) is fully implemented but never instantiated.

**Impact:** Events published via `eventBus.publish()` are NEVER persisted to Firestore.

---

### Finding 2: Events Are Published but Not Persisted

**File:** `lib/events/event-bus.ts`  
**Lines:** 103-110

```typescript
if (this.isInitialized) {
  const idempotencyKey = `${event.eventType}:${event.aggregateId}:${event.occurredAt.getTime()}`;
  const alreadyProcessed = await this.eventStore.getByIdempotencyKey(idempotencyKey);
  
  if (!alreadyProcessed) {
    await this.eventStore.append(event, metadata || {});
    await this.eventStore.markAsProcessed(idempotencyKey);
  }
}
```

**Evidence:** Since `this.isInitialized` is always `false`, the persistence block is dead code. Events are dispatched to handlers but never written to Firestore through the EventBus.

---

### Finding 3: Subscribers Are Registered but Many Handle Dead Events

**File:** `lib/events/index.ts`  
**Lines:** 17-28

**Evidence:** Subscribers ARE auto-registered on module import:
- `registerAuditSubscriber()` — 70+ event subscribers
- `registerNotificationSubscriber()` — 6 event subscribers
- `registerLifecycleSubscriber()` — 2 event subscribers
- `registerStaffLifecycleSubscriber()` — 2 event subscribers
- `registerDashboardSubscriber()` — 9 event subscribers

However, many of these subscribers listen for events that are **never published**:
- `STUDENT_CREATED` — subscriber exists, event never published
- `STUDENT_UPDATED` — subscriber exists, event never published
- `STUDENT_DELETED` — subscriber exists, event never published
- `FEE_COLLECTED` — subscriber exists, event published but not persisted
- `RESULT_PUBLISHED` — subscriber exists, event published but not persisted
- `SUBSCRIPTION_ACTIVATED` — NO subscriber exists (handler file exists but never registered)
- `SUBSCRIPTION_CANCELED` — NO subscriber exists

---

### Finding 4: Dead Event Handler Code

**File:** `lib/events/handlers/subscription-event.handler.ts`  
**Lines:** 1-25

**Evidence:** Contains `SubscriptionActivatedHandler` and `SubscriptionCanceledHandler` classes, but these are **never registered** on the EventBus. The `eventBus.subscribe()` calls for these handlers do not exist anywhere in the codebase.

---

### Finding 5: Dead Event Type Definitions

**File:** `lib/events/events.ts`  
**Lines:** 1-71

**Evidence:** 22 event constants are defined but never imported/subscribed:
- `FEE_PAID` — defined at line 31, never published
- `INVOICE_GENERATED` — defined at line 34, never published
- `NOTIFICATION_SENT` — defined at line 44, never published
- `TENANT_CREATED` — defined at line 54, never published
- `USER_REGISTERED` — defined at line 38, never published
- `AI_JOB_COMPLETED` — defined at line 59, never published
- `AI_JOB_FAILED` — defined at line 60, never published
- `AUDIT_LOGGED` — defined at line 71, never published
- `STUDENT_ENROLLED` — defined at line 55, never published
- `PARENT_CREATED`, `PARENT_UPDATED`, `PARENT_DELETED` — defined, never published
- `TIMETABLE_CREATED`, `TIMETABLE_DELETED` — defined, never published
- `VIDEO_CREATED`, `VIDEO_UPDATED`, `VIDEO_DELETED` — defined, never published
- `BUS_CREATED`, `BUS_UPDATED`, `BUS_DELETED` — defined, never published
- `FEE_UPDATED`, `FEE_DELETED` — defined, never published

---

## WORKFLOW-BY-WORKFLOW EVIDENCE

### 1. Student Creation
**Published:** NO — `StudentService.create()` does not call `eventBus.publish()`  
**Persisted:** NO  
**Dispatched:** NO  
**Handler:** N/A  
**Test:** NO  
**Runtime Verified:** NO  

### 2. Student Update
**Published:** NO — `StudentService.update()` does not call `eventBus.publish()`  
**Persisted:** NO  
**Dispatched:** NO  
**Handler:** N/A  
**Test:** NO  
**Runtime Verified:** NO  

### 3. Attendance Marking
**Published:** YES — `attendance.service.ts` line 57: `await eventBus.publish(EVENTS.ATTENDANCE_MARKED, {...})`  
**Persisted:** NO — `isInitialized` is always false  
**Dispatched:** YES — `dispatcher.dispatch()` filters and calls handlers  
**Handler:** YES — `audit.subscriber.ts` writes to audit_logs; `dashboard.subscriber.ts` invalidates cache  
**Test:** NO  
**Runtime Verified:** NO (persistence dead)  

### 4. Fee Payment
**Published:** YES — `fees.service.ts` line 52 publishes `EVENTS.FEE_COLLECTED`  
**Persisted:** NO — `isInitialized` is always false  
**Dispatched:** YES  
**Handler:** YES — `dashboard.subscriber.ts` invalidates cache  
**Test:** NO  
**Runtime Verified:** NO (persistence dead)  

### 5. Exam/Result Publication
**Published:** YES — `marks.service.ts` line 104 publishes `EVENTS.RESULT_PUBLISHED`  
**Persisted:** NO — `isInitialized` is always false  
**Dispatched:** YES  
**Handler:** YES — `audit.subscriber.ts` writes to audit_logs; `dashboard.subscriber.ts` invalidates cache  
**Test:** NO  
**Runtime Verified:** NO (persistence dead)  

### 6. Invoice Creation
**Published:** NO — `INVOICE_GENERATED` event type exists but never published  
**Persisted:** NO  
**Dispatched:** NO  
**Handler:** N/A  
**Test:** NO  
**Runtime Verified:** NO  

### 7. Notification Sending
**Published:** NO — `NOTIFICATION_SENT` event type exists but never published  
**Persisted:** NO  
**Dispatched:** NO  
**Handler:** N/A  
**Test:** NO  
**Runtime Verified:** NO  

### 8. Subscription Activation/Cancellation
**Published:** YES — `subscription.service.ts` lines 49, 66; also `subscription.repository.ts` lines 48, 62  
**Persisted:** NO — `isInitialized` is always false  
**Dispatched:** YES  
**Handler:** NO — handlers exist in `subscription-event.handler.ts` but are never registered  
**Test:** NO  
**Runtime Verified:** NO (handlers not registered, persistence dead)  

### 9. User Registration
**Published:** NO — `USER_REGISTERED` event type exists but never published  
**Persisted:** NO  
**Dispatched:** NO  
**Handler:** N/A  
**Test:** NO  
**Runtime Verified:** NO  

### 10. Tenant Creation
**Published:** NO — `TENANT_CREATED` event type exists but never published  
**Persisted:** NO  
**Dispatched:** NO  
**Handler:** N/A  
**Test:** NO  
**Runtime Verified:** NO  

### 11. AI Job Completion
**Published:** NO — `AI_JOB_COMPLETED` event type exists but never published  
**Persisted:** NO  
**Dispatched:** NO  
**Handler:** N/A  
**Test:** NO  
**Runtime Verified:** NO  

### 12. Audit Logging
**Published:** NO — `AUDIT_LOGGED` event type exists but never published  
**Persisted:** NO  
**Dispatched:** NO  
**Handler:** N/A  
**Test:** NO  
**Runtime Verified:** NO  

---

## FINAL CERTIFICATION

| Category | Status |
|----------|--------|
| Event Published? | ❌ FAIL — 9 of 12 workflows never publish events |
| Event Persisted? | ❌ FAIL — EventStore never initialized, 0% persistence |
| Event Dispatched? | ⚠️ PARTIAL — 3 workflows dispatch, but to zero or wrong handlers |
| Handler Executed? | ⚠️ PARTIAL — Handlers execute for attendance/fee/exam, but not for subscriptions |
| Integration Test? | ❌ FAIL — 0 integration tests for event flows |
| Verified in Runtime? | ❌ FAIL — No runtime verification exists |

**EVENT SYSTEM STATUS: FAILED — Event infrastructure is non-functional in production.**

**Root Cause:** `EventBus` is initialized with a mock `EventStore` and `initialize()` is never called. Events that are published are dispatched to handlers but never persisted. Most critical business events are never published at all.

---

**AUDITOR:** Independent Enterprise Architecture Review Board  
**DATE:** 2026-07-26  
**FINDING:** FAILED — Domain event system is architecturally broken and requires complete remediation.
