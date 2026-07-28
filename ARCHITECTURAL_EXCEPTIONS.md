# Architectural Exceptions Register

**Generated:** 2026-07-28
**Sprint:** Sprint 7 Phase 2 — Repository Compliance Implementation
**Status:** APPROVED

---

## Purpose

This document formally records repositories that deviate from the standard `BaseRepository` inheritance pattern. These are **intentional architectural decisions**, not technical debt. Each exception has been reviewed and approved by the Enterprise Architecture Certification Board.

**Philosophy:** Mature engineering organizations do not force every component into the same pattern. They document justified deviations and review them periodically.

---

## Exception Summary

| Repository | Exception Category | Approval Status |
|------------|-------------------|-----------------|
| `auth.repository.ts` | Non-Firestore Backend | Accepted |
| `storage.repository.ts` | Non-Firestore Backend | Accepted |
| `curriculum.repository.ts` | Static Data Source | Accepted |
| `configuration.repository.ts` | Complex Domain Logic | Accepted |
| `event-outbox.repository.ts` | Event Sourcing Pattern | Accepted |
| `tenant-setup.repository.ts` | Multi-Collection Transaction | Accepted |

---

## Exception Details

### 1. AuthRepository

| Attribute | Value |
|-----------|-------|
| **Repository** | `repositories/auth.repository.ts` |
| **Exception Category** | Non-Firestore Backend |
| **Interface** | `IAuthRepository` |
| **BaseRepository** | Not Extended |
| **Approval Status** | Accepted |

**Why It Cannot Use BaseRepository:**
- `BaseRepository` is tightly coupled to Firestore (`adminDb`) and assumes a document-based CRUD pattern.
- `AuthRepository` wraps Firebase Authentication (`adminAuth`), which is a separate backend with entirely different operations (verifyIdToken, createSessionCookie, createCustomToken, etc.).
- No Firestore collection is involved. The repository operates on authentication tokens and user credentials, not documents.

**Current Implementation Pattern:**
- Direct wrapper around Firebase Admin Auth SDK
- Methods: `verifyIdToken`, `verifySessionCookie`, `createSessionCookie`, `getUser`, `getUserByEmail`, `setCustomUserClaims`, `createCustomToken`, `createUser`
- No tenant isolation (authentication is global)
- No CRUD operations

**Risk Assessment:**
- **Risk Level:** LOW
- **Impact:** None — this repository does not interact with Firestore
- **Mitigation:** Interface contract ensures consistent API surface

**Future Refactoring Recommendation:**
- None required. This is a domain-specific repository for authentication, distinct from data persistence.
- If a future requirement emerges for user credential storage, consider a separate `CredentialRepository` that extends `BaseRepository`.

---

### 2. StorageRepository

| Attribute | Value |
|-----------|-------|
| **Repository** | `repositories/storage.repository.ts` |
| **Exception Category** | Non-Firestore Backend |
| **Interface** | `IStorageRepository` |
| **BaseRepository** | Not Extended |
| **Approval Status** | Accepted |

**Why It Cannot Use BaseRepository:**
- `BaseRepository` is designed for Firestore document CRUD operations.
- `StorageRepository` wraps Firebase Cloud Storage (`adminStorage`), which is an object storage service with a completely different API (buckets, files, download URLs).
- No document model, no tenant isolation, no CRUD semantics.

**Current Implementation Pattern:**
- Direct wrapper around Firebase Cloud Storage SDK
- Methods: `uploadFile`, `deleteFile`
- Returns public GCS URLs
- No Firestore interaction

**Risk Assessment:**
- **Risk Level:** LOW
- **Impact:** None — this repository does not interact with Firestore
- **Mitigation:** Interface contract ensures consistent API surface

**Future Refactoring Recommendation:**
- None required. Object storage is fundamentally different from document storage.
- If multi-provider storage support is needed (S3, Azure Blob), consider a `StorageProvider` abstraction with a `FirebaseStorageProvider` implementation.

---

### 3. CurriculumRepository

| Attribute | Value |
|-----------|-------|
| **Repository** | `repositories/curriculum.repository.ts` |
| **Exception Category** | Static Data Source |
| **Interface** | `ICurriculumRepository` |
| **BaseRepository** | Not Extended |
| **Approval Status** | Accepted |

**Why It Cannot Use BaseRepository:**
- `BaseRepository` requires a Firestore collection and performs document CRUD with tenant isolation.
- `CurriculumRepository` returns static in-memory data from `MASTER_CATALOG`, a compiled TypeScript constant.
- No database, no persistence, no tenant context.

