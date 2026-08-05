# EduPilot Enterprise Governance Program (EGP)
## Phase 11 — Implementation Blueprint
### Version 2.0 | Fortune 500 Architecture Governance Board

---

## PHASE 11: IMPLEMENTATION BLUEPRINT

**NOTE:** This blueprint is generated ONLY after all governance gates have passed (Phases 1-10). All governance gates have been reviewed and approved.

---

### 11.1 Folder Structure

```
services/
├── ai/
│   ├── exam.service.ts              (EXISTS)
│   └── timetable.service.ts         (EXISTS)
├── billing/
│   └── billing.service.ts           (NEW)
├── webhooks/
│   └── webhook.service.ts           (NEW)
├── jobs/
│   └── background-job.service.ts    (NEW)
├── education/
│   └── education-rules.service.ts   (NEW)
├── ai.service.ts                    (NEW - main AI service)
├── student.service.ts               (EXISTS)
├── staff.service.ts                 (EXISTS)
├── fees.service.ts                  (EXISTS)
├── attendance.service.ts            (EXISTS)
├── ... (all existing services)

interfaces/
├── iai-service.ts                   (NEW)
├── ibilling-service.ts              (NEW)
├── iwebhook-service.ts              (NEW)
├── ibackground-job-service.ts       (NEW)
├── ieducation-rules-service.ts      (NEW)
├── ... (all existing interfaces)

app/api/v1/
├── ai/
│   ├── agents/route.ts              (MODIFY - delegate to AIService)
│   ├── chatbot/route.ts             (MODIFY - delegate to AIService)
│   ├── report-comments/route.ts     (MODIFY - delegate to AIService)
│   ├── smart-book-center/route.ts   (MODIFY - delegate to AIService)
│   ├── timetable/route.ts           (MODIFY - delegate to AIService)
│   ├── exam-questions/route.ts      (MODIFY - delegate to AIService)
│   ├── exam-paper/route.ts          (MODIFY - delegate to AIService)
│   └── staff/[id]/ai/route.ts       (MODIFY - delegate to AIService)
├── stripe/
│   ├── create-checkout/route.ts     (MODIFY - delegate to BillingService)
│   └── webhook/route.ts             (MODIFY - delegate to BillingService)
├── webhooks/
│   └── qstash/route.ts              (MODIFY - delegate to WebhookService)
├── jobs/
│   ├── attendance-report/route.ts   (MODIFY - delegate to BackgroundJobService)
│   ├── fee-reminder/route.ts        (MODIFY - delegate to BackgroundJobService)
│   └── events/route.ts              (MODIFY - delegate to BackgroundJobService)
├── education/
│   └── rules/route.ts               (MODIFY - delegate to EducationRulesService)
├── students/
│   └── ocr-admission/route.ts       (MODIFY - delegate to OCRService)
├── classes/route.ts                 (MODIFY - delegate to ClassService)
├── ... (all existing routes)

lib/ai/
├── ai.service.ts                    (NEW - AI service implementation)
├── billing.service.ts               (NEW - billing service implementation)
├── webhook.service.ts               (NEW - webhook service implementation)
├── background-job.service.ts        (NEW - background job service implementation)
├── education-rules.service.ts       (NEW - education rules service implementation)
```

---

### 11.2 Files to Create

| File | Purpose |
|---|---|
| `services/ai.service.ts` | Main AI service wrapping AgentRegistry, AIGateway, GeminiProvider |
| `services/billing.service.ts` | Billing service wrapping Stripe SDK, subscription management |
| `services/webhook.service.ts` | Webhook service wrapping QStash signature verification, event routing |
| `services/jobs/background-job.service.ts` | Background job orchestration service |
| `services/education/education-rules.service.ts` | Education rules engine abstraction |
| `interfaces/IAIService.ts` | AI service interface |
| `interfaces/IBillingService.ts` | Billing service interface |
| `interfaces/IWebhookService.ts` | Webhook service interface |
| `interfaces/IBackgroundJobService.ts` | Background job service interface |
| `interfaces/IEducationRulesService.ts` | Education rules service interface |

---

### 11.3 Files to Modify

