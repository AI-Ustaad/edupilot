# CQRS Decision Report

**Date:** 2026-07-26  
**Evaluator:** Chief Software Architect  
**Scope:** EduPilot entire system  
**Decision:** Selective CQRS implementation

---

## Executive Summary

After evaluating the entire EduPilot system, CQRS is **NOT recommended as a global pattern**. The system does not have the scale, complexity, or domain boundaries that justify full CQRS adoption. However, **selective CQRS is beneficial** for specific bounded contexts: Analytics, Reporting, Dashboard, and AI subsystems.

---

## Analysis

### Current State

| Aspect | Current | Assessment |
|--------|---------|------------|
| Write Volume | Low-Medium | Not a CQRS driver |
| Read Volume | Medium | Some read-heavy paths exist |
| Domain Complexity | Medium | Standard school management |
| Consistency Requirements | Strong | ACID required for most operations |
| Reporting Needs | Moderate | Analytics and dashboards benefit |

### When CQRS Adds Value

CQRS is justified when:
1. **Read and write workloads are fundamentally different** - ✅ Analytics vs transactional data
2. **Different scaling requirements** - ⚠️ Some potential in reporting
3. **Complex domain logic on writes** - ❌ Not present
4. **Event sourcing benefits** - ⚠️ Partial benefit for audit trail

### EduPilot-Specific Analysis

#### ✅ Good CQRS Candidates

| Bounded Context | Reason |
|-----------------|--------|
| **Analytics** | Write: transactional events. Read: aggregated metrics. Different models justify separation. |
| **Reporting** | Write: transactional data. Read: denormalized report models. |
| **Dashboard** | Write: events. Read: materialized views. |
| **AI/Analytics** | Write: AI job events. Read: computed insights. |

#### ❌ Poor CQRS Candidates

| Bounded Context | Reason |
|-----------------|--------|
| **Student CRUD** | Same model for read/write. No benefit. |
| **Attendance** | Simple CRUD. Overhead not justified. |
| **Fees** | Simple transactional. No benefit. |
| **Authentication** | Must be strongly consistent. No benefit. |

---

## Recommendation

### 1. Do NOT implement global CQRS

The overhead of maintaining separate read/write models across the entire system is not justified by current scale and complexity.

### 2. Implement selective CQRS for Analytics/Reporting

Create a **Read Model** for:
- Dashboard statistics
- Analytics aggregations
- Report generation
- SaaS metrics (telemetry)

### 3. Use existing Event System

The domain events already implemented provide the foundation for eventual consistency in read models.

### 4. Implementation Approach

```
Write Side (Existing):
  Routes → Services → Repositories → Firestore
                    ↓
              Domain Events
                    ↓
              Event Bus

Read Side (New):
  Event Handlers → Read Model Updaters → Read Repositories → Cache/Dedicated Store
                              ↓
                        Queries/Projections
```

---

## Proposed Architecture

### Write Model (Keep Existing)
```typescript
// Existing pattern - keep as-is
StudentService.create() → StudentRepository.create() → Firestore
```

### Read Model (New for Analytics/Reporting)
```typescript
// New pattern - only for analytics/reporting
class DashboardReadModel {
  async getTenantStats(tenantId: string): Promise<DashboardStats> {
    // Read from materialized view
    return readRepo.getStats(tenantId);
  }
}

class StatsProjection {
  async onStudentCreated(event: StudentCreatedEvent) {
    // Update read model
    await readRepo.incrementCounter(tenantId, "totalStudents", 1);
  }
}
```

---

## Implementation Plan

### Phase 1: Read Model Infrastructure (Sprint 4)
1. Create `ReadModel` base class
2. Create `Projection` base class
3. Create `DashboardStatsRepository` (read-optimized)
4. Create `AnalyticsReadRepository`

### Phase 2: Analytics CQRS (Sprint 5)
1. Implement `StudentCreated` → Dashboard projection
2. Implement `AttendanceMarked` → Analytics projection
3. Implement `FeePaid` → Revenue projection
4. Add read model caching

### Phase 3: Reporting CQRS (Sprint 6)
1. Implement `ExamPublished` → Report projection
2. Implement denormalized report models
3. Add materialized view refresh

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Increased complexity | Medium | Medium | Limit to analytics/reporting only |
| Consistency lag | Medium | Low | Accept eventual consistency for analytics |
| Development overhead | Medium | Medium | Use existing event system |
| Testing complexity | Medium | Medium | Comprehensive integration tests |

---

## Conclusion

**Selective CQRS for Analytics/Reporting only. Do NOT implement globally.**

The existing architecture is sound for the current scale. CQRS should only be applied to specific bounded contexts where read/write separation provides clear value.

---

**Decision:** Approved with conditions  
**Conditions:** 
1. CQRS limited to Analytics/Reporting/Dashboard/AI bounded contexts
2. All other modules keep existing CRUD pattern
3. Read models use existing domain events
4. Implementation starts Sprint 4
