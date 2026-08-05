# EduPilot Enterprise Governance Program (EGP)
## Phase 3 — Interface Governance
### Version 2.0 | Fortune 500 Architecture Governance Board

---

## PHASE 3: INTERFACE GOVERNANCE

### Methodology
Before creating ANY interface, prove:
1. Why an interface is needed.
2. Which classes depend on it.
3. Dependency Inversion benefit.
4. Mocking benefit.
5. Testing benefit.
6. Future extension benefit.
If no measurable benefit exists, DO NOT CREATE THE INTERFACE.

---

### Interface 1: IStudentService

| Criterion | Evidence |
|---|---|
| **Why needed** | `StudentService` implements this interface. Multiple consumers (8+ routes) depend on the abstraction, not the concrete class. Enables mocking in tests. |
| **Classes depending** | `StudentService` (implements), route handlers (consume via interface type) |
| **Dependency Inversion benefit** | HIGH — routes depend on `IStudentService` abstraction, not `StudentService` concrete. Enables swapping implementations for testing. |
| **Mocking benefit** | HIGH — tests can mock `IStudentService` without instantiating `StudentService` which creates real repository instances. |
| **Testing benefit** | HIGH — unit tests for routes can inject mock `IStudentService`. Integration tests can use real `StudentService`. |
| **Future extension benefit** | MEDIUM — if a `ReadOnlyStudentService` or `CachedStudentService` is needed, the interface enables it. |
| **Decision** | KEEP |

---

### Interface 2: IStaffService

| Criterion | Evidence |
|---|---|
| **Why needed** | `StaffService` implements this interface. Multiple consumers depend on the abstraction. Enables mocking in tests. |
| **Classes depending** | `StaffService` (implements), route handlers |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 3: IFeesService

| Criterion | Evidence |
|---|---|
| **Why needed** | `FeesService` implements this interface. Consumers depend on the abstraction. |
| **Classes depending** | `FeesService` (implements), route handlers |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 4: IAttendanceService

| Criterion | Evidence |
|---|---|
| **Why needed** | `AttendanceService` implements this interface. Consumers depend on the abstraction. |
| **Classes depending** | `AttendanceService` (implements), route handlers |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 5: IConfigurationService

| Criterion | Evidence |
|---|---|
| **Why needed** | `ConfigurationService` implements this interface. Singleton export used by multiple routes. |
| **Classes depending** | `ConfigurationService` (implements), route handlers |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 6: IConfigurationDashboardService

| Criterion | Evidence |
|---|---|
| **Why needed** | `ConfigurationDashboardService` implements this interface. Created in ADR-001 Phase 1 to refactor the configuration dashboard route. |
| **Classes depending** | `ConfigurationDashboardService` (implements), `app/api/v1/configuration/dashboard/route.ts` |
| **Dependency Inversion benefit** | HIGH — route depends on interface, not concrete service |
| **Mocking benefit** | HIGH — tests can mock the interface |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 7: IClassService

| Criterion | Evidence |
|---|---|
| **Why needed** | `ClassService` implements this interface. However, the classes route does NOT use it — it directly instantiates `SectionRepository`. The interface exists but is not consumed by the route that needs it. |
| **Classes depending** | `ClassService` (implements), but NO route depends on `IClassService` for the classes route |
| **Dependency Inversion benefit** | LOW — the interface exists but the violating route does not use it |
| **Mocking benefit** | LOW — no test currently mocks `IClassService` for the classes route |
| **Testing benefit** | LOW — the classes route bypasses the service entirely |
| **Future extension benefit** | MEDIUM — if the classes route is refactored to use `ClassService`, the interface enables it |
| **Decision** | KEEP (but the route must be refactored to use it) |

---

### Interface 8: ICurriculumEngineService

| Criterion | Evidence |
|---|---|
| **Why needed** | `CurriculumEngineService` implements this interface. Singleton export used by curriculum routes. |
| **Classes depending** | `CurriculumEngineService` (implements), curriculum routes |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 9: IAssignmentService

| Criterion | Evidence |
|---|---|
| **Why needed** | `AssignmentService` implements this interface. Consumers depend on the abstraction. |
| **Classes depending** | `AssignmentService` (implements), route handlers |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 10: IBehaviorService

