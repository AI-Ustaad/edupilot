#!/usr/bin/env python3
"""Generate 02-engineering documents"""
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

# ENGINEERING_RULES.md
eng_rules = header("Engineering Rules", "ENGR")
eng_rules += section("1. Golden Rule")
eng_rules += "**All code must be verified against EDUPILOT_MASTER_FACTS.md. No implementation without evidence.**\n\n"
eng_rules += section("2. Mandatory References")
eng_rules += "Before implementing any feature, consult:\n"
eng_rules += "- EDUPILOT_MASTER_FACTS.md — Current state of all components\n"
eng_rules += "- EDUPILOT_API_CATALOG.md — Existing API routes\n"
eng_rules += "- EDUPILOT_MODULE_CATALOG.md — Module structure\n"
eng_rules += "- EDUPILOT_SECURITY_CATALOG.md — Security requirements\n"
eng_rules += "- EDUPILOT_DEPENDENCY_INDEX.md — Dependencies\n\n"
eng_rules += section("3. Prohibited Patterns")
eng_rules += table(
    ["Pattern", "Reason", "Enforcement"],
    [
        ["Routes calling repositories directly", "Bypasses business logic", "Architecture tests"],
        ["Services calling adminDb directly", "Bypasses repositories", "Code review"],
        ["Business logic in repositories", "Violates separation of concerns", "Code review"],
        ["Dead code left in codebase", "Increases maintenance burden", "Lint rules"],
        ["Duplicate implementations", "Causes confusion", "Architecture tests"],
        ["Split-brain validation", "Inconsistent validation", "Code review"],
    ]
)
eng_rules += section("4. Mandatory Patterns")
eng_rules += table(
    ["Pattern", "Requirement", "Enforcement"],
    [
        ["Service interfaces", "All services must implement interfaces", "Architecture tests"],
        ["Repository interfaces", "All repositories must implement interfaces", "Architecture tests"],
        ["DTOs for input/output", "All endpoints must use DTOs", "Code review"],
        ["Mappers for persistence", "All persistence via mappers", "Code review"],
        ["Event publishing", "All mutations must publish events", "Architecture tests"],
        ["Tenant scoping", "All queries must include tenantId", "Architecture tests"],
        ["Error handling", "Use AppError hierarchy", "Lint rules"],
        ["Response format", "Use createSuccessResponse/createErrorResponse", "Lint rules"],
    ]
)
write_doc("02-engineering/ENGINEERING_RULES.md", eng_rules)

# CODING_STANDARDS.md
coding = header("Coding Standards", "CODE")
coding += section("1. General Principles")
coding += "- **Verify before implementing**: Check EDUPILOT_MASTER_FACTS.md first\n"
coding += "- **No dead code**: Remove unused code immediately\n"
coding += "- **No duplication**: DRY principle enforced\n"
coding += "- **Type safety**: TypeScript strict mode\n"
coding += "- **Explicit over implicit**: Clear intent in code\n\n"
coding += section("2. Naming Conventions")
coding += table(
    ["Type", "Convention", "Example"],
    [
        ["Services", "PascalCase + Service suffix", "StudentService.ts"],
        ["Repositories", "PascalCase + Repository suffix", "student.repository.ts"],
        ["Interfaces", "I prefix + PascalCase", "IStudentService.ts"],
        ["Entities", "PascalCase + Entity suffix", "student.entity.ts"],
        ["DTOs", "PascalCase + DTO suffix", "CreateStudentDTO.ts"],
        ["Mappers", "PascalCase + Mapper suffix", "StudentPersistenceMapper.ts"],
        ["Validators", "PascalCase + Validator suffix", "CreateStudentValidator.ts"],
    ]
)
coding += section("3. File Organization")
coding += "```\n"
coding += "services/\n"
coding += "  {Domain}Service.ts          # Business logic\n"
coding += "\n"
coding += "repositories/\n"
coding += "  {domain}.repository.ts      # Data access\n"
coding += "\n"
coding += "interfaces/\n"
coding += "  I{Domain}Service.ts         # Service contract\n"
coding += "  I{Domain}Repository.ts      # Repository contract\n"
coding += "\n"
coding += "entities/\n"
coding += "  {domain}.entity.ts          # Domain entity\n"
coding += "\n"
coding += "dto/\n"
coding += "  Create{Domain}DTO.ts        # Input DTO\n"
coding += "  Update{Domain}DTO.ts        # Update DTO\n"
coding += "  {Domain}ResponseDTO.ts      # Output DTO\n"
coding += "\n"
coding += "lib/mappers/\n"
coding += "  {Domain}PersistenceMapper.ts # Entity <-> DB mapping\n"
coding += "```\n\n"
write_doc("02-engineering/CODING_STANDARDS.md", coding)

print("Engineering documents batch 1 created")
