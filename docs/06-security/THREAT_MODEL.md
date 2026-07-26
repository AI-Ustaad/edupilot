# Threat Model

**Document ID**: EDU-THREAT-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## Threats

| Threat | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| Unauthorized access | HIGH | Medium | withAuth + withPermission |
| Cross-tenant data leak | HIGH | Low | Tenant middleware + filters |
| Data exfiltration | HIGH | Low | Firestore security rules |
| Injection attacks | HIGH | Low | Parameterized queries |
| DDoS | MEDIUM | Medium | Rate limiting (planned) |


