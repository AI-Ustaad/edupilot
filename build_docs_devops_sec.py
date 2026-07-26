#!/usr/bin/env python3
"""Generate 05-devops, 06-security, 07-ai, 08-memory documents"""
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

def callout(text, type="info"):
    icons = {"info": "ℹ️", "warning": "⚠️", "critical": "🚫", "verified": "✅"}
    return f"{icons.get(type, 'ℹ️')} **{text}**\n\n"

# 05-devops
devops_docs = {
    "05-devops/DEPLOYMENT_GUIDE.md": header("Deployment Guide", "DEPG") + section("Platform") + "Vercel for frontend and serverless API.\n\n" + section("Steps") + "1. Push to main branch\n2. GitHub Actions runs CI\n3. Vercel deploys preview\n4. Manual promotion to production\n\n",
    "05-devops/ENVIRONMENT_GUIDE.md": header("Environment Guide", "ENV") + section("Environments") + table(
        ["Environment", "Purpose", "Branch"],
        [
            ["Development", "Local development", "main"],
            ["Staging", "QA/UAT", "staging"],
            ["Production", "Live system", "main"],
        ]
    ) + "\n" + section("Required Variables") + "- FIREBASE_ADMIN_CREDENTIALS\n- GEMINI_API_KEY\n- STRIPE_SECRET_KEY\n- RESEND_API_KEY\n- TWILIO_ACCOUNT_SID\n- TWILIO_AUTH_TOKEN\n- CRON_SECRET\n\n",
    "05-devops/CI_CD.md": header("CI/CD", "CICD") + section("Pipeline") + table(
        ["Stage", "Tool", "Purpose"],
        [
            ["Lint", "ESLint", "Code quality"],
            ["TypeCheck", "TypeScript", "Type safety"],
            ["Build", "Next.js", "Compilation"],
            ["Test", "Jest", "Unit tests"],
            ["Security", "Snyk", "Vulnerability scan"],
        ]
    ) + "\n",
    "05-devops/OBSERVABILITY.md": header("Observability", "OBS") + section("Current Status") + callout("Monitoring not implemented", "warning") + "\n",
    "05-devops/MONITORING.md": header("Monitoring", "MON") + section("Requirements") + "- API response times\n- Error rates\n- Queue depths\n- AI usage/costs\n- Tenant activity\n\n",
    "05-devops/BACKUP_STRATEGY.md": header("Backup Strategy", "BACKUP") + section("Current Status") + callout("No backup system implemented", "warning") + "\n",
    "05-devops/DISASTER_RECOVERY.md": header("Disaster Recovery", "DR") + section("Current Status") + callout("No DR plan implemented", "warning") + "\n",
}

for path, content in devops_docs.items():
    write_doc(path, content)

# 06-security
sec_docs = {
    "06-security/THREAT_MODEL.md": header("Threat Model", "THREAT") + section("Threats") + table(
        ["Threat", "Impact", "Likelihood", "Mitigation"],
        [
            ["Unauthorized access", "HIGH", "Medium", "withAuth + withPermission"],
            ["Cross-tenant data leak", "HIGH", "Low", "Tenant middleware + filters"],
            ["Data exfiltration", "HIGH", "Low", "Firestore security rules"],
            ["Injection attacks", "HIGH", "Low", "Parameterized queries"],
            ["DDoS", "MEDIUM", "Medium", "Rate limiting (planned)"],
        ]
    ) + "\n",
    "06-security/AUTHENTICATION.md": header("Authentication", "AUTH") + section("Current Implementation") + "Firebase Admin Auth with session cookies.\n\n" + section("Gaps") + "- No refresh tokens\n- No password reset\n- No MFA\n- No account lockout\n\n",
    "06-security/AUTHORIZATION.md": header("Authorization", "AUTHZ") + section("RBAC") + "5 roles, 100+ permissions.\n\n",
    "06-security/SECRETS_MANAGEMENT.md": header("Secrets Management", "SECRETS") + section("Current Issues") + table(
        ["Issue", "Severity", "Evidence"],
        [
            ["Hardcoded CRON_SECRET fallback", "HIGH", "jobs/attendance-report/route.ts"],
            ["Secrets in .env.local", "HIGH", "UNKNOWN - requires git history check"],
        ]
    ) + "\n",
    "06-security/COMPLIANCE.md": header("Compliance", "COMP") + section("Standards") + table(
        ["Standard", "Status", "Evidence"],
        [
            ["GDPR", "Partial", "Export/delete exists"],
            ["SOC 2", "Partial", "Partial audit coverage"],
            ["HIPAA", "Not applicable", "No PHI"],
        ]
    ) + "\n",
    "06-security/AUDIT_LOGGING.md": header("Audit Logging", "AUDIT") + section("Current") + table(
        ["Operation", "Logged", "Evidence"],
        [
            ["CREATE", "Yes", "AuditService.logCreate"],
            ["UPDATE", "Yes", "AuditService.logUpdate"],
            ["DELETE", "Yes", "AuditService.logDelete"],
            ["LOGIN", "No", "Missing"],
            ["LOGOUT", "No", "Missing"],
            ["PERMISSION_CHANGE", "No", "Missing"],
        ]
    ) + "\n",
}

for path, content in sec_docs.items():
    write_doc(path, content)

print("DevOps and Security documents created")
