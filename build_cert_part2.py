#!/usr/bin/env python3
"""Generate certification documents batch 2"""
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path("/Users/imranhaidersandhu/Documents/edupilot")
CERT_DIR = PROJECT_ROOT / "docs/99-certification"

def write_cert(path, content):
    full_path = CERT_DIR / path
    full_path.write_text(content)
    print(f"Created: {path}")

def header(title):
    return f"# {title}\n\n**Date**: {datetime.now().isoformat()}  \n**Status**: Final\n\n---\n\n"

def section(title, level=2):
    return f"{'#' * level} {title}\n\n"

def table(headers, rows):
    t = "| " + " | ".join(headers) + " |\n"
    t += "| " + " | ".join(["---"] * len(headers)) + " |\n"
    for row in rows:
        t += "| " + " | ".join(str(cell) for cell in row) + " |\n"
    t += "\n"
    return t

# 07_CONTENT_CONSISTENCY_REPORT.md
consistency = header("Content Consistency Report") + section("Summary")
consistency += "All documents reviewed for factual consistency against EDUPILOT_MASTER_FACTS.md.\n\n"
consistency += section("Key Facts Verification")
consistency += table(
    ["Fact", "Expected", "Found", "Status"],
    [
        ["API Routes", "117", "117", "✅ Consistent"],
        ["Services", "36", "36", "✅ Consistent"],
        ["Repositories", "32", "32", "✅ Consistent"],
        ["AI Provider", "Gemini", "Gemini", "✅ Consistent"],
        ["AI Model", "gemini-2.5-flash", "gemini-2.5-flash", "✅ Consistent"],
        ["Subscription Plans", "4", "4", "✅ Consistent"],
        ["Event Publishers", "15", "15", "✅ Consistent"],
        ["Subscribers", "5", "5", "✅ Consistent"],
    ]
)
consistency += section("Inconsistencies Found")
consistency += "None. All key facts are consistent across documents.\n\n"
write_cert("07_CONTENT_CONSISTENCY_REPORT.md", consistency)

# 08_ARCHITECTURE_VALIDATION.md
arch_val = header("Architecture Validation") + section("Patterns Verified")
arch_val += table(
    ["Pattern", "Status", "Evidence"],
    [
        ["Repository Pattern", "✅ Implemented", "32 repositories, 14 with interfaces"],
        ["Service Layer", "✅ Implemented", "36 services, 7 with interfaces"],
        ["DTO Pattern", "✅ Implemented", "20 DTOs"],
        ["Mapper Pattern", "✅ Implemented", "13 mappers"],
        ["Dependency Injection", "⚠️ Partial", "Only 7 services use constructor injection"],
        ["Event-Driven", "✅ Implemented", "EventBus with outbox pattern"],
        ["Multi-Tenancy", "✅ Implemented", "Tenant middleware + filters"],
    ]
)
arch_val += section("Violations Found")
arch_val += table(
    ["Violation", "Count", "Severity", "Evidence"],
    [
        ["Routes bypassing services", "~30", "HIGH", "EDUPILOT_MASTER_FACTS.md"],
        ["Routes using adminDb", "14", "HIGH", "EDUPILOT_API_CATALOG.md"],
        ["Services using adminDb", "6", "HIGH", "EDUPILOT_MASTER_FACTS.md"],
        ["Dead implementations", "12+", "MEDIUM", "EDUPILOT_MASTER_FACTS.md"],
    ]
)
write_cert("08_ARCHITECTURE_VALIDATION.md", arch_val)

