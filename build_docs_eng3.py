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

# API_GUIDELINES.md
api_guide = header("API Guidelines", "APIG")
api_guide += section("1. RESTful Conventions")
api_guide += table(
    ["Operation", "Method", "Path", "Response"],
    [
        ["List", "GET", "/api/v1/{resource}"], "200 OK, array",
        ["Get", "GET", "/api/v1/{resource}/{id}"], "200 OK, object",
        ["Create", "POST", "/api/v1/{resource}"], "201 Created, object",
        ["Update", "PUT/PATCH", "/api/v1/{resource}/{id}"], "200 OK, object",
        ["Delete", "DELETE", "/api/v1/{resource}/{id}"], "204 No Content",
    ]
)
api_guide += section("2. Response Format")
api_guide += "```json\n"
api_guide += "// Success\n"
api_guide += "{\n"
api_guide += "  \"success\": true,\n"
api_guide += "  \"data\": { ... },\n"
api_guide += "  \"message\": \"Optional message\"\n"
api_guide += "}\n"
api_guide += "\n"
api_guide += "// Error\n"
api_guide += "{\n"
api_guide += "  \"success\": false,\n"
api_guide += "  \"error\": \"Error message\",\n"
api_guide += "  \"code\": \"ERROR_CODE\"\n"
api_guide += "}\n"
api_guide += "```\n\n"
api_guide += section("3. Middleware Order")
api_guide += "```typescript\n"
api_guide += "export const POST = withErrorHandler(\n"
api_guide += "  withPermission('students.create',\n"
api_guide += "    withTenant(\n"
api_guide += "      withAuth(async (request, context) => {\n"
api_guide += "        // Handler logic\n"
api_guide += "      })\n"
api_guide += "    )\n"
api_guide += "  )\n"
api_guide += ");\n"
api_guide += "```\n\n"
write_doc("02-engineering/API_GUIDELINES.md", api_guide)

# DTO_GUIDELINES.md
dto_guide = header("DTO Guidelines", "DTO")
dto_guide += section("1. DTO Pattern")
dto_guide += "All input/output must use DTOs. No raw objects in service interfaces.\n\n"
dto_guide += section("2. DTO Structure")
dto_guide += table(
    ["Type", "Naming", "Purpose", "Example"],
    [
        ["Create", "Create{Domain}DTO", "Input for creation", "CreateStudentDTO"],
        ["Update", "Update{Domain}DTO", "Input for update", "UpdateStudentDTO"],
        ["Response", "{Domain}ResponseDTO", "Output for client", "StudentResponseDTO"],
    ]
)
dto_guide += section("3. Validation")
dto_guide += "- DTOs must embed Zod validation schemas\n"
dto_guide += "- Validation occurs at route entry\n"
dto_guide += "- No validation in services or repositories\n\n"
write_doc("02-engineering/DTO_GUIDELINES.md", dto_guide)

# REPOSITORY_PATTERN.md
repo_guide = header("Repository Pattern", "REPO")
repo_guide += section("1. Pattern Definition")
repo_guide += "Repositories provide data access abstraction. All Firestore access must go through repositories.\n\n"
repo_guide += section("2. BaseRepository")
repo_guide += table(
    ["Method", "Signature", "Purpose"],
    [
        ["create", "(tenantId: string, data: any) => Promise<T>", "Create new document"],
        ["findById", "(tenantId: string, id: string) => Promise<T | null>", "Find by ID"],
        ["findAll", "(tenantId: string, filters?: any) => Promise<T[]>", "Find all matching"],
        ["update", "(tenantId: string, id: string, data: any) => Promise<T>", "Update document"],
        ["delete", "(tenantId: string, id: string) => Promise<void>", "Delete document"],
        ["count", "(tenantId: string, filters?: any) => Promise<number>", "Count documents"],
    ]
)
repo_guide += section("3. Violations")
repo_guide += "| Repository | Violation | Evidence |\n"
repo_guide += "|------------|-----------|----------|\n"
repo_guide += "| 8 repositories | Do not extend BaseRepository | EDUPILOT_MASTER_FACTS.md |\n"
repo_guide += "| 6 services | Call adminDb directly | EDUPILOT_MASTER_FACTS.md |\n"
repo_guide += "| 14 routes | Call adminDb directly | EDUPILOT_API_CATALOG.md |\n\n"
write_doc("02-engineering/REPOSITORY_PATTERN.md", repo_guide)

print("Engineering documents batch 3 created")
