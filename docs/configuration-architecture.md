# EduPilot School Configuration System — Enterprise Architecture

## 1. Overview
This document describes the refactored, enterprise-grade School Configuration System for EduPilot. It replaces ad-hoc tenant resolution and scattered configuration logic with a clean, layered architecture.

## 2. Architecture Layers
```
┌─────────────────────────────────────────────┐
│            API Routes (Next.js)             │
│         /api/v1/settings/school-config      │
└─────────────────┬───────────────────────────┘
                  │ calls
┌─────────────────▼───────────────────────────┐
│        ConfigurationService                 │
│   Orchestration Layer                       │
│   - Validate payload                        │
│   - Load configuration                      │
│   - Self-healing                            │
│   - Build ViewModels                        │
└─────────────────┬───────────────────────────┘
                  │ uses
┌─────────────────▼───────────────────────────┐
│   TenantResolver        ConfigurationCache   │
│   ConfigurationHealthService                 │
└─────────────────┬───────────────────────────┘
                  │ uses
┌─────────────────▼───────────────────────────┐
│    ConfigurationRepository                   │
│    Single Firestore access point             │
└─────────────────┬───────────────────────────┘
                  │ reads/writes
┌─────────────────▼───────────────────────────┐
│    Firestore: tenants → {tenantId} → settings│
└─────────────────────────────────────────────┘
```

## 3. Tenant Resolution Strategy
- **Single Source of Truth**: `TenantResolver` is the ONLY place tenantId is determined.
- **Priority**: user.tenantId (from Firestore) → derived_from_uid fallback.
- **Never** use `user.tenantId || tenant_${uid}` in route handlers.

## 4. Firestore Structure (CANONICAL)
```
tenants/{tenantId}/
   settings/
      config          ← ONE active configuration document
      general/        ← General settings (separate collection)
```

## 5. Configuration Lifecycle
1. **Not Configured**: returns NOT_CONFIGURED → Dashboard shows setup wizard
2. **Saving**: POST validates, saves, publishes
3. **Published**: metadata.isConfigured = true
4. **Every Login**: tenant resolved → cache validated → config loaded
5. **Self-Healing**: missing config → auto-creates default skeleton

## 6. Classes
| Class | Responsibility |
|---|---|
| `TenantResolver` | Resolves and verifies tenant |
| `ConfigurationCacheService` | In-memory cache for fast reads |
| `ConfigurationHealthService` | Diagnostics and status |
| `ConfigurationRepository` | Firestore CRUD |
| `ConfigurationService` | Business orchestration |
| `MigrationUtility` | Legacy data migration |

## 7. Sequence Diagrams

### Get Configuration
```
Client → Route → TenantResolver
Route → ConfigService.loadConfiguration()
ConfigService → CacheService.getConfiguration()
Cache Miss → ConfigRepository.getConfiguration()
ConfigRepository → Firestore
Firestore → CacheService.setConfiguration()
Configuration returned to client
```

### Publish Configuration
```
Client → Route → TenantResolver
Route → ConfigService.saveAndPublishConfiguration()
ConfigService → ConfigRepository.publishConfiguration()
ConfigRepository → Firestore (config + history)
ConfigRepository → CacheService.invalidateConfiguration()
Success response returned
```

## 8. Class Diagram
```
[TenantResolver] ◇──> [User Context]
[ConfigurationService] ◇──> [TenantResolver]
[ConfigurationService] ◇──> [ConfigurationRepository]
[ConfigurationService] ◇──> [ConfigurationCacheService]
[ConfigurationService] ◇──> [ConfigurationHealthService]
[ConfigurationRepository] ◇──> [Firestore]
[ConfigurationCacheService] ◇──> [MemoryCacheProvider]
[ConfigurationHealthService] ◇──> [Firestore]
```

## 9. Data Flow Diagram
```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   HTTP Request│────▶│  TenantResolver     │────▶│  ResolvedTenant  │
└──────────────┘     └─────────────────────┘     └────────┬─────────┘
                                                           │
                                       ┌───────────────────▼─────────────────────┐
                                       │ ConfigurationService                    │
                                       │  - loadConfiguration()                 │
                                       │  - validate()                          │
                                       │  - buildViewModel()                    │
                                       └───────────────────┬─────────────────────┘
                                                           │
                           ┌────────────────────────────────┼────────────────────┐
                           │                                │                    │
                           ▼                                ▼                    ▼
                  ┌──────────────────┐          ┌──────────────────┐   ┌──────────────────┐
                  │ ConfigurationCache│          │ ConfigurationRepo│   │ ConfigurationHealth│
                  └─────────┬────────┘          └────────┬─────────┘   └──────────┬──────────┘
                            │                           │                         │
                            └───────────────────────────┼─────────────────────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │  Firestore       │
                                               │  tenants/{id} /  │
                                               │    settings/config│
                                               └──────────────────┘
```

## 10. Error Handling
- Never return `configuration: null`
- Always return structured result:
  ```
  { status, configuration, diagnostics, nextAction }
  ```
- Use AppError hierarchy for typed errors

## 11. Observability
- CONFIGURATION_LOADED / SAVED / UPDATED / PUBLISHED
- TENANT_RESOLVED / TENANT_RESOLUTION_FAILED
- CONFIGURATION_CACHE_HIT / MISS
- CONFIGURATION_HEALTH_CHECK

## 12. Deployment Checklist
- [ ] All new files committed
- [ ] Lint passing (`npm run lint`)
- [ ] Typecheck passing (`npm run type-check`)
- [ ] All tests passing (`npm run test`)
- [ ] Firestore rules updated
- [ ] Cache TTL reviewed
- [ ] Environment variables verified
- [ ] Migration script tested (if needed)
- [ ] No breaking API changes
