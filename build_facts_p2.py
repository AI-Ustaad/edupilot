#!/usr/bin/env python3
import os
import re
from pathlib import Path

PROJECT_ROOT = Path("/Users/imranhaidersandhu/Documents/edupilot")
OUTPUT = PROJECT_ROOT / "EDUPILOT_MASTER_FACTS.md"

def count_glob(pattern):
    return len(list(PROJECT_ROOT.glob(pattern)))

def read_file(path):
    try:
        return Path(path).read_text()
    except Exception:
        return ""

lines = []

# SECTION 2: CORE CODEBASE INVENTORIES
lines.append("\n## SECTION 2: CORE CODEBASE INVENTORIES\n")

# 2.1 Entities
lines.append("### 2.1 Entities\n")
lines.append("| Entity Name | File | References |")
lines.append("|-------------|------|------------|")
for f in sorted(PROJECT_ROOT.glob("entities/*.ts")):
    content = read_file(f)
    count = content.count(f.stem)
    lines.append(f"| {f.stem} | {f.name} | {count} |")
lines.append("")

# 2.2 Documents
lines.append("### 2.2 Documents\n")
lines.append("| Document Name | File | References |")
lines.append("|---------------|------|------------|")
for f in sorted(PROJECT_ROOT.glob("documents/*.ts")):
    content = read_file(f)
    count = content.count(f.stem)
    lines.append(f"| {f.stem} | {f.name} | {count} |")
lines.append("")

# 2.3 DTOs
lines.append("### 2.3 DTOs\n")
lines.append("| DTO Name | File | References | Status |")
lines.append("|----------|------|------------|--------|")
for f in sorted(PROJECT_ROOT.glob("dto/*.ts")):
    content = read_file(f)
    count = content.count(f.stem)
    if count > 2:
        status = "VERIFIED"
    elif count == 2:
        status = "DEAD IMPLEMENTATION"
    else:
        status = "UNKNOWN"
    lines.append(f"| {f.stem} | {f.name} | {count} | {status} |")
lines.append("")

# 2.4 Mappers
lines.append("### 2.4 Mappers\n")
lines.append("| Mapper Name | File | References |")
lines.append("|-------------|------|------------|")
for f in sorted(PROJECT_ROOT.glob("lib/mappers/*.ts")):
    content = read_file(f)
    count = content.count(f.stem)
    lines.append(f"| {f.stem} | {f.name} | {count} |")
lines.append("")

# 2.5 Validators
lines.append("### 2.5 Validators\n")
lines.append("| Validator Name | File | References |")
lines.append("|----------------|------|------------|")
for f in sorted(PROJECT_ROOT.glob("validators/**/*.ts")):
    content = read_file(f)
    count = content.count(f.stem)
    lines.append(f"| {f.stem} | {f.name} | {count} |")
lines.append("")

# SECTION 3: API
lines.append("## SECTION 3: API\n")

# Count routes by auth/permission status
routes_with_auth = 0
routes_with_permission = 0
routes_with_adminDb = 0
no_auth_routes = []

for f in PROJECT_ROOT.glob("app/api/v1/**/route.ts"):
    content = read_file(f)
    if "withAuth" in content:
        routes_with_auth += 1
    else:
        no_auth_routes.append(str(f.relative_to(PROJECT_ROOT)))
    if "withPermission" in content:
        routes_with_permission += 1
    if "adminDb" in content:
        routes_with_adminDb += 1

lines.append("### 3.1 API Route Summary\n")
lines.append("| Metric | Count | Evidence |")
lines.append("|--------|-------|----------|")
lines.append(f"| Total Routes | {count_glob('app/api/v1/**/route.ts')} | find app/api/v1 -name 'route.ts' |")
lines.append(f"| Routes with withAuth | {routes_with_auth} | grep -r 'withAuth' app/api/v1 -l |")
lines.append(f"| Routes with withPermission | {routes_with_permission} | grep -r 'withPermission' app/api/v1 -l |")
lines.append(f"| Routes with adminDb | {routes_with_adminDb} | grep -r 'adminDb' app/api/v1 -l |")
lines.append(f"| Routes without auth | {len(no_auth_routes)} | See 3.2 |\n")

lines.append("### 3.2 Routes Without Authentication\n")
lines.append("| Route File | Has Auth Middleware |")
lines.append("|------------|---------------------|")
for route in sorted(no_auth_routes):
    lines.append(f"| {route} | NO |")
lines.append("")

# SECTION 4: SECURITY
lines.append("## SECTION 4: SECURITY\n")
lines.append("### 4.1 Authentication\n")
lines.append("| Component | Status | Evidence |")
lines.append("|-----------|--------|----------|")

auth_server = read_file("lib/auth/auth-server.ts")
if "createSessionCookie" in auth_server:
    lines.append("| Session Cookie Creation | VERIFIED | lib/auth/auth-server.ts |")
else:
    lines.append("| Session Cookie Creation | UNKNOWN | lib/auth/auth-server.ts |")

if "verifySessionCookie" in auth_server:
    lines.append("| Session Cookie Verification | VERIFIED | lib/auth/auth-server.ts |")
else:
    lines.append("| Session Cookie Verification | UNKNOWN | lib/auth/auth-server.ts |")

if "refreshToken" in read_file("lib/auth/auth-server.ts") or "refresh_token" in read_file("lib/auth/auth-server.ts"):
    lines.append("| Refresh Token | VERIFIED | lib/auth/auth-server.ts |")
else:
    lines.append("| Refresh Token | NOT FOUND | lib/auth/auth-server.ts |")

middleware = read_file("middleware.ts")
if "cookies.get" in middleware and "session" in middleware:
    lines.append("| Session Cookie Check | VERIFIED | middleware.ts |")
else:
    lines.append("| Session Cookie Check | UNKNOWN | middleware.ts |")

lines.append("\n### 4.2 RBAC\n")
lines.append("| Component | Status | Evidence |")
lines.append("|-----------|--------|----------|")

roles = read_file("lib/auth/roles.config.ts")
if "SUPER_ADMIN" in roles and "TEACHER" in roles:
    lines.append("| Role Definitions | VERIFIED | lib/auth/roles.config.ts |")
else:
    lines.append("| Role Definitions | UNKNOWN | lib/auth/roles.config.ts |")

permissions = read_file("lib/auth/permissions.ts")
perm_count = len(re.findall(r'[a-z]+:\s*\{', permissions))
lines.append(f"| Permission Domains | {perm_count} domains | lib/auth/permissions.ts |")

lines.append("\n### 4.3 Secrets Management\n")
lines.append("| Secret | Status | Evidence |")
lines.append("|--------|--------|----------|")

# Check for hardcoded secrets
cron_routes = list(PROJECT_ROOT.glob("app/api/v1/cron/*/route.ts")) + list(PROJECT_ROOT.glob("app/api/v1/jobs/*/route.ts"))
hardcoded_secrets = []
for route in cron_routes:
    content = read_file(route)
    if "|| " in content and "SECRET" in content.upper():
        hardcoded_secrets.append(route.name)

if hardcoded_secrets:
    lines.append(f"| Hardcoded Secrets | FOUND in {len(hardcoded_secrets)} files | {', '.join(hardcoded_secrets)} |")
else:
    lines.append("| Hardcoded Secrets | NOT FOUND | N/A |")

lines.append("")

# Append to master facts
with open(OUTPUT, "a") as f:
    f.write('\n'.join(lines))

print(f"Part 2 complete: appended {len(lines)} lines")
