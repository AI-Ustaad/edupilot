#!/usr/bin/env python3
"""Generate 01-architecture documents"""
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

def cross_ref(doc):
    return f"See: [{doc}](../{doc})"

# ARCHITECTURE.md
arch = header("Architecture Overview", "ARCH")
arch += section("1. Architecture Pattern")
arch += "EduPilot follows a **layered architecture** with the following layers:\n\n"
arch += "```\n"
arch += "Routes (API/Pages)\n"
arch += "  ↓\n"
arch += "Middleware (Auth, Tenant, Permission, Error)\n"
arch += "  ↓\n"
arch += "Services (Business Logic)\n"
arch += "  ↓\n"
arch += "Repositories (Data Access)\n"
arch += "  ↓\n"
arch += "Firebase Firestore (Database)\n"
arch += "```\n\n"
arch += section("2. Current State")
arch += table(
    ["Layer", "Status", "Coverage", "Evidence"],
    [
        ["Routes", "✅ Implemented", "117 API routes", "EDUPILOT_MASTER_FACTS.md"],
        ["Middleware", "✅ Implemented", "withAuth, withPermission, withTenant", "EDUPILOT_SECURITY_CATALOG.md"],
        ["Services", "⚠️ Partial", "7/36 with interfaces", "EDUPILOT_MASTER_FACTS.md"],
        ["Repositories", "⚠️ Partial", "14/32 with interfaces", "EDUPILOT_MASTER_FACTS.md"],
        ["Entities", "⚠️ Partial", "5 entities", "EDUPILOT_MASTER_FACTS.md"],
        ["DTOs", "⚠️ Partial", "20 DTOs", "EDUPILOT_MASTER_FACTS.md"],
        ["Mappers", "⚠️ Partial", "13 mappers", "EDUPILOT_MASTER_FACTS.md"],
    ]
)
arch += section("3. Architecture Violations")
arch += table(
    ["Violation", "Count", "Severity", "Evidence"],
    [
        ["Routes bypassing services", "~30", "HIGH", "EDUPILOT_MASTER_FACTS.md"],
        ["Routes using adminDb directly", "14", "HIGH", "EDUPILOT_API_CATALOG.md"],
        ["Services using adminDb directly", "6", "HIGH", "EDUPILOT_MASTER_FACTS.md"],
        ["Dead implementations", "12+", "MEDIUM", "EDUPILOT_MASTER_FACTS.md"],
        ["Duplicate implementations", "2", "MEDIUM", "EDUPILOT_MASTER_FACTS.md"],
    ]
)
write_doc("01-architecture/ARCHITECTURE.md", arch)

# SYSTEM_OVERVIEW.md
system = header("System Overview", "SYS")
system += section("1. System Purpose")
system += "EduPilot is an Enterprise Multi-Tenant AI-Powered School Management SaaS platform built with Next.js, TypeScript, Firebase, and Gemini AI.\n\n"
system += section("2. Technology Stack")
system += table(
    ["Layer", "Technology", "Purpose", "Evidence"],
    [
        ["Frontend", "Next.js 14 + React", "UI framework", "package.json"],
        ["Language", "TypeScript", "Type safety", "tsconfig.json"],
        ["Database", "Firebase Firestore", "Primary data store", "lib/firebase-admin.ts"],
        ["Authentication", "Firebase Admin Auth", "User authentication", "lib/auth/auth-server.ts"],
        ["AI", "Google Gemini", "LLM provider", "EDUPILOT_AI_CATALOG.md"],
        ["Queue", "BullMQ + Redis", "Background jobs", "EDUPILOT_MASTER_FACTS.md"],
        ["Payments", "Stripe", "Billing", "EDUPILOT_SAAS_CATALOG.md"],
        ["Email", "Resend + SendGrid", "Transactional email", "EDUPILOT_SAAS_CATALOG.md"],
        ["SMS", "Twilio", "SMS notifications", "EDUPILOT_SAAS_CATALOG.md"],
        ["Real-time", "Pusher", "In-app notifications", "EDUPILOT_SAAS_CATALOG.md"],
        ["Push", "Firebase Cloud Messaging", "Mobile push", "EDUPILOT_SAAS_CATALOG.md"],
    ]
)
system += section("3. System Boundaries")
system += "```mermaid\n"
system += "graph TB\n"
system += "    subgraph \"Client Layer\"\n"
system += "        WEB[Web App - Next.js]\n"
system += "        MOBILE[Mobile - PWA]\n"
system += "    end\n"
system += "    subgraph \"API Layer\"\n"
system += "        ROUTES[117 API Routes]\n"
system += "        MIDDLEWARE[Auth/Tenant/Permission]\n"
system += "    end\n"
system += "    subgraph \"Service Layer\"\n"
system += "        SERVICES[36 Services]\n"
system += "        AI[AI Gateway]\n"
system += "        EVENTS[Event Bus]\n"
system += "    end\n"
system += "    subgraph \"Data Layer\"\n"
system += "        REPOS[32 Repositories]\n"
system += "        FIRESTORE[Firestore]\n"
system += "        REDIS[Redis]\n"
system += "    end\n"
system += "    WEB --> ROUTES\n"
system += "    MOBILE --> ROUTES\n"
system += "    ROUTES --> MIDDLEWARE\n"
system += "    MIDDLEWARE --> SERVICES\n"
system += "    SERVICES --> REPOS\n"
system += "    REPOS --> FIRESTORE\n"
system += "    SERVICES --> AI\n"
system += "    SERVICES --> EVENTS\n"
system += "    EVENTS --> REDIS\n"
system += "```\n\n"
write_doc("01-architecture/SYSTEM_OVERVIEW.md", system)

