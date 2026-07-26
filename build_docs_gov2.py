#!/usr/bin/env python3
"""Generate remaining governance documents"""
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

def subsection(title):
    return f"### {title}\n\n"

def table(headers, rows):
    t = "| " + " | ".join(headers) + " |\n"
    t += "| " + " | ".join(["---"] * len(headers)) + " |\n"
    for row in rows:
        t += "| " + " | ".join(str(cell) for cell in row) + " |\n"
    t += "\n"
    return t

def callout(text, type="info"):
    icons = {"info": "ℹ️", "warning": "⚠️", "critical": "🚫", "verified": "✅"}
    return f"{icons.get(type, 'ℹ️')} **{text}**\n\n"

# ROADMAP.md
roadmap = header("Product Roadmap", "ROAD")
roadmap += section("1. Roadmap Overview")
roadmap += "This roadmap is derived from verified codebase state and planned improvements. All timelines are based on current implementation gaps identified in EDUPILOT_MASTER_FACTS.md.\n\n"
roadmap += section("2. Current State (Q3 2026)")
roadmap += table(
    ["Component", "Status", "Health", "Evidence"],
    [
        ["Architecture", "Partial", "45/100", "EDUPILOT_MASTER_FACTS.md"],
        ["Security", "Partial", "5/10", "EDUPILOT_SECURITY_CATALOG.md"],
        ["Platform", "Partial", "6/10", "EDUPILOT_MASTER_FACTS.md"],
        ["Testing", "Minimal", "3/10", "EDUPILOT_MASTER_FACTS.md"],
        ["AI Platform", "Functional", "6/10", "EDUPILOT_AI_CATALOG.md"],
        ["SaaS", "Functional", "7/10", "EDUPILOT_SAAS_CATALOG.md"],
    ]
)
roadmap += section("3. Q4 2026: Foundation")
roadmap += "**Objective**: Stabilize architecture and security foundation\n\n"
roadmap += table(
    ["Initiative", "Deliverable", "Dependencies"],
    [
        ["Architecture Enforcement", "Lint rules, architecture tests, code review gates", "None"],
        ["Dead Code Removal", "Remove BaseService, IOCRService, unused DTOs", "None"],
        ["Security Hardening", "Fix auth gaps, tenant leaks, secrets management", "Architecture Enforcement"],
        ["Module Interfaces", "Add interfaces to 10 modules", "Architecture Enforcement"],
    ]
)
roadmap += section("4. Q1 2027: Platform Integration")
roadmap += "**Objective**: Event system and background jobs production-ready\n\n"
roadmap += table(
    ["Initiative", "Deliverable", "Dependencies"],
    [
        ["Event Publishers", "Publish events from all 15 services", "Module Interfaces"],
        ["Event Bus Hardening", "Persistence, error isolation, schema validation", "Event Publishers"],
        ["Worker Deployment", "Deploy 2+ workers, monitoring", "Event Bus Hardening"],
        ["Integration Tests", "Auth, tenant, RBAC tests", "Security Hardening"],
    ]
)
roadmap += section("5. Q2 2027: Academic Core")
roadmap += "**Objective**: All 12 modules at gold standard\n\n"
roadmap += table(
    ["Initiative", "Deliverable", "Dependencies"],
    [
        ["Module Completion", "All modules have interfaces, entities, DTOs, mappers", "Module Interfaces"],
        ["Dashboard Refactor", "Interface, proper layering", "Module Completion"],
        ["Analytics Refactor", "Interface, centralized logic", "Module Completion"],
        ["E2E Tests", "Critical user journeys", "Integration Tests"],
    ]
)
roadmap += section("6. Q3 2027: Commercial & AI")
roadmap += table(
    ["Initiative", "Deliverable", "Dependencies"],
    [
        ["Billing UI", "Upgrade/downgrade/cancel interfaces", "Security Hardening"],
        ["Invoice Generation", "Invoice service, PDF generation", "Billing UI"],
        ["AI Productionization", "Templates, moderation, streaming, fallback", "Event Bus Hardening"],
        ["AI Analytics", "Usage tracking, cost monitoring", "AI Productionization"],
    ]
)
roadmap += section("7. Q4 2027: Launch")
roadmap += table(
    ["Initiative", "Deliverable", "Dependencies"],
    [
        ["Compliance", "SOC 2 readiness, GDPR audit", "All previous"],
        ["Performance", "<200ms p95, 99.9% uptime", "All previous"],
        ["Documentation", "API docs, deployment guides", "All previous"],
        ["Release Candidate", "EduPilot 1.0 Enterprise", "All previous"],
    ]
)
write_doc("00-governance/ROADMAP.md", roadmap)

