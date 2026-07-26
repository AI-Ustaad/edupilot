# AI Agent Rules

**Document ID**: EDU-AIAG-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## Agent Pattern

All AI features must use the strategy pattern via AIGateway.

## Safety Requirements

| Requirement | Status | Evidence |
| --- | --- | --- |
| Content moderation | Prompt guard implemented | EDUPILOT_AI_CATALOG.md |
| Usage tracking | Per-tenant tracking | EDUPILOT_AI_CATALOG.md |
| Quota enforcement | Per-tenant limits | EDUPILOT_SAAS_CATALOG.md |
| Fallback provider | Missing | EDUPILOT_AI_CATALOG.md |


