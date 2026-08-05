# EduPilot Enterprise Governance Program (EGP)
## Phase 2 — Service Boundary Analysis
### Version 2.0 | Fortune 500 Architecture Governance Board

---

## PHASE 2: SERVICE BOUNDARY ANALYSIS

### Proposed New Services

---

### Service 1: AIService

| Attribute | Value |
|---|---|
| **Service Name** | AIService |
| **Business Capability** | AI-powered operations: exam question generation, timetable generation, report comments, book recommendations, chatbot responses |
| **Bounded Context** | AI Operations — all AI/LLM interactions isolated from HTTP request lifecycle |
| **Business Responsibility** | Orchestrate AI provider calls (Gemini), manage prompt construction, handle AI response parsing, implement retry logic, cache AI responses, enforce AI usage quotas per tenant |
| **Allowed Responsibilities** | - Generate exam questions from curriculum data - Generate timetable suggestions - Generate report comments - Recommend books - Process chatbot messages - Manage AI provider abstraction - Cache AI responses - Enforce per-tenant AI quotas |
| **Forbidden Responsibilities** | - HTTP request/response handling - Authentication/authorization - Direct Firestore access - Payment processing - File upload handling - Tenant resolution |
| **Consumers** | `app/api/v1/ai/agents/route.ts`, `app/api/v1/ai/chatbot/route.ts`, `app/api/v1/ai/report-comments/route.ts`, `app/api/v1/ai/smart-book-center/route.ts`, `app/api/v1/ai/timetable/route.ts`, `app/api/v1/ai/exam-questions/route.ts`, `app/api/v1/ai/exam-paper/route.ts`, `app/api/v1/staff/[id]/ai/route.ts` |
| **Dependencies** | `GeminiProvider`, `AgentRegistry`, `AIGateway`, `AiUsageRepository`, `ICacheProvider` |
| **Repository Dependencies** | `AiUsageRepository` (via `IAiUsageRepository`) |
| **External Libraries** | `@/lib/ai/providers/GeminiProvider`, `@/lib/ai/agents/AgentRegistry`, `@/lib/ai/gateway/AIGateway` |
| **Lifecycle** | Singleton (shared across requests) |
| **Singleton?** | Yes — `aiService = new AIService(...)` |
| **Factory?** | No |
| **DI?** | Constructor injection for `GeminiProvider`, `AgentRegistry`, `AIGateway`, `IAiUsageRepository`, `ICacheProvider` |
| **Thread Safety** | Stateless operations; GeminiProvider is stateless; AgentRegistry is stateless |
| **Caching** | Yes — in-memory cache for AI responses with TTL (300s default) |
| **Transaction Scope** | Single operation per request; no multi-repository transactions |
| **Events Published** | `AI_QUESTION_GENERATED`, `AI_TIMETABLE_GENERATED`, `AI_REPORT_COMMENT_GENERATED`, `AI_BOOK_RECOMMENDED`, `AI_CHATBOT_MESSAGE` |
| **Events Consumed** | `STUDENT_CREATED`, `STAFF_CREATED` (for AI summary generation) |

---

### Service 2: BillingService

| Attribute | Value |
|---|---|
| **Service Name** | BillingService |
| **Business Capability** | Payment processing: Stripe checkout, subscription management, invoice generation |
| **Bounded Context** | Billing & Payments — all payment-related logic isolated from HTTP request lifecycle |
| **Business Responsibility** | Create Stripe checkout sessions, process Stripe webhooks, manage subscriptions, generate invoices, handle payment success/failure, enforce subscription limits |
| **Allowed Responsibilities** | - Create Stripe checkout sessions - Process Stripe webhook events - Manage subscription lifecycle - Generate invoices - Handle payment success/failure callbacks - Enforce subscription plan limits - Process refunds |
| **Forbidden Responsibilities** | - HTTP request/response handling - Authentication/authorization - Direct Firestore access - AI provider calls - File upload handling |
| **Consumers** | `app/api/v1/stripe/create-checkout/route.ts`, `app/api/v1/stripe/webhook/route.ts`, `app/api/v1/subscriptions/route.ts`, `app/api/v1/subscriptions/activate/route.ts` |
| **Dependencies** | `stripe` SDK, `SubscriptionRepository`, `InvoiceRepository`, `TenantRepository`, `ICacheProvider` |
| **Repository Dependencies** | `SubscriptionRepository` (via `ISubscriptionRepository`), `InvoiceRepository` (via `IInvoiceRepository`), `TenantRepository` (via `ITenantRepository`) |
| **External Libraries** | `stripe` SDK, `@stripe/stripe-js` |
| **Lifecycle** | Singleton |
| **Singleton?** | Yes |
| **Factory?** | No |
| **DI?** | Constructor injection for Stripe client, `ISubscriptionRepository`, `IInvoiceRepository`, `ITenantRepository` |
| **Thread Safety** | Stripe SDK is thread-safe; repository instances are stateless |
| **Caching** | Yes — subscription status cache with TTL (60s) |
| **Transaction Scope** | Single operation per request; webhook events processed idempotently |
| **Events Published** | `SUBSCRIPTION_ACTIVATED`, `SUBSCRIPTION_CANCELED`, `SUBSCRIPTION_UPDATED`, `PAYMENT_SUCCEEDED`, `PAYMENT_FAILED`, `INVOICE_GENERATED` |
| **Events Consumed** | `STUDENT_CREATED` (for subscription limit checks) |

