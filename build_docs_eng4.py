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

# SERVICE_LAYER.md
svc_guide = header("Service Layer", "SVC")
svc_guide += section("1. Purpose")
svc_guide += "The service layer contains all business logic. Services orchestrate repositories and enforce business rules.\n\n"
svc_guide += section("2. Service Contract")
svc_guide += table(
    ["Aspect", "Requirement", "Current Status"],
    [
        ["Interface", "All services implement interfaces", "7/36 (19%)"],
        ["Constructor Injection", "Dependencies injected via constructor", "7/36 (19%)"],
        ["Parameter Order", "tenantId, id, data, userId", "Inconsistent"],
        ["Return Types", "DTOs, not entities", "Partial"],
        ["Error Handling", "Throw AppError subclasses", "Partial"],
        ["Event Publishing", "Publish domain events", "15/36 (42%)"],
    ]
)
svc_guide += section("3. Forbidden Patterns")
svc_guide += table(
    ["Pattern", "Why Forbidden", "Enforcement"],
    [
        ["Direct adminDb calls", "Bypasses repository", "Architecture tests"],
        ["Business logic in routes", "Violates separation of concerns", "Code review"],
        ["Service-to-service imports", "Tight coupling", "Architecture tests"],
        ["Raw Firestore queries", "No tenant enforcement", "Architecture tests"],
    ]
)
write_doc("02-engineering/SERVICE_LAYER.md", svc_guide)

# ERROR_HANDLING.md
err_guide = header("Error Handling", "ERR")
err_guide += section("1. Error Hierarchy")
err_guide += "| Error Class | Purpose | HTTP Status | Evidence |\n"
err_guide += "|-------------|---------|-------------|----------|\n"
err_guide += "| AppError | Base error | 500 | lib/errors/AppError.ts |\n"
err_guide += "| NotFoundException | Resource not found | 404 | lib/errors/AppError.ts |\n"
err_guide += "| ValidationError | Input validation failed | 400 | lib/errors/AppError.ts |\n"
err_guide += "| BusinessError | Business rule violation | 422 | lib/errors/AppError.ts |\n"
err_guide += "| SubscriptionLimitException | Limit exceeded | 403 | lib/errors/AppError.ts |\n"
err_guide += "| RepositoryException | Data access error | 500 | lib/errors/AppError.ts |\n"
err_guide += "| ProviderException | External provider error | 502 | lib/errors/AppError.ts |\n\n"
err_guide += section("2. Error Handling Rules")
err_guide += "- All errors must extend AppError\n"
err_guide += "- Services must throw errors, not return error objects\n"
err_guide += "- withErrorHandler middleware catches all errors\n"
err_guide += "- Stack traces logged server-side, not returned to client\n"
err_guide += "- No console.error in production code\n\n"
write_doc("02-engineering/ERROR_HANDLING.md", err_guide)

# LOGGING.md
log_guide = header("Logging Standards", "LOG")
log_guide += section("1. Logger")
log_guide += "| Property | Value | Evidence |\n"
log_guide += "|----------|-------|----------|\n"
log_guide += "| Logger | lib/logger/logger.ts | Centralized logging |\n"
log_guide += "| Levels | info, warn, error, debug | lib/logger/logger.ts |\n"
log_guide += "| Format | Structured JSON | lib/logger/logger.ts |\n"
log_guide += "| Output | Console + External service | UNKNOWN |\n\n"
log_guide += section("2. Logging Rules")
log_guide += table(
    ["Level", "Usage", "Example"],
    [
        ["info", "Normal operations", "User created, Fee processed"],
        ["warn", "Recoverable issues", "Rate limit approaching, Fallback used"],
        ["error", "Failures", "Database error, API failure"],
        ["debug", "Development only", "Variable values, flow tracking"],
    ]
)
write_doc("02-engineering/LOGGING.md", log_guide)

print("Engineering documents batch 4 created")