| Criterion | Evidence |
|---|---|
| **Why needed** | `BehaviorService` implements this interface. Consumer depends on the abstraction. |
| **Classes depending** | `BehaviorService` (implements), route handlers |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 11: IBookService

| Criterion | Evidence |
|---|---|
| **Why needed** | `BookService` implements this interface. Consumer depends on the abstraction. |
| **Classes depending** | `BookService` (implements), route handlers |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 12: ITimetableService

| Criterion | Evidence |
|---|---|
| **Why needed** | `TimetableService` implements this interface. Consumer depends on the abstraction. |
| **Classes depending** | `TimetableService` (implements), route handlers |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 13: IAIService (NEW — to be created)

| Criterion | Evidence |
|---|---|
| **Why needed** | AI routes currently use `AgentRegistry` and `AIGateway` directly. An interface is needed to abstract AI provider operations, enable mocking, and allow provider swapping. |
| **Classes depending** | Future `AIService` (will implement), AI route handlers (will consume) |
| **Dependency Inversion benefit** | HIGH — routes will depend on `IAIService` abstraction, not concrete AI provider implementations |
| **Mocking benefit** | HIGH — tests can mock `IAIService` without calling real Gemini API |
| **Testing benefit** | HIGH — unit tests for AI routes can inject mock `IAIService` |
| **Future extension benefit** | HIGH — enables swapping Gemini for another AI provider without modifying route handlers |
| **Decision** | CREATE |

---

### Interface 14: IBillingService (NEW — to be created)

| Criterion | Evidence |
|---|---|
| **Why needed** | Stripe routes currently use the Stripe SDK directly. An interface is needed to abstract payment operations, enable mocking, and allow payment processor swapping. |
| **Classes depending** | Future `BillingService` (will implement), Stripe route handlers (will consume) |
| **Dependency Inversion benefit** | HIGH — routes will depend on `IBillingService` abstraction, not concrete Stripe SDK |
| **Mocking benefit** | HIGH — tests can mock `IBillingService` without calling real Stripe API |
| **Testing benefit** | HIGH — unit tests for billing routes can inject mock `IBillingService` |
| **Future extension benefit** | HIGH — enables swapping Stripe for another payment processor without modifying route handlers |
| **Decision** | CREATE |

---

### Interface 15: IWebhookService (NEW — to be created)

| Criterion | Evidence |
|---|---|
| **Why needed** | Webhook route currently uses `verifyQStashSignature` and `EventWorker` directly. An interface is needed to abstract webhook processing, enable mocking, and centralize signature verification. |
| **Classes depending** | Future `WebhookService` (will implement), webhook route handlers (will consume) |
| **Dependency Inversion benefit** | HIGH — routes will depend on `IWebhookService` abstraction |
| **Mocking benefit** | HIGH — tests can mock `IWebhookService` without processing real webhooks |
| **Testing benefit** | HIGH — unit tests for webhook routes can inject mock `IWebhookService` |
| **Future extension benefit** | HIGH — enables swapping QStash for another webhook provider |
| **Decision** | CREATE |

---

### Interface 16: IOCRService (EXISTS — currently unused by routes)

| Criterion | Evidence |
|---|---|
| **Why needed** | `OCRService` exists and implements `IOCRService`. However, the OCR admission route bypasses it entirely. The interface is needed but the route must be refactored to use it. |
| **Classes depending** | `OCRService` (implements), but NO route currently depends on `IOCRService` |
| **Dependency Inversion benefit** | MEDIUM — interface exists but is not consumed by the route that should use it |
| **Mocking benefit** | MEDIUM — tests can mock `IOCRService` |
| **Testing benefit** | MEDIUM |
| **Future extension benefit** | HIGH — if the OCR admission route is refactored to use `OCRService`, the interface enables it |
| **Decision** | KEEP (but route must be refactored to use it) |

---

### Interface 17: IBackgroundJobService (NEW — to be created)

| Criterion | Evidence |
|---|---|
| **Why needed** | Background job routes directly instantiate repositories and use workers. An interface is needed to abstract job orchestration, enable mocking, and centralize job execution logic. |
| **Classes depending** | Future `BackgroundJobService` (will implement), job route handlers (will consume) |
| **Dependency Inversion benefit** | HIGH — routes will depend on `IBackgroundJobService` abstraction |
| **Mocking benefit** | HIGH — tests can mock `IBackgroundJobService` |
| **Testing benefit** | HIGH |
| **Future extension benefit** | HIGH — enables swapping job execution backend |
| **Decision** | CREATE |

