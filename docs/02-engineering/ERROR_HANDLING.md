# Error Handling

**Document ID**: EDU-ERR-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Error Hierarchy

| Error Class | Purpose | HTTP Status | Evidence |
|-------------|---------|-------------|----------|
| AppError | Base error | 500 | lib/errors/AppError.ts |
| NotFoundException | Resource not found | 404 | lib/errors/AppError.ts |
| ValidationError | Input validation failed | 400 | lib/errors/AppError.ts |
| BusinessError | Business rule violation | 422 | lib/errors/AppError.ts |
| SubscriptionLimitException | Limit exceeded | 403 | lib/errors/AppError.ts |
| RepositoryException | Data access error | 500 | lib/errors/AppError.ts |
| ProviderException | External provider error | 502 | lib/errors/AppError.ts |

## 2. Error Handling Rules

- All errors must extend AppError
- Services must throw errors, not return error objects
- withErrorHandler middleware catches all errors
- Stack traces logged server-side, not returned to client
- No console.error in production code