---

### Service 3: WebhookService

| Attribute | Value |
|---|---|
| **Service Name** | WebhookService |
| **Business Capability** | Webhook processing: QStash signature verification, event routing, report worker execution |
| **Bounded Context** | Webhook Processing — all webhook ingestion and routing isolated from HTTP request lifecycle |
| **Business Responsibility** | Verify QStash webhook signatures, route events to appropriate handlers, execute report workers, process event queues |
| **Allowed Responsibilities** | - Verify QStash webhook signatures - Route webhook events to handlers - Execute report workers - Process event queues - Idempotent event processing - Dead letter queue handling |
| **Forbidden Responsibilities** | - HTTP request/response handling - Authentication/authorization - Direct Firestore access - Payment processing - AI provider calls |
| **Consumers** | `app/api/v1/webhooks/qstash/route.ts` (or similar path) |
| **Dependencies** | `@/lib/queue`, `EventOutboxRepository`, `EventWorker`, `ReportWorker` |
| **Repository Dependencies** | `EventOutboxRepository` (via `IEventOutboxRepository`) |
| **External Libraries** | `@upstash/qstash`, `@/lib/queue/publisher.ts`, `@/lib/queue/queue.ts` |
| **Lifecycle** | Singleton |
| **Singleton?** | Yes |
| **Factory?** | No |
| **DI?** | Constructor injection for `IEventOutboxRepository`, queue publisher, event dispatcher |
| **Thread Safety** | Stateless operations; queue publisher is stateless |
| **Caching** | No — webhook processing is stateless |
| **Transaction Scope** | Single operation per webhook; idempotent processing via event outbox |
| **Events Published** | `WEBHOOK_RECEIVED`, `EVENT_PROCESSED`, `EVENT_FAILED`, `REPORT_GENERATED` |
| **Events Consumed** | `WEBHOOK_RECEIVED` (internal), `EVENT_OUTBOX_PENDING` |

---

### Service 4: OCRService (Extended)

| Attribute | Value |
|---|---|
| **Service Name** | OCRService (existing, extended) |
| **Business Capability** | Document OCR processing: text extraction from images, PDFs, and Word documents |
| **Bounded Context** | Document Processing — all OCR operations isolated from HTTP request lifecycle |
| **Business Responsibility** | Process uploaded documents through OCR pipelines, extract text, sanitize files, validate file types and sizes, return structured extraction results |
| **Allowed Responsibilities** | - Extract text from images (tesseract.js) - Extract text from PDFs (pdf-parse) - Extract text from Word docs (mammoth) - File sanitization and validation - File size and type validation - OCR result structuring - Error handling for failed extractions |
| **Forbidden Responsibilities** | - HTTP request/response handling - Authentication/authorization - Direct Firestore access - File storage (delegates to StorageRepository) - Payment processing |
| **Consumers** | `app/api/v1/students/ocr-admission/route.ts`, `app/api/v1/ocr/extract/route.ts`, `app/api/v1/staff/ocr/route.ts` |
| **Dependencies** | `tesseract.js`, `pdf-parse`, `mammoth`, `StorageRepository`, `IValidationService` |
| **Repository Dependencies** | `StorageRepository` (via `IStorageRepository`) |
| **External Libraries** | `tesseract.js`, `pdf-parse`, `mammoth` |
| **Lifecycle** | Singleton |
| **Singleton?** | Yes |
| **Factory?** | No |
| **DI?** | Constructor injection for `IStorageRepository`, `IValidationService` |
| **Thread Safety** | Tesseract.js worker is thread-safe; pdf-parse and mammoth are stateless |
| **Caching** | Yes — OCR results cache with TTL (3600s) keyed by file hash |
| **Transaction Scope** | Single file processing per request |
| **Events Published** | `OCR_DOCUMENT_PROCESSED`, `OCR_PROCESSING_FAILED`, `OCR_FILE_SANITIZED` |
| **Events Consumed** | `STUDENT_CREATED` (for OCR admission processing) |

