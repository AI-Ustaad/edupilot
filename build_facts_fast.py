#!/usr/bin/env python3
import os
import re
import subprocess
from pathlib import Path

PROJECT_ROOT = Path("/Users/imranhaidersandhu/Documents/edupilot")
OUTPUT = PROJECT_ROOT / "EDUPILOT_MASTER_FACTS.md"

def run(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=PROJECT_ROOT).stdout.strip()

def count_glob(pattern):
    return len(list(PROJECT_ROOT.glob(pattern)))

def grep_count(pattern, path, exclude_dirs=True):
    cmd = f'grep -r "{pattern}" {path} --include="*.ts" -l'
    if exclude_dirs:
        cmd += " | grep -v node_modules | grep -v .kilo | wc -l"
    else:
        cmd += " | wc -l"
    result = run(cmd)
    try:
        return int(result)
    except ValueError:
        return 0

def grep_files(pattern, path):
    cmd = f'grep -r "{pattern}" {path} --include="*.ts" -l | grep -v node_modules | grep -v .kilo'
    return run(cmd).split('\n')

lines = []
lines.append("# EduPilot Master Facts - Engineering Source of Truth\n")
lines.append("**Document Version**: 1.0  ")
lines.append("**Date**: 2026-07-26  ")
lines.append("**Status**: Canonical Source of Truth  ")
lines.append("**Rule**: All future engineering decisions must be based exclusively on this document.\n")
lines.append("---\n")
lines.append("## Methodology\n")
lines.append("All facts derived from direct codebase inspection via file enumeration, grep, and file content inspection. No facts from memory, assumptions, or previous reports.\n")
lines.append("---\n")
lines.append("## Confidence Levels\n")
lines.append("- **VERIFIED**: Confirmed with direct code evidence")
lines.append("- **PARTIALLY VERIFIED**: Confirmed but incomplete")
lines.append("- **UNKNOWN**: Could not be verified\n")
lines.append("---\n")

# SECTION 1: ARCHITECTURE
lines.append("## SECTION 1: ARCHITECTURE\n")
lines.append("### 1.1 Project Overview\n")
lines.append("| Property | Value | Evidence |")
lines.append("|----------|-------|----------|")
lines.append("| Project Name | EduPilot | Directory name, package.json |")
lines.append("| Project Type | Enterprise Multi-Tenant AI Powered School Management SaaS | README.md |")
lines.append("| Framework | Next.js | package.json |")
lines.append("| Language | TypeScript | tsconfig.json |")
lines.append("| Database | Firebase Firestore | lib/firebase-admin.ts |")
lines.append("| Authentication | Firebase Admin Auth + Session Cookies | lib/auth/auth-server.ts |")
lines.append("| State Management | React Context + Hooks | context/AuthContext.tsx |")
lines.append("| UI Framework | React with TypeScript | app/ directory structure |\n")

lines.append("### 1.2 File Counts\n")
lines.append("| Metric | Count | Evidence |")
lines.append("|--------|-------|----------|")
lines.append(f"| API Routes | {count_glob('app/api/v1/**/route.ts')} | find app/api/v1 -name 'route.ts' |")
lines.append(f"| Protected Pages | {count_glob('app/(protected)/**/*')} | find app/(protected) -type f |")
lines.append(f"| Service Files | {count_glob('services/*.ts')} | find services -maxdepth 1 -name '*.ts' |")
lines.append(f"| Repository Files | {count_glob('repositories/*.ts')} | find repositories -maxdepth 1 -name '*.ts' |")
lines.append(f"| Interface Files | {count_glob('interfaces/*.ts')} | find interfaces -maxdepth 1 -name '*.ts' |")
lines.append(f"| Entity Files | {count_glob('entities/*.ts')} | find entities -maxdepth 1 -name '*.ts' |")
lines.append(f"| Document Files | {count_glob('documents/*.ts')} | find documents -maxdepth 1 -name '*.ts' |")
lines.append(f"| DTO Files | {count_glob('dto/*.ts')} | find dto -maxdepth 1 -name '*.ts' |")
lines.append(f"| Mapper Files | {count_glob('lib/mappers/*.ts')} | find lib/mappers -maxdepth 1 -name '*.ts' |")
lines.append(f"| Validator Files | {count_glob('validators/**/*.ts')} | find validators -name '*.ts' |")
lines.append(f"| Hook Files | {count_glob('hooks/*.ts')} | find hooks -name '*.ts' |")
lines.append(f"| Worker Files | {count_glob('lib/workers/*.ts')} | find lib/workers -name '*.ts' |")
lines.append(f"| Subscriber Files | {count_glob('lib/subscribers/*.ts')} | find lib/subscribers -name '*.ts' |")
lines.append(f"| Test Files | {count_glob('**/*.test.ts')} | find . -name '*.test.ts' |\n")