# RELEASE_STRATEGY.md
release = header("Release Strategy", "REL")
release += section("1. Release Philosophy")
release += "EduPilot follows a phased release strategy with gated quality checks. No feature reaches production without passing all gates.\n\n"
release += section("2. Release Tracks")
release += table(
    ["Track", "Frequency", "Target", "Gates"],
    [
        ["Patch", "Weekly", "Bug fixes only", "Unit tests, CI green"],
        ["Minor", "Bi-weekly", "Features, improvements", "Integration tests, staging QA"],
        ["Major", "Quarterly", "Architecture, new modules", "E2E tests, security audit, performance benchmarks"],
        ["Hotfix", "As needed", "Critical production fixes", "Minimal viable test, expedited review"],
    ]
)
release += section("3. Quality Gates")
release += table(
    ["Gate", "Requirement", "Enforcement"],
    [
        ["Code Review", "2 approvals required", "GitHub branch protection"],
        ["CI Green", "Lint, typecheck, build, tests pass", "GitHub Actions"],
        ["Architecture Tests", "No dependency violations", "Custom test suite"],
        ["Security Scan", "No critical/high findings", "Snyk/CodeQL"],
        ["Performance", "No regression >10%", "Lighthouse CI"],
        ["Staging Deploy", "Pass QA verification", "Manual gate"],
    ]
)
release += section("4. Rollback Strategy")
release += "- **Feature Flags**: All new features behind flags\n"
release += "- **Canary Deployment**: 5% → 25% → 100% rollout\n"
release += "- **Instant Rollback**: Git revert + redeploy < 5 minutes\n"
release += "- **Data Migration**: Reversible migrations only\n\n"
write_doc("00-governance/RELEASE_STRATEGY.md", release)

# PHASES.md
phases = header("Implementation Phases", "PHASE")
phases += section("1. Phase Overview")
phases += table(
    ["Phase", "Name", "Duration", "Goal", "Exit Criteria"],
    [
        ["Phase 1", "Foundation", "Q4 2026", "Architecture + Security", "Health scores >7/10"],
        ["Phase 2", "Platform", "Q1 2027", "Events + Jobs + Testing", "80% test coverage"],
        ["Phase 3", "Academic Core", "Q2 2027", "All modules gold standard", "All modules 9/10+"],
        ["Phase 4", "Commercial", "Q3 2027", "Billing + AI production", "Revenue flowing"],
        ["Phase 5", "Launch", "Q4 2027", "Production readiness", "99.9% uptime, SOC 2"],
    ]
)
phases += section("2. Phase 1: Foundation (Q4 2026)")
phases += "**Sprint 1**: Architecture Stabilization\n"
phases += "- Remove dead code (BaseService, IOCRService, 5 DTOs, 5 validators)\n"
phases += "- Remove duplicates (job.service.ts, configuration.service.ts)\n"
phases += "- Consolidate validation schemas\n"
phases += "- Complete barrel exports\n"
phases += "- Fix dependency direction violations\n\n"
phases += "**Sprint 2**: Security Foundation\n"
phases += "- Harden auth middleware\n"
phases += "- Add refresh tokens\n"
phases += "- Fix 14 no-auth routes\n"
phases += "- Fix tenant leak\n"
phases += "- Remove CRON_SECRET from code\n\n"
phases += section("3. Phase 2: Platform (Q1 2027)")
phases += "**Sprint 3**: Event System\n"
phases += "- Implement event publishers in all services\n"
phases += "- Harden event bus (persistence, error isolation, schema validation)\n"
phases += "- Process dead letter queue\n\n"
phases += "**Sprint 4**: Background Jobs\n"
phases += "- Deploy workers\n"
phases += "- Job monitoring\n"
phases += "- Retry alerts\n\n"
phases += section("4. Phase 3: Academic Core (Q2 2027)")
phases += "**Sprint 5-6**: Module Completion\n"
phases += "- Complete Attendance, Parents, Fees modules\n"
phases += "- Complete Academics interfaces (8 services)\n"
phases += "- Refactor Dashboard, Analytics\n"
phases += "- Complete Communication interfaces\n\n"
phases += section("5. Phase 4: Commercial (Q3 2027)")
phases += "**Sprint 7**: Billing\n"
phases += "- Upgrade/downgrade UI\n"
phases += "- Invoice generation\n"
phases += "- Payment history\n\n"
phases += "**Sprint 8**: AI Production\n"
phases += "- Prompt templates\n"
phases += "- Content moderation\n"
phases += "- Streaming responses\n"
phases += "- Conversation history\n\n"
phases += section("6. Phase 5: Launch (Q4 2027)")
phases += "**Sprint 9**: Quality & Compliance\n"
phases += "- Integration tests (80% coverage)\n"
phases += "- E2E tests\n"
phases += "- SOC 2 readiness\n\n"
phases += "**Sprint 10**: Production Hardening\n"
phases += "- Performance optimization\n"
phases += "- Monitoring and observability\n"
phases += "- Documentation\n"
phases += "- Release Candidate\n\n"
write_doc("00-governance/PHASES.md", phases)

