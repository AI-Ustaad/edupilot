#!/usr/bin/env python3
"""Generate final architecture documents"""
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

# DEPLOYMENT_ARCHITECTURE.md
deploy = header("Deployment Architecture", "DEPLOY")
deploy += section("1. Deployment Model")
deploy += table(
    ["Component", "Platform", "Purpose", "Evidence"],
    [
        ["Frontend", "Vercel", "Next.js hosting", "package.json"],
        ["API", "Vercel Serverless", "API routes", "Next.js configuration"],
        ["Database", "Firebase Firestore", "Primary data store", "lib/firebase-admin.ts"],
        ["Cache/Queue", "Redis Cloud", "Caching and BullMQ", "EDUPILOT_MASTER_FACTS.md"],
        ["AI", "Google Gemini API", "LLM provider", "EDUPILOT_AI_CATALOG.md"],
        ["Email", "Resend + SendGrid", "Transactional email", "EDUPILOT_SAAS_CATALOG.md"],
        ["SMS", "Twilio", "SMS notifications", "EDUPILOT_SAAS_CATALOG.md"],
        ["Payments", "Stripe", "Billing", "EDUPILOT_SAAS_CATALOG.md"],
        ["Real-time", "Pusher", "In-app notifications", "EDUPILOT_SAAS_CATALOG.md"],
        ["Monitoring", "Unknown", "Observability", "UNKNOWN"],
    ]
)
deploy += section("2. Environment Strategy")
deploy += "| Environment | Purpose | URL Pattern | Evidence |\n"
deploy += "|-------------|---------|-------------|----------|\n"
deploy += "| Development | Local development | localhost:3000 | package.json |\n"
deploy += "| Staging | QA and UAT | staging.edupilot.com | UNKNOWN |\n"
deploy += "| Production | Live system | edupilot.com | UNKNOWN |\n\n"
deploy += section("3. CI/CD Pipeline")
deploy += "```mermaid\n"
deploy += "graph LR\n"
deploy += "    A[Git Push] --> B[GitHub Actions]\n"
deploy += "    B --> C[Lint]\n"
deploy += "    B --> D[TypeCheck]\n"
deploy += "    B --> E[Build]\n"
deploy += "    B --> F[Test]\n"
deploy += "    F --> G[Deploy to Vercel]\n"
deploy += "    G --> H[Production]\n"
deploy += "```\n\n"
write_doc("01-architecture/DEPLOYMENT_ARCHITECTURE.md", deploy)

# TENANT_ARCHITECTURE.md
tenant = header("Tenant Architecture", "TENANT")
tenant += section("1. Multi-Tenancy Model")
tenant += "EduPilot uses **shared database, shared schema** multi-tenancy with application-level row filtering.\n\n"
tenant += section("2. Tenant Isolation")
tenant += table(
    ["Layer", "Isolation Mechanism", "Status", "Evidence"],
    [
        ["Middleware", "withTenant extracts tenantId", "✅ Active", "EDUPILOT_SECURITY_CATALOG.md"],
        ["Repository", "All queries filter by tenantId", "✅ Active", "EDUPILOT_MASTER_FACTS.md"],
        ["Service", "tenantId parameter in all methods", "✅ Active", "EDUPILOT_MASTER_FACTS.md"],
        ["Database", "tenantId column on all collections", "✅ Active", "EDUPILOT_DATABASE_ARCHITECTURE.md"],
        ["Cache", "Tenant-prefixed Redis keys", "⚠️ Partial", "EDUPILOT_MASTER_FACTS.md"],
        ["Encryption", "No tenant-level encryption", "❌ Missing", "EDUPILOT_SECURITY_CATALOG.md"],
    ]
)
tenant += section("3. Tenant Lifecycle")
tenant += "```mermaid\n"
tenant += "graph LR\n"
tenant += "    A[School Registration] --> B[Create Tenant Record]\n"
tenant += "    B --> C[Create Firebase User]\n"
tenant += "    C --> D[Initialize Subscription]\n"
tenant += "    D --> E[Create Default Roles]\n"
tenant += "    E --> F[Create Default Settings]\n"
tenant += "    F --> G[Send Welcome Email]\n"
tenant += "    G --> H[Tenant Active]\n"
tenant += "```\n\n"
tenant += section("4. Tenant Limits")
tenant += table(
    ["Plan", "Max Students", "Max Staff", "Max Classes", "Max Storage", "Evidence"],
    [
        ["Free", "50", "10", "10", "1GB", "EDUPILOT_SAAS_CATALOG.md"],
        ["Starter", "200", "50", "50", "10GB", "EDUPILOT_SAAS_CATALOG.md"],
        ["Professional", "1000", "200", "200", "50GB", "EDUPILOT_SAAS_CATALOG.md"],
        ["Enterprise", "999999", "999999", "999999", "100GB", "EDUPILOT_SAAS_CATALOG.md"],
    ]
)
write_doc("01-architecture/TENANT_ARCHITECTURE.md", tenant)

print("Architecture documents complete")
