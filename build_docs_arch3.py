#!/usr/bin/env python3
"""Generate remaining architecture and start engineering documents"""
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

# SERVICE_BOUNDARIES.md
service_boundaries = header("Service Boundaries", "SB")
service_boundaries += section("1. Service Layer Definition")
service_boundaries += "The service layer contains all business logic. Services must not directly access Firestore or call repositories from other services.\n\n"
service_boundaries += section("2. Service Contracts")
service_boundaries += table(
    ["Service", "Interface", "Parameters", "Returns", "Evidence"],
    [
        ["StudentService", "IStudentService", "(tenantId, id, data, userId)", "StudentResponseDTO", "EDUPILOT_MASTER_FACTS.md"],
        ["StaffService", "IStaffService", "(tenantId, id, data, userId)", "StaffResponseDTO", "EDUPILOT_MASTER_FACTS.md"],
        ["AttendanceService", "IAttendanceService", "(tenantId, id, data, userId)", "AttendanceResponseDTO", "EDUPILOT_MASTER_FACTS.md"],
        ["FeesService", "IFeesService", "(tenantId, id, data, userId)", "FeeResponseDTO", "EDUPILOT_MASTER_FACTS.md"],
        ["ParentService", "IParentService", "(tenantId, id, data, userId)", "ParentResponseDTO", "EDUPILOT_MASTER_FACTS.md"],
    ]
)
service_boundaries += section("3. Violations")
service_boundaries += "| Service | Violation | Evidence |\n"
service_boundaries += "|---------|-----------|----------|\n"
service_boundaries += "| SubscriptionService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |\n"
service_boundaries += "| FeatureFlagService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |\n"
service_boundaries += "| JobService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |\n"
service_boundaries += "| TelemetryService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |\n"
service_boundaries += "| AnalyticsService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |\n"
service_boundaries += "| AuditService | Calls adminDb directly | EDUPILOT_MASTER_FACTS.md |\n"
write_doc("01-architecture/SERVICE_BOUNDARIES.md", service_boundaries)

# PACKAGE_STRUCTURE.md
package = header("Package Structure", "PKG")
package += section("1. Directory Layout")
package += "```\n"
package += "app/\n"
package += "  api/v1/                    # 117 API routes\n"
package += "    students/\n"
package += "    staff/\n"
package += "    attendance/\n"
package += "    ...\n"
package += "  (protected)/               # 87 protected pages\n"
package += "    dashboard/\n"
package += "    students/\n"
package += "    ...\n"
package += "\n"
package += "services/                    # 36 service files\n"
package += "  StudentService.ts\n"
package += "  StaffService.ts\n"
package += "  ...\n"
package += "\n"
package += "repositories/                # 32 repository files\n"
package += "  student.repository.ts\n"
package += "  staff.repository.ts\n"
package += "  ...\n"
package += "\n"
package += "interfaces/                  # 23 interface files\n"
package += "  IStudentService.ts\n"
package += "  IStudentRepository.ts\n"
package += "  ...\n"
package += "\n"
package += "entities/                    # 5 entity files\n"
package += "documents/                   # 5+ document files\n"
package += "dto/                         # 20 DTO files\n"
package += "lib/mappers/                 # 13 mapper files\n"
package += "validators/                  # 22 validator files\n"
package += "hooks/                       # 43 hook files\n"
package += "lib/events/                  # Event bus, types, outbox\n"
package += "lib/subscribers/             # 5 subscriber files\n"
package += "lib/workers/                 # 2 worker files\n"
package += "lib/ai/                      # AI providers, strategies, prompts\n"
package += "route-helpers/               # Middleware functions\n"
package += "context/                     # React contexts\n"
package += "components/                  # Shared UI components\n"
package += "```\n\n"
package += section("2. Layer Separation Rules")
package += "| Rule | Description | Status |\n"
package += "|------|-------------|--------|\n"
package += "| Routes → Services | All business logic in services | ⚠️ Partial — 30 routes bypass |\n"
package += "| Services → Repositories | All data access via repositories | ⚠️ Partial — 6 services use adminDb |\n"
package += "| Repositories → Firestore | All DB access via repositories | ✅ Enforced |\n"
package += "| No service-to-service | Services must not import services | ⚠️ Violated |\n"
package += "| No repository-to-service | Repositories must not import services | ✅ Enforced |\n\n"
write_doc("01-architecture/PACKAGE_STRUCTURE.md", package)

print("Architecture documents batch 3 created")