# SUCCESS_METRICS.md
metrics = header("Success Metrics", "METRICS")
metrics += section("1. Architecture Metrics")
metrics += table(
    ["Metric", "Current", "Target", "Measurement"],
    [
        ["Architecture Health Score", "45/100", "90/100", "EDUPILOT_MASTER_FACTS.md"],
        ["Services with Interfaces", "7/36 (19%)", "36/36 (100%)", "EDUPILOT_MASTER_FACTS.md"],
        ["Repositories with Interfaces", "14/32 (44%)", "32/32 (100%)", "EDUPILOT_MASTER_FACTS.md"],
        ["Routes Bypassing Services", "~30", "0", "EDUPILOT_MASTER_FACTS.md"],
        ["Direct adminDb Calls", "20 (routes+services)", "0", "EDUPILOT_MASTER_FACTS.md"],
        ["Dead Implementations", "12+", "0", "EDUPILOT_MASTER_FACTS.md"],
    ]
)
metrics += section("2. Security Metrics")
metrics += table(
    ["Metric", "Current", "Target", "Measurement"],
    [
        ["Security Health Score", "5/10", "9/10", "EDUPILOT_SECURITY_CATALOG.md"],
        ["Routes Without Auth", "14", "0", "EDUPILOT_API_CATALOG.md"],
        ["Routes Without Permission", "41", "0", "EDUPILOT_API_CATALOG.md"],
        ["Critical Vulnerabilities", "3+", "0", "EDUPILOT_SECURITY_CATALOG.md"],
        ["Hardcoded Secrets", "Present", "0", "EDUPILOT_SECURITY_CATALOG.md"],
    ]
)
metrics += section("3. Quality Metrics")
metrics += table(
    ["Metric", "Current", "Target", "Measurement"],
    [
        ["Test Coverage", "~5%", "80%", "EDUPILOT_MASTER_FACTS.md"],
        ["Integration Tests", "0", "100+", "EDUPILOT_MASTER_FACTS.md"],
        ["E2E Tests", "0", "50+", "EDUPILOT_MASTER_FACTS.md"],
        ["Code Review Coverage", "Unknown", "100%", "EDUPILOT_MASTER_FACTS.md"],
        ["Security Findings (Critical)", "Multiple", "0", "EDUPILOT_SECURITY_CATALOG.md"],
    ]
)
metrics += section("4. Business Metrics")
metrics += table(
    ["Metric", "Target", "Timeline"],
    [
        ["Schools Onboarded", "10,000+", "Q4 2027"],
        ["Daily Transactions", "1M+", "Q4 2027"],
        ["Uptime", "99.9%", "Q4 2027"],
        ["API Response Time", "<200ms p95", "Q4 2027"],
        ["Customer Satisfaction", ">4.5/5", "Q4 2027"],
    ]
)
write_doc("00-governance/SUCCESS_METRICS.md", metrics)

print("Governance documents batch 2 created")
