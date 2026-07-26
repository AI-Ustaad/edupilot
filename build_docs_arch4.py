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

# MODULE_INTERACTIONS.md
interactions = header("Module Interactions", "MODINT")
interactions += section("1. Interaction Matrix")
interactions += table(
    ["From Module", "To Module", "Interaction Type", "Mechanism", "Evidence"],
    [
        ["Students", "Attendance", "Query", "AttendanceService.getByStudent()", "EDUPILOT_MASTER_FACTS.md"],
        ["Students", "Fees", "Query", "FeesService.getByStudent()", "EDUPILOT_MASTER_FACTS.md"],
        ["Students", "Parents", "Query", "ParentService.getByStudent()", "EDUPILOT_MASTER_FACTS.md"],
        ["Students", "Dashboard", "Aggregate", "DashboardService.getStudentStats()", "EDUPILOT_MASTER_FACTS.md"],
        ["Staff", "Attendance", "Query", "AttendanceService.getByStaff()", "EDUPILOT_MASTER_FACTS.md"],
        ["Staff", "Timetable", "Query", "TimetableService.getByStaff()", "EDUPILOT_MASTER_FACTS.md"],
        ["Attendance", "Dashboard", "Aggregate", "DashboardService.getAttendanceStats()", "EDUPILOT_MASTER_FACTS.md"],
        ["Fees", "Dashboard", "Aggregate", "DashboardService.getFeeStats()", "EDUPILOT_MASTER_FACTS.md"],
        ["Events", "All", "Event", "EventBus.publish()", "EDUPILOT_EVENT_CATALOG.md"],
        ["Notifications", "All", "Event", "NotificationSubscriber", "EDUPILOT_EVENT_CATALOG.md"],
    ]
)
interactions += section("2. Event-Based Interactions")
interactions += "```mermaid\n"
interactions += "graph LR\n"
interactions += "    Students -->|STUDENT_CREATED| Events\n"
interactions += "    Staff -->|STAFF_CREATED| Events\n"
interactions += "    Attendance -->|ATTENDANCE_MARKED| Events\n"
interactions += "    Fees -->|FEE_CREATED| Events\n"
interactions += "    Events --> Audit\n"
interactions += "    Events --> Notifications\n"
interactions += "    Events --> Dashboard\n"
interactions += "```\n\n"
write_doc("01-architecture/MODULE_INTERACTIONS.md", interactions)

# DATABASE_ARCHITECTURE.md
db_arch = header("Database Architecture", "DBARCH")
db_arch += section("1. Database Technology")
db_arch += "| Property | Value | Evidence |\n"
db_arch += "|----------|-------|----------|\n"
db_arch += "| Database | Firebase Firestore | lib/firebase-admin.ts |\n"
db_arch += "| Model | NoSQL, document-based | Firestore documentation |\n"
db_arch += "| Schema | Shared schema, tenant-scoped | EDUPILOT_MASTER_FACTS.md |\n"
db_arch += "| Indexing | Composite indexes for queries | firestore.indexes.json |\n\n"
db_arch += section("2. Collection Structure")
db_arch += "| Collection | Purpose | Tenant Scoped | Evidence |\n"
db_arch += "|------------|---------|---------------|----------|\n"
db_arch += "| users | User accounts | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |\n"
db_arch += "| students | Student records | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |\n"
db_arch += "| staff | Staff records | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |\n"
db_arch += "| attendance | Attendance records | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |\n"
db_arch += "| fees | Fee records | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |\n"
db_arch += "| exams | Exam records | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |\n"
db_arch += "| classes | Class definitions | Yes (tenantId field) | EDUPILOT_MASTER_FACTS.md |\n"
db_arch += "| ai_usage | AI usage tracking | Yes (tenantId field) | EDUPILOT_AI_CATALOG.md |\n"
db_arch += "| events | Event outbox | Yes (tenantId field) | EDUPILOT_EVENT_CATALOG.md |\n"
db_arch += "| audit_logs | Audit trail | Yes (tenantId field) | EDUPILOT_SECURITY_CATALOG.md |\n\n"
db_arch += section("3. Multi-Tenancy Strategy")
db_arch += "- **Shared Database**: All tenants share Firestore project\n"
db_arch += "- **Shared Schema**: All collections have tenantId field\n"
db_arch += "- **Row-Level Filtering**: Application-level WHERE tenantId = ?\n"
db_arch += "- **No Encryption at Rest**: Data isolation via query filtering only\n"
db_arch += "- **Connection Pooling**: Shared Firestore connections\n\n"
write_doc("01-architecture/DATABASE_ARCHITECTURE.md", db_arch)

# STORAGE_ARCHITECTURE.md
storage = header("Storage Architecture", "STORAGE")
storage += section("1. Storage Layers")
storage += table(
    ["Layer", "Technology", "Purpose", "Evidence"],
    [
        ["Primary Database", "Firebase Firestore", "Structured data", "lib/firebase-admin.ts"],
        ["Cache", "Redis", "Session cache, rate limiting", "EDUPILOT_MASTER_FACTS.md"],
        ["Queue Backend", "Redis", "BullMQ job queues", "EDUPILOT_MASTER_FACTS.md"],
        ["File Storage", "Firebase Storage", "Documents, images", "EDUPILOT_MASTER_FACTS.md"],
    ]
)
storage += section("2. Caching Strategy")
storage += "| Data Type | Cache Strategy | TTL | Evidence |\n"
storage += "|-----------|----------------|-----|----------|\n"
storage += "| Session data | Redis | 5 days | lib/auth/auth-server.ts |\n"
storage += "| Feature flags | In-memory | App lifecycle | EDUPILOT_SAAS_CATALOG.md |\n"
storage += "| Permissions | In-memory | App lifecycle | EDUPILOT_SECURITY_CATALOG.md |\n"
storage += "| API responses | Redis | 5 minutes | EDUPILOT_MASTER_FACTS.md |\n\n"
write_doc("01-architecture/STORAGE_ARCHITECTURE.md", storage)

print("Architecture documents batch 4 created")
