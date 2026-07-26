# API Guidelines

**Document ID**: EDU-APIG-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. RESTful Conventions

| Operation | Method | Path | Response |
| --- | --- | --- | --- |
| List | GET | /api/v1/{resource} |
| 2 | 0 | 0 |   | O | K | , |   | a | r | r | a | y |
| Get | GET | /api/v1/{resource}/{id} |
| 2 | 0 | 0 |   | O | K | , |   | o | b | j | e | c | t |
| Create | POST | /api/v1/{resource} |
| 2 | 0 | 1 |   | C | r | e | a | t | e | d | , |   | o | b | j | e | c | t |
| Update | PUT/PATCH | /api/v1/{resource}/{id} |
| 2 | 0 | 0 |   | O | K | , |   | o | b | j | e | c | t |
| Delete | DELETE | /api/v1/{resource}/{id} |
| 2 | 0 | 4 |   | N | o |   | C | o | n | t | e | n | t |

## 2. Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}

// Error
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 3. Middleware Order

```typescript
export const POST = withErrorHandler(
  withPermission('students.create',
    withTenant(
      withAuth(async (request, context) => {
        // Handler logic
      })
    )
  )
);
```