| File | Modification |
|---|---|
| `app/api/v1/ai/agents/route.ts` | Delegate to AIService instead of AgentRegistry |
| `app/api/v1/ai/chatbot/route.ts` | Delegate to AIService instead of AgentRegistry |
| `app/api/v1/ai/report-comments/route.ts` | Delegate to AIService instead of AgentRegistry |
| `app/api/v1/ai/smart-book-center/route.ts` | Delegate to AIService instead of AgentRegistry |
| `app/api/v1/ai/timetable/route.ts` | Delegate to AIService instead of AgentRegistry |
| `app/api/v1/ai/exam-questions/route.ts` | Delegate to AIService instead of AgentRegistry |
| `app/api/v1/ai/exam-paper/route.ts` | Delegate to AIService instead of AgentRegistry |
| `app/api/v1/staff/[id]/ai/route.ts` | Delegate to AIService instead of AgentRegistry |
| `app/api/v1/stripe/create-checkout/route.ts` | Delegate to BillingService instead of Stripe SDK |
| `app/api/v1/stripe/webhook/route.ts` | Delegate to BillingService instead of Stripe SDK |
| `app/api/v1/webhooks/qstash/route.ts` | Delegate to WebhookService instead of direct library usage |
| `app/api/v1/jobs/attendance-report/route.ts` | Delegate to BackgroundJobService instead of direct repo instantiation |
| `app/api/v1/jobs/fee-reminder/route.ts` | Delegate to BackgroundJobService instead of direct repo instantiation |
| `app/api/v1/jobs/events/route.ts` | Delegate to BackgroundJobService instead of direct worker usage |
| `app/api/v1/education/rules/route.ts` | Delegate to EducationRulesService instead of direct engine usage |
| `app/api/v1/students/ocr-admission/route.ts` | Delegate to OCRService instead of direct library usage |
| `app/api/v1/classes/route.ts` | Delegate to ClassService instead of direct SectionRepository + remove FieldValue import |
| `services/index.ts` | Add exports for new services |
| `interfaces/index.ts` | Add exports for new interfaces |
| `lib/index.ts` | Add exports for new service modules if needed |

---

### 11.4 Interfaces

#### IAIService
```typescript
interface IAIService {
  generateExamQuestions(curriculumId: string, topic: string, count: number, tenantId: string): Promise<ExamQuestion[]>;
  generateTimetable(tenantId: string, constraints: TimetableConstraints): Promise<TimetableSuggestion>;
  generateReportComment(studentData: StudentSummary, commentType: string): Promise<string>;
  recommendBooks(studentId: string, tenantId: string): Promise<BookRecommendation[]>;
  processChatbotMessage(message: string, context: ChatContext): Promise<ChatResponse>;
  getAIUsage(tenantId: string): Promise<AIUsageMetrics>;
}
```

#### IBillingService
```typescript
interface IBillingService {
  createCheckoutSession(customerId: string, planId: string, tenantId: string): Promise<CheckoutSession>;
  processWebhook(payload: any, signature: string): Promise<WebhookResult>;
  getSubscription(tenantId: string): Promise<Subscription>;
  activateSubscription(tenantId: string, planId: string): Promise<Subscription>;
  cancelSubscription(tenantId: string): Promise<void>;
  generateInvoice(tenantId: string, period: string): Promise<Invoice>;
}
```

#### IWebhookService
```typescript
interface IWebhookService {
  verifySignature(payload: any, signature: string): Promise<boolean>;
  processEvent(event: QStashEvent): Promise<EventResult>;
  routeEvent(eventType: string, payload: any): Promise<void>;
}
```

#### IBackgroundJobService
```typescript
interface IBackgroundJobService {
  generateAttendanceReport(tenantId: string, startDate: string, endDate: string): Promise<ReportResult>;
  processFeeReminders(tenantId: string): Promise<ReminderResult>;
  processEvent(event: Event): Promise<EventResult>;
  getJobStatus(jobId: string): Promise<JobStatus>;
}
```

#### IEducationRulesService
```typescript
interface IEducationRulesService {
  evaluateRules(studentData: StudentData, rules: RuleConfig[]): Promise<RuleResult[]>;
  validateRuleConfig(config: RuleConfig): Promise<ValidationResult>;
  applyRules(studentId: string, tenantId: string): Promise<AppliedRule[]>;
}
```

---

### 11.5 Constructors

All new services follow the DI pattern:

