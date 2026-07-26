# EduPilot AI Catalog

**Source**: Derived from EDUPILOT_MASTER_FACTS.md  
**Date**: 2026-07-26  
**Purpose**: Complete inventory of AI components

---

## AI Providers

| Provider | Class | File | Model |
|----------|-------|------|-------|
| Gemini | GeminiProvider | lib/ai/providers/GeminiProvider.ts | gemini-2.5-flash |

## AI Strategies

| Strategy | File | Purpose |
|----------|------|---------|
| TeacherAgent | lib/ai/strategies/TeacherAgent.ts | Teacher-focused AI |
| HRAgent | lib/ai/strategies/HRAgent.ts | HR operations |
| FinanceAgent | lib/ai/strategies/FinanceAgent.ts | Financial analysis |
| StudentAgent | lib/ai/strategies/StudentAgent.ts | Student support |
| PrincipalAgent | lib/ai/strategies/PrincipalAgent.ts | Principal dashboard |
| ParentAgent | lib/ai/strategies/ParentAgent.ts | Parent communication |
| AdmissionAgent | lib/ai/strategies/AdmissionAgent.ts | Admissions |
| StaffStrategy | lib/ai/strategies/StaffStrategy.ts | Staff management |

## AI Gateway

| Component | File | Purpose |
|-----------|------|---------|
| AIGateway | lib/ai/gateway/AIGateway.ts | Main orchestrator |
| IAIGateway | interfaces/IAIGateway.ts | Gateway interface |

## AI Monitoring

| Component | File | Purpose |
|-----------|------|---------|
| UsageTracker | lib/ai/monitoring/UsageTracker.ts | Track AI usage per tenant |
| AIUsageRepository | repositories/ai-usage.repository.ts | Store usage data |

## AI Prompt Management

| Component | File | Purpose |
|-----------|------|---------|
| PromptGuard | lib/ai/prompt-guard.ts | Content moderation |
| ContextBuilder | lib/ai/context-builder.ts | Build AI context |
| Staff Prompt | lib/ai/prompts/staff.prompt.ts | Staff-related prompts |
| Common Prompt | lib/ai/prompts/common.prompt.ts | Shared prompts |

## AI API Routes

| Route | Purpose |
|-------|---------|
| app/api/v1/ai/**/*.ts | 7 AI endpoint files |

## AI Configuration

| Setting | Value | Evidence |
|---------|-------|----------|
| Provider | Gemini | lib/ai/providers/GeminiProvider.ts |
| Default Model | gemini-2.5-flash | lib/ai/providers/GeminiProvider.ts |
| API Key | GEMINI_API_KEY | Environment variable |
| Base URL | GEMINI_BASE | Environment variable |
| Timeout | 55000ms | lib/ai/providers/GeminiProvider.ts |
| Max Retries | 3 | lib/ai/providers/GeminiProvider.ts |

---

*This document is automatically derived from EDUPILOT_MASTER_FACTS.md.*
