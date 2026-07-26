#!/usr/bin/env python3
"""Generate remaining engineering documents"""
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

# TESTING_GUIDELINES.md
test_guide = header("Testing Guidelines", "TEST")
test_guide += section("1. Current State")
test_guide += table(
    ["Metric", "Current", "Target", "Evidence"],
    [
        ["Total Tests", "209", "500+", "EDUPILOT_MASTER_FACTS.md"],
        ["Test Files", "20", "100+", "EDUPILOT_MASTER_FACTS.md"],
        ["Coverage", "~5%", "80%", "EDUPILOT_MASTER_FACTS.md"],
        ["Integration Tests", "0", "100+", "EDUPILOT_MASTER_FACTS.md"],
        ["E2E Tests", "0", "50+", "EDUPILOT_MASTER_FACTS.md"],
    ]
)
test_guide += section("2. Test Types")
test_guide += table(
    ["Type", "Scope", "Tool", "Current Status"],
    [
        ["Unit", "Services, utilities", "Jest", "✅ Active"],
        ["Integration", "API routes, repositories", "Jest + Supertest", "❌ Missing"],
        ["E2E", "User journeys", "Playwright", "❌ Missing"],
        ["Security", "Auth, RBAC, tenant", "Jest", "❌ Missing"],
        ["Performance", "API benchmarks", "k6", "❌ Missing"],
    ]
)
test_guide += section("3. Testing Rules")
test_guide += "- All new code must have unit tests\n"
test_guide += "- All API routes must have integration tests\n"
test_guide += "- Critical user journeys must have E2E tests\n"
test_guide += "- Tests must run in CI/CD pipeline\n"
test_guide += "- Coverage threshold: 80% for new code\n\n"
write_doc("02-engineering/TESTING_GUIDELINES.md", test_guide)

# PERFORMANCE_GUIDELINES.md
perf_guide = header("Performance Guidelines", "PERF")
perf_guide += section("1. Targets")
perf_guide += table(
    ["Metric", "Target", "Current", "Evidence"],
    [
        ["API Response Time (p95)", "<200ms", "Unknown", "EDUPILOT_MASTER_FACTS.md"],
        ["Database Query Time", "<50ms", "Unknown", "EDUPILOT_MASTER_FACTS.md"],
        ["Cache Hit Rate", ">90%", "Unknown", "EDUPILOT_MASTER_FACTS.md"],
        ["Bundle Size (JS)", "<200KB", "Unknown", "UNKNOWN"],
        ["Time to First Byte", "<100ms", "Unknown", "UNKNOWN"],
    ]
)
perf_guide += section("2. Optimization Rules")
perf_guide += table(
    ["Rule", "Description", "Enforcement"],
    [
        ["No N+1 queries", "Use batch queries or joins", "Code review"],
        ["Cache expensive queries", "Redis for repeated lookups", "Code review"],
        ["Paginate large results", "Limit + offset for all lists", "Code review"],
        ["Index Firestore queries", "Composite indexes for all queries", "CI/CD"],
        ["Optimize images", "Next.js Image component", "Code review"],
    ]
)
write_doc("02-engineering/PERFORMANCE_GUIDELINES.md", perf_guide)

# SECURITY_GUIDELINES.md
sec_guide = header("Security Guidelines", "SECG")
sec_guide += section("1. Security Principles")
sec_guide += table(
    ["Principle", "Requirement", "Current Status"],
    [
        ["Least privilege", "Minimum permissions per role", "✅ Implemented"],
        ["Defense in depth", "Multiple security layers", "⚠️ Partial"],
        ["Fail securely", "Errors don't leak information", "⚠️ Partial"],
        ["Don't trust client", "Validate all input server-side", "✅ Implemented"],
        ["Security by design", "Security in every feature", "⚠️ Partial"],
    ]
)
sec_guide += section("2. Mandatory Security Checks")
sec_guide += table(
    ["Check", "Requirement", "Enforcement"],
    [
        ["Input validation", "Zod schemas on all inputs", "Code review"],
        ["Output encoding", "No raw user input in responses", "Code review"],
        ["Authentication", "withAuth on protected routes", "Architecture tests"],
        ["Authorization", "withPermission on sensitive routes", "Architecture tests"],
        ["Tenant isolation", "tenantId in all queries", "Architecture tests"],
        ["Secrets management", "No secrets in code", "Security scan"],
        ["SQL/NoSQL injection", "Parameterized queries only", "Code review"],
        ["CSRF protection", "SameSite cookies, CSRF tokens", "Code review"],
    ]
)
write_doc("02-engineering/SECURITY_GUIDELINES.md", sec_guide)

print("Engineering documents batch 5 created")
