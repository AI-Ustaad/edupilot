# Next.js Standards

**Document ID**: EDU-NEXT-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Framework Configuration

| Setting | Value | Evidence |
|---------|-------|----------|
| Version | Next.js 14 | package.json |
| App Router | Yes | app/ directory |
| Server Components | Default | app/ layout.tsx files |
| Dynamic Rendering | force-dynamic for APIs | app/api/v1/*/route.ts |

## 2. API Route Standards

| Rule | Requirement | Evidence |
| --- | --- | --- |
| File naming | route.ts in segment folder | app/api/v1/students/route.ts |
| HTTP methods | Export named functions (GET, POST, etc.) | All route files |
| Dynamic routes | [id].ts for parameters | app/api/v1/students/[id]/route.ts |
| Dynamic force | export const dynamic = 'force-dynamic' | All API routes |

