#!/usr/bin/env python3
"""Generate remaining governance and start architecture documents"""
from pathlib import Path

PROJECT_ROOT = Path("/Users/imranhaidersandhu/Documents/edupilot")
DOCS_ROOT = PROJECT_ROOT / "docs"

def write_doc(path, content):
    full_path = DOCS_ROOT / path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.write_text(content)
    print(f"Created: {path}")

def header(title, doc_id=None):
    h = f"# {title}\n\n"
    h += f"**Document ID**: EDU-{doc_id if doc_id else 'DOC'}-001  \n"
    h += f"**Version**: 1.0  \n"
    h += f"**Date**: 2026-07-26  \n"
    h += f"**Status**: Canonical  \n"
    h += f"**Owner**: CTO Office, EduPilot Engineering  \n"
    h += f"**Classification**: Internal — Engineering Governance  \n\n"
    h += "---\n\n"
    return h

def section(title, level=2):
    return f"{'#' * level} {title}\n\n"

def table(headers, rows):
    t = "| " + " | ".join(headers) + " |\n"
    t += "| " + " | ".join(["---"] * len(headers)) + " |\n"
    for row in rows:
        t += "| " + " | ".join(str(cell) for cell in row) + " |\n"
    t += "\n"
    return t

# BUSINESS_RULES.md
business_rules = header("Business Rules", "BR")
business_rules += section("1. Tenant Isolation")
business_rules += "| Rule | Implementation | Evidence |\n"
business_rules += "|------|----------------|----------|\n"
business_rules += "| All queries must filter by tenantId | Repository pattern enforces tenantId parameter | EDUPILOT_MASTER_FACTS.md |\n"
business_rules += "| No cross-tenant data access | withTenant middleware validates tenant | EDUPILOT_SECURITY_CATALOG.md |\n"
business_rules += "| Tenant-scoped caching | Redis keys prefixed with tenantId | EDUPILOT_MASTER_FACTS.md |\n\n"

business_rules += section("2. Subscription Enforcement")
business_rules += "| Rule | Implementation | Evidence |\n"
business_rules += "|------|----------------|----------|\n"
business_rules += "| Max students enforced | StudentService checks limit before create | EDUPILOT_SAAS_CATALOG.md |\n"
business_rules += "| Max staff enforced | StaffService checks limit before create | EDUPILOT_SAAS_CATALOG.md |\n"
business_rules += "| Feature flags per plan | FeatureFlagService validates plan | EDUPILOT_SAAS_CATALOG.md |\n"
business_rules += "| 4 plans: Free, Starter, Professional, Enterprise | lib/config/subscription-plans.ts | EDUPILOT_SAAS_CATALOG.md |\n\n"

business_rules += section("3. RBAC Rules")
business_rules += "| Rule | Implementation | Evidence |\n"
business_rules += "|------|----------------|----------|\n"
business_rules += "| 5 roles defined | SUPER_ADMIN, ADMIN, TEACHER, PARENT, STUDENT | EDUPILOT_SECURITY_CATALOG.md |\n"
business_rules += "| Granular permissions | 100+ permissions in registry | EDUPILOT_SECURITY_CATALOG.md |\n"
business_rules += "| Permission pattern | {domain}.{action} | EDUPILOT_SECURITY_CATALOG.md |\n"
business_rules += "| Route protection | withAuth + withPermission middleware | EDUPILOT_API_CATALOG.md |\n\n"

business_rules += section("4. Data Integrity")
business_rules += "| Rule | Implementation | Evidence |\n"
business_rules += "|------|----------------|----------|\n"
business_rules += "| All mutations audited | AuditService.logCreate/Update/Delete | EDUPILOT_MASTER_FACTS.md |\n"
business_rules += "| Validation at entry | Zod schemas in DTOs | EDUPILOT_MASTER_FACTS.md |\n"
business_rules += "| Error consistency | AppError hierarchy | EDUPILOT_MASTER_FACTS.md |\n"
business_rules += "| Response format | createSuccessResponse/createErrorResponse | EDUPILOT_MASTER_FACTS.md |\n\n"

write_doc("00-governance/BUSINESS_RULES.md", business_rules)

# DECISION_LOG.md
decisions = header("Architectural Decision Log", "ADL")
decisions += section("Recorded Decisions")
decisions += table(
    ["ID", "Date", "Decision", "Rationale", "Status", "Impact"],
    [
        ["ADL-001", "2026-07-26", "Adopt Repository Pattern with BaseRepository", "Consistent data access, tenant scoping", "Accepted", "All modules"],
        ["ADL-002", "2026-07-26", "Use Firebase Firestore as primary database", "Serverless, scalable, real-time", "Accepted", "All data persistence"],
        ["ADL-003", "2026-07-26", "Session cookie authentication with Firebase Admin", "Secure, stateless, scalable", "Accepted", "All auth flows"],
        ["ADL-004", "2026-07-26", "Event-driven architecture with outbox pattern", "Reliability, decoupling, audit", "Accepted", "Event system"],
        ["ADL-005", "2026-07-26", "Gemini as primary AI provider", "Cost, performance, features", "Accepted", "AI platform"],
        ["ADL-006", "2026-07-26", "Multi-tenancy via shared schema + tenantId", "Cost effective, simpler operations", "Accepted", "All data"],
        ["ADL-007", "2026-07-26", "Next.js App Router for frontend", "Modern React, server components", "Accepted", "Frontend"],
        ["ADL-008", "2026-07-26", "BullMQ for background jobs", "Redis-based, reliable, observable", "Accepted", "Background processing"],
    ]
)
decisions += section("Pending Decisions")
decisions += table(
    ["ID", "Decision", "Options", "Decision Date"],
    [
        ["ADL-009", "Refresh token implementation", "JWT vs opaque tokens", "Q4 2026"],
        ["ADL-010", "Event persistence strategy", "Firestore vs dedicated event store", "Q1 2027"],
        ["ADL-011", "AI fallback provider", "OpenAI vs Anthropic vs Azure", "Q1 2027"],
        ["ADL-012", "Test framework standardization", "Jest vs Vitest", "Q4 2026"],
    ]
)
write_doc("00-governance/DECISION_LOG.md", decisions)

# CHANGELOG_GUIDELINES.md
changelog = header("Changelog Guidelines", "CLG")
changelog += section("1. Purpose")
changelog += "This document defines the standards for maintaining the EduPilot changelog. All changes must be documented for audit, compliance, and customer communication.\n\n"
changelog += section("2. Format")
changelog += "```\n"
changelog += "## [VERSION] - YYYY-MM-DD\n\n"
changelog += "### Added\n"
changelog += "- Feature description\n\n"
changelog += "### Changed\n"
changelog += "- Change description\n\n"
changelog += "### Fixed\n"
changelog += "- Bug fix description\n\n"
changelog += "### Security\n"
changelog += "- Security fix description\n"
changelog += "```\n\n"
changelog += section("3. Categories")
changelog += table(
    ["Category", "Description", "Example"],
    [
        ["Added", "New features", "Added student bulk import"],
        ["Changed", "Changes to existing features", "Changed fee calculation logic"],
        ["Deprecated", "Features being removed", "Deprecated legacy API"],
        ["Removed", "Removed features", "Removed unused DTOs"],
        ["Fixed", "Bug fixes", "Fixed tenant leak in teacher classes"],
        ["Security", "Security fixes", "Fixed role escalation vulnerability"],
    ]
)
write_doc("00-governance/CHANGELOG_GUIDELINES.md", changelog)

print("Governance documents batch 3 created")
