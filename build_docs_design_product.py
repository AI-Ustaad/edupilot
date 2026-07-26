#!/usr/bin/env python3
"""Generate 03-design, 04-product, 05-devops, 06-security, 07-ai, 08-memory documents"""
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

# 03-design documents
design_docs = {
    "03-design/DESIGN_SYSTEM.md": header("Design System", "DS") + section("Principles") + "Consistent, accessible, responsive.\n\n" + section("Components") + "Built with shadcn/ui and Tailwind CSS.\n\n",
    "03-design/UI_GUIDELINES.md": header("UI Guidelines", "UIG") + section("Standards") + "Use Tailwind CSS for styling. Follow shadcn/ui patterns.\n\n",
    "03-design/UX_GUIDELINES.md": header("UX Guidelines", "UXG") + section("Principles") + "User-centered, accessible, performant.\n\n",
    "03-design/ACCESSIBILITY.md": header("Accessibility", "A11Y") + section("Standards") + "WCAG 2.1 AA compliance required.\n\n",
    "03-design/BRAND_GUIDELINES.md": header("Brand Guidelines", "BRAND") + section("Brand") + "EduPilot brand colors and typography.\n\n",
}

# 04-product documents
product_docs = {
    "04-product/MODULE_SPECIFICATIONS.md": header("Module Specifications", "MODSPEC") + section("Student Management") + "CRUD, bulk import, OCR, promotion.\n\n" + section("Staff Management") + "CRUD, roles, assignments.\n\n",
    "04-product/USER_ROLES.md": header("User Roles", "ROLES") + table(
        ["Role", "Description", "Evidence"],
        [
            ["SUPER_ADMIN", "Full system access", "EDUPILOT_SECURITY_CATALOG.md"],
            ["ADMIN", "School-level admin", "EDUPILOT_SECURITY_CATALOG.md"],
            ["TEACHER", "Teacher-level access", "EDUPILOT_SECURITY_CATALOG.md"],
            ["PARENT", "Parent-level access", "EDUPILOT_SECURITY_CATALOG.md"],
            ["STUDENT", "Student-level access", "EDUPILOT_SECURITY_CATALOG.md"],
        ]
    ) + "\n",
    "04-product/PERMISSIONS.md": header("Permissions", "PERMS") + section("Permission Registry") + "100+ granular permissions following `{domain}.{action}` pattern.\n\n",
    "04-product/WORKFLOWS.md": header("Workflows", "WF") + section("Student Admission") + "Register → Enroll → Assign Class → Set Fees → Notify Parents\n\n",
    "04-product/USER_JOURNEYS.md": header("User Journeys", "UJ") + section("Teacher Journey") + "Login → Take Attendance → Mark Homework → Grade Exams → View Reports\n\n",
    "04-product/FEATURE_MATRIX.md": header("Feature Matrix", "FEAT") + table(
        ["Feature", "Free", "Starter", "Professional", "Enterprise"],
        [
            ["Student Management", "✅", "✅", "✅", "✅"],
            ["Staff Management", "✅", "✅", "✅", "✅"],
            ["Attendance", "✅", "✅", "✅", "✅"],
            ["Fees", "✅", "✅", "✅", "✅"],
            ["Exams", "✅", "✅", "✅", "✅"],
            ["AI Chatbot", "❌", "❌", "✅", "✅"],
            ["AI Exam Generator", "❌", "❌", "✅", "✅"],
            ["Custom Branding", "❌", "❌", "❌", "✅"],
        ]
    ) + "\n",
    "04-product/AI_FEATURES.md": header("AI Features", "AIFEAT") + section("Current AI Features") + table(
        ["Feature", "Provider", "Status", "Evidence"],
        [
            ["AI Chatbot", "Gemini", "✅ Active", "EDUPILOT_AI_CATALOG.md"],
            ["Exam Generator", "Gemini", "✅ Active", "EDUPILOT_AI_CATALOG.md"],
            ["Timetable AI", "Gemini", "✅ Active", "EDUPILOT_AI_CATALOG.md"],
            ["Report Comments", "Gemini", "✅ Active", "EDUPILOT_AI_CATALOG.md"],
            ["OCR (Staff)", "Gemini", "✅ Active", "EDUPILOT_AI_CATALOG.md"],
        ]
    ) + "\n",
    "04-product/SUBSCRIPTION_MODEL.md": header("Subscription Model", "SUBMOD") + section("Plans") + table(
        ["Plan", "Price", "Max Students", "Max Staff", "Evidence"],
        [
            ["Free", "0 PKR", "50", "10", "EDUPILOT_SAAS_CATALOG.md"],
            ["Starter", "2000 PKR", "200", "50", "EDUPILOT_SAAS_CATALOG.md"],
            ["Professional", "3000 PKR", "1000", "200", "EDUPILOT_SAAS_CATALOG.md"],
            ["Enterprise", "5000 PKR", "999999", "999999", "EDUPILOT_SAAS_CATALOG.md"],
        ]
    ) + "\n",
    "04-product/MULTI_TENANCY.md": header("Multi-Tenancy", "MT") + section("Model") + "Shared database, shared schema, application-level row filtering.\n\n",
}

for path, content in {**design_docs, **product_docs}.items():
    write_doc(path, content)

print("Design and Product documents created")
