#!/usr/bin/env python3
"""Generate remaining 02-engineering documents"""
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

# TYPESCRIPT_STANDARDS.md
ts_std = header("TypeScript Standards", "TS")
ts_std += section("1. Configuration")
ts_std += "| Setting | Value | Evidence |\n"
ts_std += "|---------|-------|----------|\n"
ts_std += "| Strict mode | Enabled | tsconfig.json |\n"
ts_std += "| Target | ES2017 | tsconfig.json |\n"
ts_std += "| Module | ESNext | tsconfig.json |\n"
ts_std += "| JSX | preserve | tsconfig.json |\n\n"
ts_std += section("2. Mandatory Rules")
ts_std += table(
    ["Rule", "Description", "Enforcement"],
    [
        ["No any", "Avoid any type", "TypeScript compiler"],
        ["Explicit return types", "All functions must have return types", "Code review"],
        ["Interface over type", "Use interface for object shapes", "Code review"],
        ["Readonly for immutables", "Use readonly for constants", "Code review"],
        ["No implicit any", "Enable noImplicitAny", "TypeScript compiler"],
    ]
)
write_doc("02-engineering/TYPESCRIPT_STANDARDS.md", ts_std)

# NEXTJS_STANDARDS.md
next_std = header("Next.js Standards", "NEXT")
next_std += section("1. Framework Configuration")
next_std += "| Setting | Value | Evidence |\n"
next_std += "|---------|-------|----------|\n"
next_std += "| Version | Next.js 14 | package.json |\n"
next_std += "| App Router | Yes | app/ directory |\n"
next_std += "| Server Components | Default | app/ layout.tsx files |\n"
next_std += "| Dynamic Rendering | force-dynamic for APIs | app/api/v1/*/route.ts |\n\n"
next_std += section("2. API Route Standards")
next_std += table(
    ["Rule", "Requirement", "Evidence"],
    [
        ["File naming", "route.ts in segment folder", "app/api/v1/students/route.ts"],
        ["HTTP methods", "Export named functions (GET, POST, etc.)", "All route files"],
        ["Dynamic routes", "[id].ts for parameters", "app/api/v1/students/[id]/route.ts"],
        ["Dynamic force", "export const dynamic = 'force-dynamic'", "All API routes"],
    ]
)
write_doc("02-engineering/NEXTJS_STANDARDS.md", next_std)

# FIRESTORE_STANDARDS.md
fire_std = header("Firestore Standards", "FIRESTORE")
fire_std += section("1. Access Rules")
fire_std += table(
    ["Rule", "Description", "Enforcement"],
    [
        ["No direct Firestore from routes", "Routes must use repositories", "Architecture tests"],
        ["Tenant filter required", "All queries must include tenantId", "Architecture tests"],
        ["Indexes required", "Composite indexes for all queries", "CI/CD"],
        ["Batch operations", "Use batch for multi-document writes", "Code review"],
    ]
)
fire_std += section("2. Query Patterns")
fire_std += "```typescript\n"
fire_std += "// Correct: Repository with tenant filter\n"
fire_std += "async findByTenant(tenantId: string) {\n"
fire_std += "  return this.db.collection('students')\n"
fire_std += "    .where('tenantId', '==', tenantId)\n"
fire_std += "    .get();\n"
fire_std += "}\n"
fire_std += "```\n\n"
write_doc("02-engineering/FIRESTORE_STANDARDS.md", fire_std)

print("Engineering documents batch 2 created")
