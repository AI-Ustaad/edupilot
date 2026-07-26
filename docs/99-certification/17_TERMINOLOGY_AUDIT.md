# Terminology Audit

**Date**: 2026-07-26T11:00:51.422432  
**Status**: Final

---

## Consistent Terminology

| Concept | Primary Term | Alternatives | Status |
| --- | --- | --- | --- |
| AI Provider | Gemini | Google Gemini | ✅ Consistent |
| Database | Firestore | Firebase Firestore | ⚠️ Minor variation |
| Auth Middleware | withAuth | Auth middleware | ✅ Consistent |
| Permission Middleware | withPermission | Permission check | ✅ Consistent |
| Tenant Middleware | withTenant | Tenant isolation | ✅ Consistent |

## Recommendations

- Standardize on 'Firestore' over 'Firebase Firestore'
- Use 'withAuth' consistently instead of 'Auth middleware'