```typescript
// AIService constructor
constructor(
  private readonly aiProvider: GeminiProvider,
  private readonly agentRegistry: AgentRegistry,
  private readonly aiGateway: AIGateway,
  private readonly aiUsageRepo: IAiUsageRepository,
  private readonly cache: ICacheProvider,
) {}

// BillingService constructor
constructor(
  private readonly stripe: Stripe,
  private readonly subscriptionRepo: ISubscriptionRepository,
  private readonly invoiceRepo: IInvoiceRepository,
  private readonly tenantRepo: ITenantRepository,
  private readonly cache: ICacheProvider,
) {}

// WebhookService constructor
constructor(
  private readonly queuePublisher: QueuePublisher,
  private readonly eventOutboxRepo: IEventOutboxRepository,
  private readonly eventDispatcher: EventDispatcher,
) {}

// BackgroundJobService constructor
constructor(
  private readonly jobRepo: IJobRepository,
  private readonly attendanceService: IAttendanceService,
  private readonly feesService: IFeesService,
  private readonly eventOutboxRepo: IEventOutboxRepository,
) {}

// EducationRulesService constructor
constructor(
  private readonly rulesEngine: EducationRulesEngine,
  private readonly cache: ICacheProvider,
) {}
```

---

### 11.6 DI Strategy

1. **Singleton exports** for all new services (following existing pattern: `export const aiService = new AIService(...)`)
2. **Constructor injection** for all dependencies
3. **Interface-based dependencies** — all repository and external library dependencies are injected via interfaces
4. **No direct instantiation** in route handlers — routes import singleton services
5. **No service-to-service direct instantiation** — services receive their dependencies via constructor

---

### 11.7 Registration

New services are registered as singleton exports in their respective service files:

```typescript
// services/ai.service.ts
export const aiService = new AIService(
  new GeminiProvider(),
  new AgentRegistry(),
  new AIGateway(),
  new AiUsageRepository(),
  memoryCacheProvider,
);

// services/billing.service.ts
export const billingService = new BillingService(
  stripe,
  new SubscriptionRepository(),
  new InvoiceRepository(),
  new TenantRepository(),
  memoryCacheProvider,
);
```

Routes import the singleton:

```typescript
import { aiService } from "@/services/ai.service";
import { billingService } from "@/services/billing.service";
```

---

### 11.8 Exports

Update `services/index.ts` to export new services:

```typescript
export * from "./ai.service";
export * from "./billing.service";
export * from "./webhook.service";
export * from "./jobs/background-job.service";
export * from "./education/education-rules.service";
```

Update `interfaces/index.ts` to export new interfaces:

```typescript
export * from "./IAIService";
export * from "./IBillingService";
export * from "./IWebhookService";
export * from "./IBackgroundJobService";
export * from "./IEducationRulesService";
```

---

### 11.9 Tests

| Test File | Purpose |
|---|---|
| `__tests__/services/ai.service.test.ts` | Unit tests for AIService |
| `__tests__/services/billing.service.test.ts` | Unit tests for BillingService |
| `__tests__/services/webhook.service.test.ts` | Unit tests for WebhookService |
| `__tests__/services/background-job.service.test.ts` | Unit tests for BackgroundJobService |
| `__tests__/services/education-rules.service.test.ts` | Unit tests for EducationRulesService |
| `__tests__/api/ai-routes.test.ts` | Integration tests for AI routes |
| `__tests__/api/billing-routes.test.ts` | Integration tests for billing routes |
| `__tests__/api/webhook-routes.test.ts` | Integration tests for webhook routes |
| `__tests__/api/job-routes.test.ts` | Integration tests for job routes |
| `__tests__/api/education-rules.test.ts` | Integration tests for education rules route |
| `__tests__/api/ocr-admission.test.ts` | Integration tests for OCR admission route |
| `__tests__/api/classes-route.test.ts` | Integration tests for classes route |

---

### 11.10 Migration Order

1. **Batch 1:** Create interfaces (IAIService, IBillingService, IWebhookService, IBackgroundJobService, IEducationRulesService)
2. **Batch 2:** Create AIService, BillingService, WebhookService, BackgroundJobService, EducationRulesService
3. **Batch 3:** Update services/index.ts and interfaces/index.ts barrel exports
4. **Batch 4:** Refactor AI routes to delegate to AIService
5. **Batch 5:** Refactor Stripe routes to delegate to BillingService
6. **Batch 6:** Refactor webhook route to delegate to WebhookService
7. **Batch 7:** Refactor job routes to delegate to BackgroundJobService
8. **Batch 8:** Refactor education rules route to delegate to EducationRulesService
9. **Batch 9:** Refactor OCR admission route to delegate to OCRService
10. **Batch 10:** Refactor classes route to delegate to ClassService + remove FieldValue import
11. **Batch 11:** Run full test suite (698 tests + new tests)
12. **Batch 12:** Run build verification (85 static pages)
13. **Batch 13:** Run lint and type-check
14. **Batch 14:** Deploy with staged rollout

---

