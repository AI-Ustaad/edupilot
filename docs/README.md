# EduPilot Engineering Documentation

**Status**: Canonical Source of Truth  
**Version**: 1.0  
**Date**: 2026-07-26  
**Owner**: CTO Office, EduPilot Engineering

---

## Purpose

This documentation system is the **Single Source of Truth (SSOT)** for all EduPilot engineering decisions, architecture, and implementation standards. Every future engineering decision must be derived exclusively from these documents.

## Document Index

### 00-governance — Product & Strategy
- `PRD.md` — Product Requirements Document
- `PRODUCT_VISION.md` — Vision and mission
- `PRODUCT_SCOPE.md` — In-scope and out-of-scope features
- `ROADMAP.md` — Product roadmap by quarter
- `RELEASE_STRATEGY.md` — Release tracks and quality gates
- `PHASES.md` — Implementation phases
- `SUCCESS_METRICS.md` — Measurable success criteria
- `BUSINESS_RULES.md` — Enforced business rules
- `DECISION_LOG.md` — Architectural decision records
- `CHANGELOG_GUIDELINES.md` — Changelog standards

### 01-architecture — System Design
- `ARCHITECTURE.md` — Architecture overview
- `SYSTEM_OVERVIEW.md` — System purpose and technology stack
- `DOMAIN_MODEL.md` — Domain structure and entity relationships
- `DATA_FLOW.md` — Request and event flow diagrams
- `REQUEST_LIFECYCLE.md` — Detailed request lifecycle
- `DEPENDENCY_GRAPH.md` — Module and service dependencies
- `SERVICE_BOUNDARIES.md` — Service layer contracts
- `PACKAGE_STRUCTURE.md` — Directory layout and layer separation
- `MODULE_INTERACTIONS.md` — Module interaction matrix
- `DATABASE_ARCHITECTURE.md` — Firestore schema and multi-tenancy
- `STORAGE_ARCHITECTURE.md` — Storage layers and caching
- `EVENT_ARCHITECTURE.md` — Event bus and outbox pattern
- `API_ARCHITECTURE.md` — API design and route organization
- `SECURITY_ARCHITECTURE.md` — Security layers and vulnerabilities
- `AI_ARCHITECTURE.md` — AI system design
- `DEPLOYMENT_ARCHITECTURE.md` — Deployment model
- `TENANT_ARCHITECTURE.md` — Multi-tenancy implementation

### 02-engineering — Engineering Standards
- `ENGINEERING_RULES.md` — Mandatory engineering rules
- `CODING_STANDARDS.md` — Code conventions
- `TYPESCRIPT_STANDARDS.md` — TypeScript configuration
- `NEXTJS_STANDARDS.md` — Next.js patterns
- `FIRESTORE_STANDARDS.md` — Firestore access rules
- `API_GUIDELINES.md` — RESTful API conventions
- `DTO_GUIDELINES.md` — Data Transfer Object patterns
- `REPOSITORY_PATTERN.md` — Repository pattern rules
- `SERVICE_LAYER.md` — Service layer contracts
- `ERROR_HANDLING.md` — Error hierarchy and handling
- `LOGGING.md` — Logging standards
- `TESTING_GUIDELINES.md` — Test requirements
- `PERFORMANCE_GUIDELINES.md` — Performance targets
- `SECURITY_GUIDELINES.md` — Security best practices
- `ACCESS_CONTROL_GUIDELINES.md` — RBAC rules
- `AI_AGENT_RULES.md` — AI development rules
- `DOCUMENTATION_RULES.md` — Documentation requirements
- `DEFINITION_OF_DONE.md` — Completion criteria

### 03-design — Design System
- `DESIGN_SYSTEM.md` — Design principles
- `UI_GUIDELINES.md` — UI standards
- `UX_GUIDELINES.md` — UX principles
- `ACCESSIBILITY.md` — A11y requirements
- `BRAND_GUIDELINES.md` — Brand standards

### 04-product — Product Specifications
- `MODULE_SPECIFICATIONS.md` — Module requirements
- `USER_ROLES.md` — Role definitions
- `PERMISSIONS.md` — Permission registry
- `WORKFLOWS.md` — Business workflows
- `USER_JOURNEYS.md` — User journey maps
- `FEATURE_MATRIX.md` — Feature availability by plan
- `AI_FEATURES.md` — AI feature specifications
- `SUBSCRIPTION_MODEL.md` — Subscription plans
- `MULTI_TENANCY.md` — Multi-tenancy requirements

### 05-devops — Operations
- `DEPLOYMENT_GUIDE.md` — Deployment procedures
- `ENVIRONMENT_GUIDE.md` — Environment configuration
- `CI_CD.md` — CI/CD pipeline
- `OBSERVABILITY.md` — Observability requirements
- `MONITORING.md` — Monitoring standards
- `BACKUP_STRATEGY.md` — Backup procedures
- `DISASTER_RECOVERY.md` — DR plan

### 06-security — Security
- `THREAT_MODEL.md` — Threat analysis
- `AUTHENTICATION.md` — Auth implementation
- `AUTHORIZATION.md` — RBAC implementation
- `SECRETS_MANAGEMENT.md` — Secrets handling
- `COMPLIANCE.md` — Compliance status
- `AUDIT_LOGGING.md` — Audit requirements

### 07-ai — AI Platform
- `AI_SYSTEM.md` — AI system overview
- `PROMPT_ENGINEERING.md` — Prompt standards
- `AI_AGENTS.md` — Agent specifications
- `MODEL_SELECTION.md` — Model choices
- `RAG.md` — RAG implementation
- `SAFETY.md` — AI safety controls

### 08-memory — Project Memory
- `MEMORY.md` — Current state snapshot
- `ARCHITECTURAL_DECISIONS.md` — Decision history
- `KNOWN_LIMITATIONS.md` — Current limitations
- `FUTURE_IMPROVEMENTS.md` — Planned improvements

## Primary References

These documents are the canonical knowledge base:

- `EDUPILOT_MASTER_FACTS.md` — Complete factual inventory
- `EDUPILOT_API_CATALOG.md` — All API routes
- `EDUPILOT_MODULE_CATALOG.md` — All modules
- `EDUPILOT_AI_CATALOG.md` — AI components
- `EDUPILOT_SECURITY_CATALOG.md` — Security components
- `EDUPILOT_EVENT_CATALOG.md` — Event system
- `EDUPILOT_DEPENDENCY_INDEX.md` — Dependencies
- `EDUPILOT_SYMBOL_INDEX.md` — All symbols
- `EDUPILOT_USAGE_INDEX.md` — Usage counts
- `EDUPILOT_IMPORT_GRAPH.md` — Import paths
- `EDUPILOT_SAAS_CATALOG.md` — SaaS components

## Usage Rules

1. **Source Code Wins**: When in conflict, actual source code overrides documentation
2. **Verify Before Assume**: Never implement without checking knowledge base
3. **No Fabrication**: Every claim must be traceable to code
4. **Stay Synchronized**: Update docs when code changes
5. **Cross-Reference**: Link related documents

---

*This documentation system is the permanent engineering handbook for EduPilot.*