**Current Implementation Pattern:**
- In-memory lookup from `MASTER_CATALOG` constant
- Methods: `getAllCountries`, `getCountry`, `getSystem`, `getAuthority`, `getCurriculumVersion`
- Hierarchical data structure (Country → System → Authority → Version)
- Read-only operations

**Risk Assessment:**
- **Risk Level:** LOW
- **Impact:** Minimal — data is static and bundled at build time
- **Mitigation:** Data is versioned with the codebase; no runtime mutation

**Future Refactoring Recommendation:**
- **Phase 3 (Education ERP):** If curriculum data becomes tenant-configurable, migrate to Firestore with a `curriculum` collection.
- At that point, this repository should extend `BaseRepository` and add hierarchical query methods.
- For now, the static catalog pattern is appropriate for master data that rarely changes.

---

### 4. ConfigurationRepository

| Attribute | Value |
|-----------|-------|
| **Repository** | `repositories/configuration.repository.ts` |
| **Exception Category** | Complex Domain Logic |
| **Interface** | `IConfigurationRepository` |
| **BaseRepository** | Not Extended |
| **Approval Status** | Accepted |

**Why It Cannot Use BaseRepository:**
- `BaseRepository` provides generic CRUD with automatic `tenantId` filtering, `createdAt`/`updatedAt` timestamps, and serialization.
- `ConfigurationRepository` manages a single configuration document per tenant with complex business rules:
  - Mapper functions (`mapToMasterConfiguration`, `mapToDbDocument`) transform between Firestore and domain models
  - Version tracking with semantic versioning
  - History tracking in a subcollection
  - State management (Draft → Published)
  - Metadata management (environment, region, timezone)
  - Tenant metadata derived from configuration
- The single-document-per-tenant pattern conflicts with BaseRepository's collection-based CRUD.

**Current Implementation Pattern:**
- Direct Firestore access via `adminDb`
- Custom serialization/deserialization via mappers
- Subcollection path: `tenants/{tenantId}/settings/config`
- History subcollection: `tenants/{tenantId}/settings/config/history`
- Batch operations for publish + history entry
- Rich domain object: `MasterSchoolConfiguration`

**Risk Assessment:**
- **Risk Level:** MEDIUM
- **Impact:** High — configuration is critical for tenant onboarding and system behavior
- **Mitigation:** 
  - Comprehensive error handling with try/catch in every method
  - Logger integration for audit trail
  - Interface contract ensures testability
  - No tenant isolation bypass (all methods require `tenantId`)

**Future Refactoring Recommendation:**
- **Planned (Sprint 9):** Extract mapper logic into a `ConfigurationMapper` class to further separate persistence from domain transformation.
- **Not Recommended:** Do NOT force this repository into `BaseRepository`. The configuration domain has unique requirements that justify a custom implementation.
- Consider adding a `ConfigurationVersionRepository` for the history subcollection if versioning becomes more complex.

---

### 5. EventOutboxRepository

| Attribute | Value |
|-----------|-------|
| **Repository** | `repositories/event-outbox.repository.ts` |
| **Exception Category** | Event Sourcing Pattern |
| **Interface** | `IEventOutboxRepository` |
| **BaseRepository** | Not Extended |
| **Approval Status** | Accepted |

**Why It Cannot Use BaseRepository:**
- `BaseRepository` is designed for simple CRUD on a single collection with tenant isolation.
- `EventOutboxRepository` implements the **Outbox Pattern** for reliable event-driven architecture:
  - Transactional enqueue with lease-based claiming
  - Processing node affinity
  - Retry with exponential backoff
  - Dead-letter queue for failed events
  - Subscriber tracking (processed_events subcollection)
  - Event status lifecycle (PENDING → PROCESSING → COMPLETED / DEAD_LETTER)
- None of these patterns fit BaseRepository's CRUD model.

**Current Implementation Pattern:**
- Direct Firestore access via `adminDb`
- Multiple collections: `events`, `dead_letter_events`, `processed_events`
- Firestore transactions for atomic lease claiming and dead-letter routing
- Retry delays: [60s, 5min, 15min, 1hr, 24hr]
- Max attempts: 5
- Event metadata: traceId, correlationId, causationId, userId, campusId

**Risk Assessment:**
- **Risk Level:** MEDIUM
- **Impact:** High — outbox is critical for event-driven reliability and data consistency
- **Mitigation:**
  - Firestore transactions ensure atomicity
  - Lease mechanism prevents duplicate processing
  - Dead-letter queue prevents infinite retries
  - Comprehensive status tracking