# DOMAIN_MODEL.md
domain = header("Domain Model", "DOMAIN")
domain += section("1. Domain Structure")
domain += "EduPilot is organized into the following bounded contexts:\n\n"
domain += table(
    ["Bounded Context", "Modules", "Core Entities", "Evidence"],
    [
        ["Academic", "Students, Staff, Attendance, Parents, Fees", "Student, Staff, Attendance, Fee, Parent", "EDUPILOT_MODULE_CATALOG.md"],
        ["Academics", "Exams, Assignments, Homework, Marks, Timetable", "Exam, Assignment, Homework, Mark, Timetable", "EDUPILOT_MODULE_CATALOG.md"],
        ["Communication", "Notices, Events, Messages, Blog, Video Lectures", "Notice, Event, Message, Blog, VideoLecture", "EDUPILOT_MODULE_CATALOG.md"],
        ["Infrastructure", "Library, Transport, Hostel", "Book, Bus, Route, Hostel, Room", "EDUPILOT_MODULE_CATALOG.md"],
        ["Platform", "Dashboard, Analytics, AI, Events, Notifications", "Dashboard metrics, Analytics, AI agents", "EDUPILOT_MODULE_CATALOG.md"],
        ["SaaS", "Tenants, Subscriptions, Billing, Feature Flags", "Tenant, Subscription, Plan, FeatureFlag", "EDUPILOT_SAAS_CATALOG.md"],
        ["Security", "Auth, RBAC, Sessions, Permissions", "User, Role, Permission, Session", "EDUPILOT_SECURITY_CATALOG.md"],
    ]
)
domain += section("2. Entity Relationships")
domain += "```mermaid\n"
domain += "erDiagram\n"
domain += "    TENANT ||--o{ STUDENT : has\n"
domain += "    TENANT ||--o{ STAFF : has\n"
domain += "    TENANT ||--o{ CLASS : has\n"
domain += "    STUDENT ||--o{ ATTENDANCE : has\n"
domain += "    STUDENT ||--o{ FEE : has\n"
domain += "    STUDENT ||--o{ MARK : has\n"
domain += "    STAFF ||--o{ ATTENDANCE : has\n"
domain += "    STAFF ||--o{ TIMETABLE : has\n"
domain += "    PARENT ||--o{ STUDENT : has\n"
domain += "    CLASS ||--o{ SUBJECT : has\n"
domain += "    CLASS ||--o{ TIMETABLE : has\n"
domain += "```\n\n"
write_doc("01-architecture/DOMAIN_MODEL.md", domain)

# DATA_FLOW.md
dataflow = header("Data Flow", "DATA")
dataflow += section("1. Request Flow")
dataflow += "```mermaid\n"
dataflow += "sequenceDiagram\n"
dataflow += "    participant C as Client\n"
dataflow += "    participant M as Middleware\n"
dataflow += "    participant R as Route Handler\n"
dataflow += "    participant S as Service\n"
dataflow += "    participant REP as Repository\n"
dataflow += "    participant DB as Firestore\n"
dataflow += "    C->>M: HTTP Request\n"
dataflow += "    M->>M: withAuth (verify session)\n"
dataflow += "    M->>M: withTenant (extract tenantId)\n"
dataflow += "    M->>M: withPermission (check permission)\n"
dataflow += "    M->>R: Forward request\n"
dataflow += "    R->>S: Service method(tenantId, id, data, userId)\n"
dataflow += "    S->>REP: Repository method(tenantId, ...)\n"
dataflow += "    REP->>DB: Query with tenantId filter\n"
dataflow += "    DB-->>REP: Data\n"
dataflow += "    REP-->>S: Entity\n"
dataflow += "    S-->>R: DTO\n"
dataflow += "    R-->>C: JSON Response\n"
dataflow += "```\n\n"
dataflow += section("2. Event Flow")
dataflow += "```mermaid\n"
dataflow += "sequenceDiagram\n"
dataflow += "    participant S as Service\n"
dataflow += "    participant EB as EventBus\n"
dataflow += "    participant OR as OutboxRepository\n"
dataflow += "    participant W as EventWorker\n"
dataflow += "    participant SUB as Subscribers\n"
dataflow += "    S->>EB: publish(eventType, payload)\n"
dataflow += "    EB->>OR: enqueue(event)\n"
dataflow += "    W->>OR: poll for events\n"
dataflow += "    W->>W: claim lease\n"
dataflow += "    W->>EB: dispatch(event)\n"
dataflow += "    EB->>SUB: handle(event)\n"
dataflow += "    SUB->>SUB: audit/notify/dashboard\n"
dataflow += "```\n\n"
write_doc("01-architecture/DATA_FLOW.md", dataflow)

print("Architecture documents batch 1 created")
