# Storage Architecture

**Document ID**: EDU-STORAGE-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Storage Layers

| Layer | Technology | Purpose | Evidence |
| --- | --- | --- | --- |
| Primary Database | Firebase Firestore | Structured data | lib/firebase-admin.ts |
| Cache | Redis | Session cache, rate limiting | EDUPILOT_MASTER_FACTS.md |
| Queue Backend | Redis | BullMQ job queues | EDUPILOT_MASTER_FACTS.md |
| File Storage | Firebase Storage | Documents, images | EDUPILOT_MASTER_FACTS.md |

## 2. Caching Strategy

| Data Type | Cache Strategy | TTL | Evidence |
|-----------|----------------|-----|----------|
| Session data | Redis | 5 days | lib/auth/auth-server.ts |
| Feature flags | In-memory | App lifecycle | EDUPILOT_SAAS_CATALOG.md |
| Permissions | In-memory | App lifecycle | EDUPILOT_SECURITY_CATALOG.md |
| API responses | Redis | 5 minutes | EDUPILOT_MASTER_FACTS.md |

