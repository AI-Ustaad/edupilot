# AI System

**Document ID**: EDU-AISYS-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## Overview

EduPilot AI uses Google Gemini with strategy pattern.

## Components

| Component | File | Purpose |
| --- | --- | --- |
| AIGateway | lib/ai/gateway/AIGateway.ts | Main orchestrator |
| GeminiProvider | lib/ai/providers/GeminiProvider.ts | LLM provider |
| UsageTracker | lib/ai/monitoring/UsageTracker.ts | Usage tracking |
| PromptGuard | lib/ai/prompt-guard.ts | Content moderation |