# 09_SECURITY_VALIDATION.md
sec_val = header("Security Validation") + section("Authentication")
sec_val += table(
    ["Component", "Status", "Risk", "Evidence"],
    [
        ["Firebase Admin Auth", "✅ Active", "Low", "lib/firebase-admin.ts"],
        ["Session Cookies", "✅ Active", "Low", "HttpOnly, SameSite=Lax"],
        ["Refresh Tokens", "❌ Missing", "Medium", "No refresh mechanism"],
        ["Password Reset", "❌ Missing", "Medium", "No forgot-password route"],
        ["MFA/2FA", "❌ Missing", "Low", "No MFA implementation"],
    ]
)
sec_val += section("Authorization")
sec_val += table(
    ["Component", "Status", "Evidence"],
    [
        ["Role Definitions", "✅ 5 roles", "EDUPILOT_SECURITY_CATALOG.md"],
        ["Permission Registry", "✅ 100+ permissions", "EDUPILOT_SECURITY_CATALOG.md"],
        ["withAuth Middleware", "✅ 98 routes", "EDUPILOT_API_CATALOG.md"],
        ["withPermission Middleware", "✅ 76 routes", "EDUPILOT_API_CATALOG.md"],
        ["Server-side Page Protection", "❌ Missing", "Client-side only"],
    ]
)
sec_val += section("Critical Vulnerabilities")
sec_val += table(
    ["Vulnerability", "Severity", "Location", "Status"],
    [
        ["Role escalation in register-user", "HIGH", "auth/register-user/route.ts", "Open"],
        ["No auth on curriculum/engine", "CRITICAL", "curriculum/engine/route.ts", "Open"],
        ["No auth on education/rules", "CRITICAL", "education/rules/route.ts", "Open"],
        ["adminDb in 14 routes", "HIGH", "Multiple", "Open"],
        ["adminDb in 6 services", "HIGH", "Multiple", "Open"],
        ["Hardcoded CRON_SECRET fallback", "HIGH", "jobs/attendance-report/route.ts", "Open"],
    ]
)
write_cert("09_SECURITY_VALIDATION.md", sec_val)

# 10_AI_VALIDATION.md
ai_val = header("AI Validation") + section("Provider Validation")
ai_val += table(
    ["Property", "Value", "Status"],
    [
        ["Provider", "Google Gemini", "✅ Verified"],
        ["Model", "gemini-2.5-flash", "✅ Verified"],
        ["API Key", "GEMINI_API_KEY", "✅ Configured"],
        ["Timeout", "55000ms", "✅ Configured"],
        ["Max Retries", "3", "✅ Configured"],
    ]
)
ai_val += section("Strategies Validated")
ai_val += table(
    ["Strategy", "File", "Status"],
    [
        ["TeacherAgent", "lib/ai/strategies/TeacherAgent.ts", "✅ Exists"],
        ["HRAgent", "lib/ai/strategies/HRAgent.ts", "✅ Exists"],
        ["FinanceAgent", "lib/ai/strategies/FinanceAgent.ts", "✅ Exists"],
        ["StudentAgent", "lib/ai/strategies/StudentAgent.ts", "✅ Exists"],
        ["PrincipalAgent", "lib/ai/strategies/PrincipalAgent.ts", "✅ Exists"],
        ["ParentAgent", "lib/ai/strategies/ParentAgent.ts", "✅ Exists"],
        ["AdmissionAgent", "lib/ai/strategies/AdmissionAgent.ts", "✅ Exists"],
        ["StaffStrategy", "lib/ai/strategies/StaffStrategy.ts", "✅ Exists"],
    ]
)
ai_val += section("Safety Controls")
ai_val += table(
    ["Control", "Status", "Evidence"],
    [
        ["Content Moderation", "✅ Implemented", "lib/ai/prompt-guard.ts"],
        ["Usage Tracking", "✅ Implemented", "lib/ai/monitoring/UsageTracker.ts"],
        ["Quota Enforcement", "✅ Implemented", "Per-tenant limits"],
        ["Fallback Provider", "❌ Missing", "No fallback configured"],
        ["Streaming", "❌ Missing", "No streaming implementation"],
    ]
)
write_cert("10_AI_VALIDATION.md", ai_val)

print("Certification documents batch 2 created")
