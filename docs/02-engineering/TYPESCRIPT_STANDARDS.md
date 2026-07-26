# TypeScript Standards

**Document ID**: EDU-TS-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Configuration

| Setting | Value | Evidence |
|---------|-------|----------|
| Strict mode | Enabled | tsconfig.json |
| Target | ES2017 | tsconfig.json |
| Module | ESNext | tsconfig.json |
| JSX | preserve | tsconfig.json |

## 2. Mandatory Rules

| Rule | Description | Enforcement |
| --- | --- | --- |
| No any | Avoid any type | TypeScript compiler |
| Explicit return types | All functions must have return types | Code review |
| Interface over type | Use interface for object shapes | Code review |
| Readonly for immutables | Use readonly for constants | Code review |
| No implicit any | Enable noImplicitAny | TypeScript compiler |