---

### Service 5: BackgroundJobService

| Attribute | Value |
|---|---|
| **Service Name** | BackgroundJobService |
| **Business Capability** | Background job orchestration: attendance report generation, fee reminders, event processing |
| **Bounded Context** | Background Jobs — all scheduled and async job processing isolated from HTTP request lifecycle |
| **Business Responsibility** | Orchestrate background jobs including attendance report generation, fee reminder processing, event-driven job execution, job status tracking |
| **Allowed Responsibilities** | - Generate attendance reports - Process fee reminders - Execute event-driven jobs - Track job status - Handle job retries - Manage job queues |
| **Forbidden Responsibilities** | - HTTP request/response handling - Authentication/authorization - Direct Firestore access - Payment processing - AI provider calls |
| **Consumers** | `app/api/v1/jobs/attendance-report/route.ts`, `app/api/v1/jobs/fee-reminder/route.ts`, `app/api/v1/jobs/events/route.ts`, `app/api/v1/jobs/[jobId]/route.ts` |
| **Dependencies** | `AttendanceService`, `FeesService`, `EventWorker`, `ReportWorker`, `JobRepository` |
| **Repository Dependencies** | `JobRepository` (via `IJobRepository`), `EventOutboxRepository` (via `IEventOutboxRepository`) |
| **External Libraries** | `@/lib/workers/worker.ts`, `@/lib/workers/report.worker.tsx`, `@/lib/workers/event.worker.ts` |
| **Lifecycle** | Singleton |
| **Singleton?** | Yes |
| **Factory?** | No |
| **DI?** | Constructor injection for `IJobRepository`, `IAttendanceService`, `IFeesService`, `IEventOutboxRepository` |
| **Thread Safety** | Job execution is isolated per job; repository instances are stateless |
| **Caching** | Yes — job status cache with TTL (60s) |
| **Transaction Scope** | Single job execution per request; idempotent processing |
| **Events Published** | `JOB_STARTED`, `JOB_COMPLETED`, `JOB_FAILED`, `ATTENDANCE_REPORT_GENERATED`, `FEE_REMINDER_SENT` |
| **Events Consumed** | `JOB_SCHEDULED`, `JOB_RETRY` |

---

### Service 6: EducationRulesService

| Attribute | Value |
|---|---|
| **Service Name** | EducationRulesService |
| **Business Capability** | Education rules engine: rule-based processing for academic workflows |
| **Bounded Context** | Education Rules — all rule engine operations isolated from HTTP request lifecycle |
| **Business Responsibility** | Apply education rules to academic data, validate rule configurations, execute rule-based workflows |
| **Allowed Responsibilities** | - Apply education rules to student data - Validate rule configurations - Execute rule-based workflows - Return rule evaluation results |
| **Forbidden Responsibilities** | - HTTP request/response handling - Authentication/authorization - Direct Firestore access - Payment processing - AI provider calls |
| **Consumers** | `app/api/v1/education/rules/route.ts` |
| **Dependencies** | `educationRulesEngine` |
| **Repository Dependencies** | None |
| **External Libraries** | `educationRulesEngine` |
| **Lifecycle** | Singleton |
| **Singleton?** | Yes |
| **Factory?** | No |
| **DI?** | Constructor injection for `educationRulesEngine` |
| **Thread Safety** | Stateless operations |
| **Caching** | Yes — rule evaluation results cache with TTL (300s) |
| **Transaction Scope** | Single rule evaluation per request |
| **Events Published** | `RULE_EVALUATED`, `RULE_APPLIED` |
| **Events Consumed** | `STUDENT_CREATED`, `STUDENT_UPDATED` |

---

