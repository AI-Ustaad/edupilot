#!/usr/bin/env python3
"""Generate remaining engineering documents and remaining sections"""
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

# Remaining engineering docs
docs = {
    "02-engineering/ACCESS_CONTROL_GUIDELINES.md": header("Access Control Guidelines", "ACG") + section("RBAC Rules") + table(
        ["Role", "Access Level", "Evidence"],
        [
            ["SUPER_ADMIN", "Full system access", "EDUPILOT_SECURITY_CATALOG.md"],
            ["ADMIN", "School-level admin", "EDUPILOT_SECURITY_CATALOG.md"],
            ["TEACHER", "Teacher-level access", "EDUPILOT_SECURITY_CATALOG.md"],
            ["PARENT", "Parent-level access", "EDUPILOT_SECURITY_CATALOG.md"],
            ["STUDENT", "Student-level access", "EDUPILOT_SECURITY_CATALOG.md"],
        ]
    ) + section("Permission Pattern") + "All permissions follow `{domain}.{action}` pattern (e.g., `students.view`, `students.create`).\n\n",

    "02-engineering/AI_AGENT_RULES.md": header("AI Agent Rules", "AIAG") + section("Agent Pattern") + "All AI features must use the strategy pattern via AIGateway.\n\n" + section("Safety Requirements") + table(
        ["Requirement", "Status", "Evidence"],
        [
            ["Content moderation", "Prompt guard implemented", "EDUPILOT_AI_CATALOG.md"],
            ["Usage tracking", "Per-tenant tracking", "EDUPILOT_AI_CATALOG.md"],
            ["Quota enforcement", "Per-tenant limits", "EDUPILOT_SAAS_CATALOG.md"],
            ["Fallback provider", "Missing", "EDUPILOT_AI_CATALOG.md"],
        ]
    ) + "\n",

    "02-engineering/DOCUMENTATION_RULES.md": header("Documentation Rules", "DOCR") + section("Requirements") + "- All public APIs must have documentation\n"
    "- All services must document parameters and return types\n"
    "- All modules must have a README\n"
    "- Architecture decisions must be logged\n\n",

    "02-engineering/DEFINITION_OF_DONE.md": header("Definition of Done", "DOD") + section("Story Level") + "- [ ] Code implements acceptance criteria\n"
    "- [ ] Unit tests written and passing\n"
    "- [ ] TypeScript compiles without errors\n"
    "- [ ] Lint passes\n"
    "- [ ] No console.log statements\n"
    "- [ ] Error handling implemented\n\n" + section("Feature Level") + "- [ ] All stories complete\n"
    "- [ ] Integration tests passing\n"
    "- [ ] Security review completed\n"
    "- [ ] Deployed to staging\n\n",
}

for path, content in docs.items():
    write_doc(path, content)

print("Engineering documents complete")
