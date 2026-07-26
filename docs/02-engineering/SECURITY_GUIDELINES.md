# Security Guidelines

**Document ID**: EDU-SECG-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Security Principles

| Principle | Requirement | Current Status |
| --- | --- | --- |
| Least privilege | Minimum permissions per role | ✅ Implemented |
| Defense in depth | Multiple security layers | ⚠️ Partial |
| Fail securely | Errors don't leak information | ⚠️ Partial |
| Don't trust client | Validate all input server-side | ✅ Implemented |
| Security by design | Security in every feature | ⚠️ Partial |

## 2. Mandatory Security Checks

| Check | Requirement | Enforcement |
| --- | --- | --- |
| Input validation | Zod schemas on all inputs | Code review |
| Output encoding | No raw user input in responses | Code review |
| Authentication | withAuth on protected routes | Architecture tests |
| Authorization | withPermission on sensitive routes | Architecture tests |
| Tenant isolation | tenantId in all queries | Architecture tests |
| Secrets management | No secrets in code | Security scan |
| SQL/NoSQL injection | Parameterized queries only | Code review |
| CSRF protection | SameSite cookies, CSRF tokens | Code review |