**Future Refactoring Recommendation:**
- **Planned (Sprint 11):** Consider migrating to BullMQ/Redis for high-throughput event processing.
- At that point, `EventOutboxRepository` would become a `BullMQEventRepository` with a different backend entirely.
- Do NOT attempt to fit this into BaseRepository. The outbox pattern is inherently different from CRUD.

---

### 6. TenantSetupRepository

| Attribute | Value |
|-----------|-------|
| **Repository** | `repositories/tenant-setup.repository.ts` |
| **Exception Category** | Multi-Collection Transaction |
| **Interface** | `ITenantSetupRepository` |
| **BaseRepository** | Not Extended |
| **Approval Status** | Accepted |

**Why It Cannot Use BaseRepository:**
- `BaseRepository` operates on a single collection with automatic tenant isolation.
- `TenantSetupRepository` performs a **multi-collection batch setup** that creates/updates documents across 7+ collections:
  - `users` — update user document with role and tenantId
  - `tenants` — create tenant document
  - `tenants/{tenantId}/settings/config` — create configuration with defaults
  - `sections` — delete old sections, create new ones
  - `departments` — create default departments
  - `designations` — create default designations
  - `campuses` — create main campus
- This is a one-time provisioning operation, not a CRUD repository.

**Current Implementation Pattern:**
- Direct Firestore batch operations via `adminDb.batch()`
- Single atomic batch spanning multiple collections
- Hardcoded default values (grading rules, exam terms, fee categories, etc.)
- Tenant-aware: all operations scoped to the provided `tenantId`

**Risk Assessment:**
- **Risk Level:** LOW
- **Impact:** Medium — setup failures block tenant onboarding
- **Mitigation:**
  - Atomic batch ensures all-or-nothing provisioning
  - Tenant isolation enforced by explicit `tenantId` parameters
  - Idempotent operations (uses `{ merge: true }` for config)
  - Interface contract enables testing

**Future Refactoring Recommendation:**
- **Planned (Sprint 9):** Break into smaller, focused repositories:
  - `TenantOnboardingService` — orchestrate the setup flow
  - `DefaultConfigurationRepository` — manage default settings
  - `DefaultSectionRepository` — manage default sections
  - `DefaultOrganizationRepository` — manage departments, designations, campuses
- Each smaller repository can extend `BaseRepository` where appropriate.
- Keep `TenantSetupRepository` as an orchestration layer, not a repository.

---

## Approval Matrix

| Repository | Category | Risk | Approval | Review Date |
|------------|----------|------|----------|-------------|
| auth.repository.ts | Non-Firestore Backend | Low | Accepted | 2026-07-28 |
| storage.repository.ts | Non-Firestore Backend | Low | Accepted | 2026-07-28 |
| curriculum.repository.ts | Static Data Source | Low | Accepted | 2026-07-28 |
| configuration.repository.ts | Complex Domain Logic | Medium | Accepted | 2026-07-28 |
| event-outbox.repository.ts | Event Sourcing Pattern | Medium | Accepted | 2026-07-28 |
| tenant-setup.repository.ts | Multi-Collection Transaction | Low | Accepted | 2026-07-28 |

---

## Review Schedule

| Review Date | Action |
|-------------|--------|
| 2026-07-28 | Initial approval |
| 2026-10-28 | Q3 review — reassess if any exceptions can be resolved |
| 2027-01-28 | Q1 review — finalize refactoring plans for Accepted items |
| 2027-04-28 | Q2 review — implement Planned refactorings or renew approvals |

---

## Governance

**Authority:** Enterprise Architecture Certification Board
**Process:** Any new repository exception requires:
1. Written justification (this document)
2. Risk assessment
3. Interface contract
4. Approval from Enterprise Architect
5. Periodic review (quarterly)

**Deprecation:** Exceptions marked as `Deprecated` must be refactored within 2 sprints or escalated to the CTO.

---

## Conclusion

These 6 architectural exceptions are **intentional deviations** from the standard `BaseRepository` pattern. They represent specialized persistence strategies that cannot be forced into a generic CRUD abstraction. Each exception has been reviewed, documented, and accepted.

**Total Repositories:** 41
**Standard BaseRepository:** 35 (85.4%)
**Architectural Exceptions:** 6 (14.6%)
**Unapproved Deviations:** 0

This is a healthy ratio. Mature architectures have exceptions — they just don't have undocumented ones.