---

### Interface 18: IEducationRulesService (NEW — to be created)

| Criterion | Evidence |
|---|---|
| **Why needed** | Education rules route uses `educationRulesEngine` directly. An interface is needed to abstract rule engine operations, enable mocking, and allow rule engine swapping. |
| **Classes depending** | Future `EducationRulesService` (will implement), education rules route handler (will consume) |
| **Dependency Inversion benefit** | HIGH — route will depend on `IEducationRulesService` abstraction |
| **Mocking benefit** | HIGH — tests can mock `IEducationRulesService` |
| **Testing benefit** | HIGH |
| **Future extension benefit** | HIGH — enables swapping education rules engine |
| **Decision** | CREATE |

---

### Interface 19: IAuthService

| Criterion | Evidence |
|---|---|
| **Why needed** | `AuthService` implements this interface. Used by auth routes. |
| **Classes depending** | `AuthService` (implements), auth route handlers |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 20: ITenantService

| Criterion | Evidence |
|---|---|
| **Why needed** | `TenantService` implements this interface. Used by setup routes. |
| **Classes depending** | `TenantService` (implements), setup routes |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 21: ITenantResolver

| Criterion | Evidence |
|---|---|
| **Why needed** | `TenantResolver` implements this interface. Used by middleware and route helpers for tenant resolution. |
| **Classes depending** | `TenantResolver` (implements), route helpers (`withTenant`, `withAuthAndPermission`) |
| **Dependency Inversion benefit** | HIGH — route helpers depend on `ITenantResolver` abstraction |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 22: IClaimsService

| Criterion | Evidence |
|---|---|
| **Why needed** | `ClaimsService` implements this interface. Used by `AuthService` for claim synchronization. |
| **Classes depending** | `ClaimsService` (implements), `AuthService` |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 23: IConfigurationCacheService

| Criterion | Evidence |
|---|---|
| **Why needed** | `ConfigurationCacheService` implements this interface. Used by `ConfigurationService` for caching. |
| **Classes depending** | `ConfigurationCacheService` (implements), `ConfigurationService` |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 24: IConfigurationHealthService

| Criterion | Evidence |
|---|---|
| **Why needed** | `ConfigurationHealthService` implements this interface. Used by `ConfigurationService` for health checks. |
| **Classes depending** | `ConfigurationHealthService` (implements), `ConfigurationService` |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### Interface 25: IDashboardService

| Criterion | Evidence |
|---|---|
| **Why needed** | `DashboardService` implements this interface. Used by dashboard route. |
| **Classes depending** | `DashboardService` (implements), dashboard route |
| **Dependency Inversion benefit** | HIGH |
| **Mocking benefit** | HIGH |
| **Testing benefit** | HIGH |
| **Future extension benefit** | MEDIUM |
| **Decision** | KEEP |

---

### PHASE 3 SUMMARY

| Interface | Needed? | Decision |
|---|---|---|
| IStudentService | YES | KEEP |
| IStaffService | YES | KEEP |
| IFeesService | YES | KEEP |
| IAttendanceService | YES | KEEP |
| IConfigurationService | YES | KEEP |
| IConfigurationDashboardService | YES | KEEP |
| IClassService | YES (but route bypasses it) | KEEP |
| ICurriculumEngineService | YES | KEEP |
| IAssignmentService | YES | KEEP |
| IBehaviorService | YES | KEEP |
| IBookService | YES | KEEP |
| ITimetableService | YES | KEEP |
| IAIService | YES (new) | CREATE |
| IBillingService | YES (new) | CREATE |
| IWebhookService | YES (new) | CREATE |
| IOCRService | YES (but route bypasses it) | KEEP |
| IBackgroundJobService | YES (new) | CREATE |
| IEducationRulesService | YES (new) | CREATE |
| IAuthService | YES | KEEP |
| ITenantService | YES | KEEP |
| ITenantResolver | YES | KEEP |
| IClaimsService | YES | KEEP |
| IConfigurationCacheService | YES | KEEP |
| IConfigurationHealthService | YES | KEEP |
| IDashboardService | YES | KEEP |

