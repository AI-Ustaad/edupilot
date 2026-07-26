# Logging Standards

**Document ID**: EDU-LOG-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Logger

| Property | Value | Evidence |
|----------|-------|----------|
| Logger | lib/logger/logger.ts | Centralized logging |
| Levels | info, warn, error, debug | lib/logger/logger.ts |
| Format | Structured JSON | lib/logger/logger.ts |
| Output | Console + External service | UNKNOWN |

## 2. Logging Rules

| Level | Usage | Example |
| --- | --- | --- |
| info | Normal operations | User created, Fee processed |
| warn | Recoverable issues | Rate limit approaching, Fallback used |
| error | Failures | Database error, API failure |
| debug | Development only | Variable values, flow tracking |

