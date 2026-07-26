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

def subsection(title):
    return f"### {title}\n\n"

def table(headers, rows):
    t = "| " + " | ".join(headers) + " |\n"
    t += "| " + " | ".join(["---"] * len(headers)) + " |\n"
    for row in rows:
        t += "| " + " | ".join(str(cell) for cell in row) + " |\n"
    t += "\n"
    return t

def mermaid(code):
    return f"```mermaid\n{code}\n```\n\n"

# REQUEST_LIFECYCLE.md
lifecycle = header("Request Lifecycle", "LIFE")
lifecycle += section("1. API Request Lifecycle")
lifecycle += mermaid("sequenceDiagram\n")
lifecycle += "    participant Client\n"
lifecycle += "    participant NextJS as Next.js Middleware\n"
lifecycle += "    participant Auth as withAuth\n"
lifecycle += "    participant Tenant as withTenant\n"
lifecycle += "    participant Perm as withPermission\n"
lifecycle += "    participant Route as Route Handler\n"
lifecycle += "    participant Service as Service Layer\n"
lifecycle += "    participant Repo as Repository\n"
lifecycle += "    participant DB as Firestore\n"
lifecycle += "    participant Events as EventBus\n"
lifecycle += "    Client->>NextJS: POST /api/v1/students\n"
lifecycle += "    NextJS->>Auth: Verify session cookie\n"
lifecycle += "    Auth->>Tenant: Extract tenantId\n"
lifecycle += "    Tenant->>Perm: Check permission 'students.create'\n"
lifecycle += "    Perm->>Route: Forward with context\n"
lifecycle += "    Route->>Service: createStudent(tenantId, data, userId)\n"
lifecycle += "    Service->>Repo: create(tenantId, data)\n"
lifecycle += "    Repo->>DB: Insert with tenantId\n"
lifecycle += "    DB-->>Repo: Created entity\n"
lifecycle += "    Repo-->>Service: StudentEntity\n"
lifecycle += "    Service->>Events: publish(STUDENT_CREATED, payload)\n"
lifecycle += "    Service-->>Route: StudentResponseDTO\n"
lifecycle += "    Route-->>Client: 201 Created\n"
lifecycle += "```\n\n"
lifecycle += section("2. Authentication Lifecycle")
lifecycle += mermaid("sequenceDiagram\n")
lifecycle += "    participant Client\n"
lifecycle += "    participant Login as Login Route\n"
lifecycle += "    participant Firebase as Firebase Admin\n"
lifecycle += "    participant Cookie as Session Cookie\n"
lifecycle += "    Client->>Login: POST /api/v1/auth/login\n"
lifecycle += "    Login->>Firebase: verifyPassword(email, password)\n"
lifecycle += "    Firebase-->>Login: User record\n"
lifecycle += "    Login->>Firebase: createSessionCookie(uid, expiresIn: 5d)\n"
lifecycle += "    Firebase-->>Login: Session cookie\n"
lifecycle += "    Login->>Cookie: Set-Cookie (HttpOnly, SameSite=Lax)\n"
lifecycle += "    Login-->>Client: { user, token }\n"
lifecycle += "```\n\n"
lifecycle += section("3. Event Lifecycle")
lifecycle += mermaid("sequenceDiagram\n")
lifecycle += "    participant Service\n"
lifecycle += "    participant EventBus\n"
lifecycle += "    participant Outbox\n"
lifecycle += "    participant Worker\n"
lifecycle += "    participant Subscribers\n"
lifecycle += "    Service->>EventBus: publish(eventType, payload)\n"
lifecycle += "    EventBus->>Outbox: enqueue(event)\n"
lifecycle += "    Note over Outbox: Event persisted durably\n"
lifecycle += "    Worker->>Outbox: poll()\n"
lifecycle += "    Worker->>Outbox: claim(eventId, subscriberId)\n"
lifecycle += "    Worker->>EventBus: dispatch(event)\n"
lifecycle += "    EventBus->>Subscribers: handle(event)\n"
lifecycle += "    Subscribers->>Subscribers: audit/notify/dashboard\n"
lifecycle += "```\n\n"
write_doc("01-architecture/REQUEST_LIFECYCLE.md", lifecycle)

# DEPENDENCY_GRAPH.md
dep_graph = header("Dependency Graph", "DEP")
dep_graph += section("1. Module Dependencies")
dep_graph += mermaid("graph TD\n")
dep_graph += "    Students --> Attendance\n"
dep_graph += "    Students --> Fees\n"
dep_graph += "    Students --> Parents\n"
dep_graph += "    Students --> Dashboard\n"
dep_graph += "    Staff --> Attendance\n"
dep_graph += "    Staff --> Timetable\n"
dep_graph += "    Staff --> Dashboard\n"
dep_graph += "    Attendance --> Dashboard\n"
dep_graph += "    Fees --> Dashboard\n"
dep_graph += "    Parents --> Dashboard\n"
dep_graph += "    Exams --> Dashboard\n"
dep_graph += "    Assignments --> Dashboard\n"
dep_graph += "    Homework --> Dashboard\n"
dep_graph += "    Dashboard --> Analytics\n"
dep_graph += "    All --> Events\n"
dep_graph += "    All --> Notifications\n"
dep_graph += "    All --> Audit\n"
dep_graph += "```\n\n"
dep_graph += section("2. Service Dependencies")
dep_graph += table(
    ["Service", "Depends On (Repositories)", "Depends On (Services)", "Evidence"],
    [
        ["StudentService", "StudentRepository", "AttendanceService, FeesService", "EDUPILOT_MASTER_FACTS.md"],
        ["StaffService", "StaffRepository", "AttendanceService", "EDUPILOT_MASTER_FACTS.md"],
        ["AttendanceService", "AttendanceRepository", "StudentRepository, StaffRepository", "EDUPILOT_MASTER_FACTS.md"],
        ["FeesService", "FeeRepository", "StudentRepository", "EDUPILOT_MASTER_FACTS.md"],
        ["DashboardService", "Multiple", "All domain services", "EDUPILOT_MASTER_FACTS.md"],
        ["AnalyticsService", "Multiple", "All domain services", "EDUPILOT_MASTER_FACTS.md"],
    ]
)
dep_graph += section("3. Critical Violations")
dep_graph += table(
    ["Violation", "Count", "Impact", "Evidence"],
    [
        ["Routes calling repositories directly", "~30", "Bypasses business logic", "EDUPILOT_IMPORT_GRAPH.md"],
        ["Routes calling adminDb directly", "14", "Bypasses repositories", "EDUPILOT_API_CATALOG.md"],
        ["Services calling adminDb directly", "6", "Bypasses repositories", "EDUPILOT_MASTER_FACTS.md"],
        ["Service-to-service imports", "Multiple", "Tight coupling", "EDUPILOT_MASTER_FACTS.md"],
    ]
)
write_doc("01-architecture/DEPENDENCY_GRAPH.md", dep_graph)

print("Architecture documents batch 2 created")
