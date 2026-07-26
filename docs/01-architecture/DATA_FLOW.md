# Data Flow

**Document ID**: EDU-DATA-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant R as Route Handler
    participant S as Service
    participant REP as Repository
    participant DB as Firestore
    C->>M: HTTP Request
    M->>M: withAuth (verify session)
    M->>M: withTenant (extract tenantId)
    M->>M: withPermission (check permission)
    M->>R: Forward request
    R->>S: Service method(tenantId, id, data, userId)
    S->>REP: Repository method(tenantId, ...)
    REP->>DB: Query with tenantId filter
    DB-->>REP: Data
    REP-->>S: Entity
    S-->>R: DTO
    R-->>C: JSON Response
```

## 2. Event Flow

```mermaid
sequenceDiagram
    participant S as Service
    participant EB as EventBus
    participant OR as OutboxRepository
    participant W as EventWorker
    participant SUB as Subscribers
    S->>EB: publish(eventType, payload)
    EB->>OR: enqueue(event)
    W->>OR: poll for events
    W->>W: claim lease
    W->>EB: dispatch(event)
    EB->>SUB: handle(event)
    SUB->>SUB: audit/notify/dashboard
```

