# Request Lifecycle

**Document ID**: EDU-LIFE-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. API Request Lifecycle

```mermaid
sequenceDiagram

```

    participant Client
    participant NextJS as Next.js Middleware
    participant Auth as withAuth
    participant Tenant as withTenant
    participant Perm as withPermission
    participant Route as Route Handler
    participant Service as Service Layer
    participant Repo as Repository
    participant DB as Firestore
    participant Events as EventBus
    Client->>NextJS: POST /api/v1/students
    NextJS->>Auth: Verify session cookie
    Auth->>Tenant: Extract tenantId
    Tenant->>Perm: Check permission 'students.create'
    Perm->>Route: Forward with context
    Route->>Service: createStudent(tenantId, data, userId)
    Service->>Repo: create(tenantId, data)
    Repo->>DB: Insert with tenantId
    DB-->>Repo: Created entity
    Repo-->>Service: StudentEntity
    Service->>Events: publish(STUDENT_CREATED, payload)
    Service-->>Route: StudentResponseDTO
    Route-->>Client: 201 Created
```

## 2. Authentication Lifecycle

```mermaid
sequenceDiagram

```

    participant Client
    participant Login as Login Route
    participant Firebase as Firebase Admin
    participant Cookie as Session Cookie
    Client->>Login: POST /api/v1/auth/login
    Login->>Firebase: verifyPassword(email, password)
    Firebase-->>Login: User record
    Login->>Firebase: createSessionCookie(uid, expiresIn: 5d)
    Firebase-->>Login: Session cookie
    Login->>Cookie: Set-Cookie (HttpOnly, SameSite=Lax)
    Login-->>Client: { user, token }
```

## 3. Event Lifecycle

```mermaid
sequenceDiagram

```

    participant Service
    participant EventBus
    participant Outbox
    participant Worker
    participant Subscribers
    Service->>EventBus: publish(eventType, payload)
    EventBus->>Outbox: enqueue(event)
    Note over Outbox: Event persisted durably
    Worker->>Outbox: poll()
    Worker->>Outbox: claim(eventId, subscriberId)
    Worker->>EventBus: dispatch(event)
    EventBus->>Subscribers: handle(event)
    Subscribers->>Subscribers: audit/notify/dashboard
```