lines.append("### 1.3 Services with Interfaces\n")
lines.append("| Service | Interface | adminDb | eventBus | File |")
lines.append("|---------|-----------|---------|----------|------|")
for f in sorted(PROJECT_ROOT.glob("services/*.ts")):
    service = f.stem
    interface = "NONE"
    try:
        content = f.read_text()
        m = re.search(r'implements\s+(I[A-Za-z]+)', content)
        if m:
            interface = m.group(1)
    except Exception:
        pass
    admindb = "YES" if "adminDb" in content else "NO"
    eventbus = "YES" if "eventBus" in content else "NO"
    lines.append(f"| {service} | {interface} | {admindb} | {eventbus} | {f.name} |")

lines.append("\n### 1.4 Repositories with Interfaces\n")
lines.append("| Repository | Interface | BaseRepository | File |")
lines.append("|------------|-----------|----------------|------|")
for f in sorted(PROJECT_ROOT.glob("repositories/*.ts")):
    repo = f.stem
    interface = "NONE"
    base = "NO"
    try:
        content = f.read_text()
        m = re.search(r'implements\s+(I[A-Za-z]+)', content)
        if m:
            interface = m.group(1)
        if "extends BaseRepository" in content:
            base = "YES"
    except Exception:
        pass
    lines.append(f"| {repo} | {interface} | {base} | {f.name} |")

lines.append("\n### 1.5 Dead Implementations\n")
lines.append("| Name | Status | Evidence |")
lines.append("|------|--------|----------|")
lines.append("| BaseService | DEAD IMPLEMENTATION | services/base.service.ts exists, 0 services extend it |")
lines.append("| IOCRService | DEAD IMPLEMENTATION | interfaces/IOCRService.ts exists, 0 classes implement it |")
lines.append("| StudentResponseDTO | DEAD IMPLEMENTATION | Only in dto/StudentResponseDTO.ts and dto/index.ts |")
lines.append("| StaffResponseDTO | DEAD IMPLEMENTATION | Only in dto/StaffResponseDTO.ts and dto/index.ts |")
lines.append("| ParentResponseDTO | DEAD IMPLEMENTATION | Only in dto/ParentResponseDTO.ts and dto/index.ts |")
lines.append("| FeeResponseDTO | DEAD IMPLEMENTATION | Only in dto/FeeResponseDTO.ts and dto/index.ts |")
lines.append("| OCRRequestDTO | DEAD IMPLEMENTATION | Only in dto/OCRRequestDTO.ts and dto/index.ts |\n")

lines.append("### 1.6 Duplicate Implementations\n")
lines.append("| Name | Status | Evidence |")
lines.append("|------|--------|----------|")
lines.append("| job.service.ts | DUPLICATE | services/job.service.ts and lib/services/job.service.ts nearly identical |")
lines.append("| configuration.service.ts | DUPLICATE | services/configuration.service.ts and services/configuration.application.service.ts similar |\n")

# Write Part 1
OUTPUT.write_text('\n'.join(lines))
print(f"Part 1 complete: {len(lines)} lines written")
