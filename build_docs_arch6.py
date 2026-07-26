#!/usr/bin/env python3
"""Generate remaining architecture documents"""
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

def mermaid(code):
    return f"```mermaid\n{code}\n```\n\n"

# SECURITY_ARCHITECTURE.md
sec_arch = header("Security Architecture", "SECARCH")
sec_arch += section("1. Security Layers")
sec_arch += mermaid("graph TD\n")
sec_arch += "    A[Client Request] --> B[HTTPS]\n"
sec_arch += "    B --> C[Next.js Middleware]\n"
sec_arch += "    C --> D[withAuth - Session Validation]\n"
sec_arch += "    D --> E[withTenant - Tenant Isolation]\n"
sec_arch += "    E --> F[withPermission - RBAC]\n"
sec_arch += "    F --> G[Route Handler]\n"
sec_arch += "    G --> H[Service Layer]\n"
sec_arch += "    H --> I[Repository - Tenant Filter]\n"
sec_arch += "    I --> J[Firestore Security Rules]\n"
sec_arch += "```\n\n"
sec_arch += section("2. Authentication")
sec_arch += "| Component | Status | Evidence |\n"
sec_arch += "|-----------|--------|----------|\n"
sec_arch += "| Firebase Admin Auth | ✅ Active | lib/firebase-admin.ts |\n"
sec_arch += "| Session Cookies | ✅ Active | HttpOnly, SameSite=Lax, 5 days |\n"
sec_arch += "| Refresh Tokens | ❌ Missing | No refresh mechanism |\n"
sec_arch += "| Password Reset | ❌ Missing | No forgot-password route |\n"
sec_arch += "| MFA/2FA | ❌ Missing | No MFA implementation |\n"
sec_arch += "| Account Lockout | ❌ Missing | No failed login tracking |\n\n"
sec_arch += section("3. Authorization")
sec_arch += "| Component | Status | Evidence |\n"
sec_arch += "|-----------|--------|----------|\n"
sec_arch += "| Role Definitions | ✅ Active | 5 roles: SUPER_ADMIN, ADMIN, TEACHER, PARENT, STUDENT |\n"
sec_arch += "| Permission Registry | ✅ Active | 100+ permissions |\n"
sec_arch += "| withAuth Middleware | ✅ Active | 98 routes |\n"
sec_arch += "| withPermission Middleware | ✅ Active | 76 routes |\n"
sec_arch += "| Server-side Page Protection | ❌ Missing | Client-side only |\n\n"
sec_arch += section("4. Known Vulnerabilities")
sec_arch += table(
    ["Vulnerability", "Severity", "Location", "Evidence"],
    [
        ["Role escalation", "HIGH", "register-user route", "EDUPILOT_SECURITY_CATALOG.md"],
        ["No auth on curriculum/engine", "CRITICAL", "curriculum/engine/route.ts", "EDUPILOT_API_CATALOG.md"],
        ["No auth on education/rules", "CRITICAL", "education/rules/route.ts", "EDUPILOT_API_CATALOG.md"],
        ["adminDb in 14 routes", "HIGH", "Multiple routes", "EDUPILOT_API_CATALOG.md"],
        ["adminDb in 6 services", "HIGH", "Multiple services", "EDUPILOT_MASTER_FACTS.md"],
        ["Hardcoded CRON_SECRET fallback", "HIGH", "jobs/attendance-report/route.ts", "EDUPILOT_SECURITY_CATALOG.md"],
    ]
)
write_doc("01-architecture/SECURITY_ARCHITECTURE.md", sec_arch)

# AI_ARCHITECTURE.md
ai_arch = header("AI Architecture", "AIARCH")
ai_arch += section("1. AI System Overview")
ai_arch += "EduPilot AI is built on Google Gemini with a strategy pattern for different use cases.\n\n"
ai_arch += section("2. AI Provider")
ai_arch += table(
    ["Property", "Value", "Evidence"],
    [
        ["Provider", "Google Gemini", "EDUPILOT_AI_CATALOG.md"],
        ["Default Model", "gemini-2.5-flash", "lib/ai/providers/GeminiProvider.ts"],
        ["API Key", "GEMINI_API_KEY", "Environment variable"],
        ["Base URL", "GEMINI_BASE", "Environment variable"],
        ["Timeout", "55000ms", "lib/ai/providers/GeminiProvider.ts"],
        ["Max Retries", "3", "lib/ai/providers/GeminiProvider.ts"],
    ]
)
ai_arch += section("3. AI Strategies")
ai_arch += "| Strategy | File | Purpose | Evidence |\n"
ai_arch += "|----------|------|---------|----------|\n"
ai_arch += "| TeacherAgent | lib/ai/strategies/TeacherAgent.ts | Teacher operations | EDUPILOT_AI_CATALOG.md |\n"
ai_arch += "| HRAgent | lib/ai/strategies/HRAgent.ts | HR operations | EDUPILOT_AI_CATALOG.md |\n"
ai_arch += "| FinanceAgent | lib/ai/strategies/FinanceAgent.ts | Financial analysis | EDUPILOT_AI_CATALOG.md |\n"
ai_arch += "| StudentAgent | lib/ai/strategies/StudentAgent.ts | Student support | EDUPILOT_AI_CATALOG.md |\n"
ai_arch += "| PrincipalAgent | lib/ai/strategies/PrincipalAgent.ts | Principal dashboard | EDUPILOT_AI_CATALOG.md |\n"
ai_arch += "| ParentAgent | lib/ai/strategies/ParentAgent.ts | Parent communication | EDUPILOT_AI_CATALOG.md |\n"
ai_arch += "| AdmissionAgent | lib/ai/strategies/AdmissionAgent.ts | Admissions | EDUPILOT_AI_CATALOG.md |\n"
ai_arch += "| StaffStrategy | lib/ai/strategies/StaffStrategy.ts | Staff management | EDUPILOT_AI_CATALOG.md |\n\n"
ai_arch += section("4. AI Gateway")
ai_arch += mermaid("graph TD\n")
ai_arch += "    A[AI Routes] --> B[AIGateway]\n"
ai_arch += "    B --> C[GeminiProvider]\n"
ai_arch += "    B --> D[Strategies]\n"
ai_arch += "    D --> E[StaffStrategy]\n"
ai_arch += "    D --> F[TeacherAgent]\n"
ai_arch += "    D --> G[HRAgent]\n"
ai_arch += "    D --> H[FinanceAgent]\n"
ai_arch += "    B --> I[UsageTracker]\n"
ai_arch += "    I --> J[Firestore ai_usage]\n"
ai_arch += "```\n\n"
write_doc("01-architecture/AI_ARCHITECTURE.md", ai_arch)

print("Architecture documents batch 6 created")
