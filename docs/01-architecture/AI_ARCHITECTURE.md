# AI Architecture

**Document ID**: EDU-AIARCH-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. AI System Overview

EduPilot AI is built on Google Gemini with a strategy pattern for different use cases.

## 2. AI Provider

| Property | Value | Evidence |
| --- | --- | --- |
| Provider | Google Gemini | EDUPILOT_AI_CATALOG.md |
| Default Model | gemini-2.5-flash | lib/ai/providers/GeminiProvider.ts |
| API Key | GEMINI_API_KEY | Environment variable |
| Base URL | GEMINI_BASE | Environment variable |
| Timeout | 55000ms | lib/ai/providers/GeminiProvider.ts |
| Max Retries | 3 | lib/ai/providers/GeminiProvider.ts |

## 3. AI Strategies

| Strategy | File | Purpose | Evidence |
|----------|------|---------|----------|
| TeacherAgent | lib/ai/strategies/TeacherAgent.ts | Teacher operations | EDUPILOT_AI_CATALOG.md |
| HRAgent | lib/ai/strategies/HRAgent.ts | HR operations | EDUPILOT_AI_CATALOG.md |
| FinanceAgent | lib/ai/strategies/FinanceAgent.ts | Financial analysis | EDUPILOT_AI_CATALOG.md |
| StudentAgent | lib/ai/strategies/StudentAgent.ts | Student support | EDUPILOT_AI_CATALOG.md |
| PrincipalAgent | lib/ai/strategies/PrincipalAgent.ts | Principal dashboard | EDUPILOT_AI_CATALOG.md |
| ParentAgent | lib/ai/strategies/ParentAgent.ts | Parent communication | EDUPILOT_AI_CATALOG.md |
| AdmissionAgent | lib/ai/strategies/AdmissionAgent.ts | Admissions | EDUPILOT_AI_CATALOG.md |
| StaffStrategy | lib/ai/strategies/StaffStrategy.ts | Staff management | EDUPILOT_AI_CATALOG.md |

## 4. AI Gateway

```mermaid
graph TD

```

    A[AI Routes] --> B[AIGateway]
    B --> C[GeminiProvider]
    B --> D[Strategies]
    D --> E[StaffStrategy]
    D --> F[TeacherAgent]
    D --> G[HRAgent]
    D --> H[FinanceAgent]
    B --> I[UsageTracker]
    I --> J[Firestore ai_usage]
```

