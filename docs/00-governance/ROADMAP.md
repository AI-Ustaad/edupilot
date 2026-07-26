# Product Roadmap

**Document ID**: EDU-ROAD-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Roadmap Overview

This roadmap is derived from verified codebase state and planned improvements. All timelines are based on current implementation gaps identified in EDUPILOT_MASTER_FACTS.md.

## 2. Current State (Q3 2026)

| Component | Status | Health | Evidence |
| --- | --- | --- | --- |
| Architecture | Partial | 45/100 | EDUPILOT_MASTER_FACTS.md |
| Security | Partial | 5/10 | EDUPILOT_SECURITY_CATALOG.md |
| Platform | Partial | 6/10 | EDUPILOT_MASTER_FACTS.md |
| Testing | Minimal | 3/10 | EDUPILOT_MASTER_FACTS.md |
| AI Platform | Functional | 6/10 | EDUPILOT_AI_CATALOG.md |
| SaaS | Functional | 7/10 | EDUPILOT_SAAS_CATALOG.md |

## 3. Q4 2026: Foundation

**Objective**: Stabilize architecture and security foundation

| Initiative | Deliverable | Dependencies |
| --- | --- | --- |
| Architecture Enforcement | Lint rules, architecture tests, code review gates | None |
| Dead Code Removal | Remove BaseService, IOCRService, unused DTOs | None |
| Security Hardening | Fix auth gaps, tenant leaks, secrets management | Architecture Enforcement |
| Module Interfaces | Add interfaces to 10 modules | Architecture Enforcement |

## 4. Q1 2027: Platform Integration

**Objective**: Event system and background jobs production-ready

| Initiative | Deliverable | Dependencies |
| --- | --- | --- |
| Event Publishers | Publish events from all 15 services | Module Interfaces |
| Event Bus Hardening | Persistence, error isolation, schema validation | Event Publishers |
| Worker Deployment | Deploy 2+ workers, monitoring | Event Bus Hardening |
| Integration Tests | Auth, tenant, RBAC tests | Security Hardening |

## 5. Q2 2027: Academic Core

**Objective**: All 12 modules at gold standard

| Initiative | Deliverable | Dependencies |
| --- | --- | --- |
| Module Completion | All modules have interfaces, entities, DTOs, mappers | Module Interfaces |
| Dashboard Refactor | Interface, proper layering | Module Completion |
| Analytics Refactor | Interface, centralized logic | Module Completion |
| E2E Tests | Critical user journeys | Integration Tests |

## 6. Q3 2027: Commercial & AI

| Initiative | Deliverable | Dependencies |
| --- | --- | --- |
| Billing UI | Upgrade/downgrade/cancel interfaces | Security Hardening |
| Invoice Generation | Invoice service, PDF generation | Billing UI |
| AI Productionization | Templates, moderation, streaming, fallback | Event Bus Hardening |
| AI Analytics | Usage tracking, cost monitoring | AI Productionization |

## 7. Q4 2027: Launch

| Initiative | Deliverable | Dependencies |
| --- | --- | --- |
| Compliance | SOC 2 readiness, GDPR audit | All previous |
| Performance | <200ms p95, 99.9% uptime | All previous |
| Documentation | API docs, deployment guides | All previous |
| Release Candidate | EduPilot 1.0 Enterprise | All previous |

