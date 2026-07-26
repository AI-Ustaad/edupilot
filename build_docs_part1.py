#!/usr/bin/env python3
"""
EduPilot Enterprise Governance Documentation Generator
Generates all documentation from verified knowledge base
"""
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path("/Users/imranhaidersandhu/Documents/edupilot")
DOCS_ROOT = PROJECT_ROOT / "docs"
MASTER_FACTS = PROJECT_ROOT / "EDUPILOT_MASTER_FACTS.md"

# Ensure directories exist
for dir_name in ["00-governance", "01-architecture", "02-engineering", "03-design", "04-product", "05-devops", "06-security", "07-ai", "08-memory"]:
    (DOCS_ROOT / dir_name).mkdir(parents=True, exist_ok=True)

def write_doc(path, content):
    """Write document with header"""
    full_path = DOCS_ROOT / path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.write_text(content)
    print(f"Created: {path}")

def header(title, doc_id=None):
    """Generate standard document header"""
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
    """Generate section header"""
    return f"{'#' * level} {title}\n\n"

def subsection(title):
    """Generate subsection header"""
    return f"### {title}\n\n"

def table(headers, rows):
    """Generate markdown table"""
    t = "| " + " | ".join(headers) + " |\n"
    t += "| " + " | ".join(["---"] * len(headers)) + " |\n"
    for row in rows:
        t += "| " + " | ".join(str(cell) for cell in row) + " |\n"
    t += "\n"
    return t

def callout(text, type="info"):
    """Generate callout block"""
    icons = {"info": "ℹ️", "warning": "⚠️", "critical": "🚫", "verified": "✅"}
    return f"{icons.get(type, 'ℹ️')} **{text}**\n\n"

def cross_ref(doc, section=None):
    """Generate cross-reference"""
    if section:
        return f"See: [{doc}](../{doc}#{section})"
    return f"See: [{doc}](../{doc})"

def mermaid_graph(code):
    """Wrap mermaid diagram"""
    return f"```mermaid\n{code}\n```\n\n"

# ============================================
# 00-GOVERNANCE DOCUMENTS
# ============================================

# PRD.md
prd = header("Product Requirements Document", "PRD")
prd += section("1. Purpose")
prd += "This document defines the product requirements for EduPilot, an Enterprise Multi-Tenant AI-Powered School Management SaaS platform. It serves as the single source of truth for product strategy, features, and business rules.\n\n"
prd += section("2. Product Vision")
prd += "EduPilot empowers educational institutions with intelligent, secure, and scalable management tools that drive operational excellence and student success.\n\n"
prd += section("3. Target Market")
prd += table(
    ["Segment", "Description", "Plan", "Evidence"],
    [
        ["Small Schools", "Up to 50 students", "Free", "EDUPILOT_SAAS_CATALOG.md"],
        ["Medium Schools", "50-200 students", "Starter (PKR 2,000/mo)", "EDUPILOT_SAAS_CATALOG.md"],
        ["Large Schools", "200-1000 students", "Professional (PKR 3,000/mo)", "EDUPILOT_SAAS_CATALOG.md"],
        ["Enterprise", "1000+ students", "Enterprise (PKR 5,000/mo)", "EDUPILOT_SAAS_CATALOG.md"],
    ]
)
prd += section("4. Core Modules")
prd += "Verified from EDUPILOT_MODULE_CATALOG.md:\n"
prd += "- Students\n- Staff\n- Attendance\n- Parents\n- Fees\n- Dashboard\n- Analytics\n- Academics (Exams, Assignments, Homework, Marks, Timetable, Subjects, Classes)\n- Communication (Notices, Events, Messages, Blog, Video Lectures)\n- Library\n- Transport\n- Hostel\n- AI Platform\n\n"
prd += section("5. Success Metrics")
prd += table(
    ["Metric", "Target", "Timeline", "Source"],
    [
        ["Architecture Health", "90/100", "Q2 2027", "EDUPILOT_MASTER_FACTS.md"],
        ["Security Health", "9/10", "Q1 2027", "EDUPILOT_SECURITY_CATALOG.md"],
        ["Platform Health", "9/10", "Q2 2027", "EDUPILOT_MASTER_FACTS.md"],
        ["Test Coverage", "80%", "Q4 2027", "EDUPILOT_MASTER_FACTS.md"],
        ["Production Uptime", "99.9%", "Q4 2027", "EDUPILOT_MASTER_FACTS.md"],
        ["API Response Time", "<200ms p95", "Q4 2027", "EDUPILOT_MASTER_FACTS.md"],
    ]
)
write_doc("00-governance/PRD.md", prd)

# PRODUCT_VISION.md
vision = header("Product Vision", "VISION")
vision += section("1. Vision Statement")
vision += "By December 2027, EduPilot will be the trusted platform for 10,000+ schools worldwide, processing 1M+ daily transactions with 99.9% uptime and SOC 2 Type II certification.\n\n"
vision += section("2. Mission")
vision += "Empower educational institutions with intelligent, secure, and scalable management tools that drive operational excellence and student success.\n\n"
vision += section("3. Strategic Objectives")
vision += table(
    ["Objective", "Target", "Dependencies"],
    [
        ["Architectural Excellence", "90/100 architecture health", "Clean Architecture enforcement"],
        ["Enterprise Security", "9/10 security health", "Auth, RBAC, Tenant isolation"],
        ["Platform Reliability", "9/10 platform health", "Events, Workers, Monitoring"],
        ["Module Completeness", "9/10+ all modules", "Interfaces, DTOs, Mappers"],
        ["Commercial Readiness", "Complete billing", "Stripe, Invoices, Subscriptions"],
        ["AI Differentiation", "Production-ready AI", "Gemini, Prompts, Moderation"],
        ["Quality & Compliance", "80%+ test coverage", "Integration tests, E2E tests"],
        ["Production Hardening", "99.9% uptime", "Monitoring, Observability, DR"],
    ]
)
vision += section("4. Competitive Positioning")
vision += "- **AI-First**: Integrated AI agents for teachers, parents, students, HR, finance\n"
vision += "- **Multi-Tenant**: Enterprise-grade tenant isolation with row-level security\n"
vision += "- **Comprehensive**: Complete academic management from admissions to results\n"
vision += "- **Scalable**: Built for 10,000+ schools with global deployment ready\n\n"
write_doc("00-governance/PRODUCT_VISION.md", vision)

# PRODUCT_SCOPE.md
scope = header("Product Scope", "SCOPE")
scope += section("1. In Scope")
scope += table(
    ["Module", "Features", "Status", "Evidence"],
    [
        ["Student Management", "CRUD, bulk import, OCR, promotion", "✅ Active", "EDUPILOT_MODULE_CATALOG.md"],
        ["Staff Management", "CRUD, roles, assignments", "✅ Active", "EDUPILOT_MODULE_CATALOG.md"],
        ["Attendance", "Mark, reports, bulk operations", "✅ Active", "EDUPILOT_MODULE_CATALOG.md"],
        ["Fees", "Invoices, payments, reminders", "✅ Active", "EDUPILOT_MODULE_CATALOG.md"],
        ["Exams", "Scheduling, results, reports", "✅ Active", "EDUPILOT_MODULE_CATALOG.md"],
        ["AI Platform", "Chatbot, exam generator, timetable AI", "✅ Active", "EDUPILOT_AI_CATALOG.md"],
        ["Multi-Tenancy", "Tenant isolation, subscriptions", "✅ Active", "EDUPILOT_SAAS_CATALOG.md"],
        ["RBAC", "Roles, permissions, middleware", "✅ Active", "EDUPILOT_SECURITY_CATALOG.md"],
    ]
)
scope += section("2. Out of Scope")
scope += "- Mobile native apps (iOS/Android)\n"
scope += "- Third-party LMS integrations (planned for v2.0)\n"
scope += "- Advanced analytics BI tools (planned for v2.0)\n"
scope += "- Custom domain white-labeling (planned for Q2 2027)\n\n"
scope += section("3. Current Limitations")
scope += callout("Architecture: Only 2 of 12 modules follow gold standard pattern", "warning")
scope += callout("Testing: ~5% coverage, no integration/E2E tests", "warning")
scope += callout("Security: 14 routes bypass auth, 6 services call adminDb directly", "critical")
scope += callout("Events: 15 publishers exist but event system partially wired", "info")
write_doc("00-governance/PRODUCT_SCOPE.md", scope)

print("00-governance documents created")
