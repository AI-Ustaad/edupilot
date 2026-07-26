#!/bin/bash
# Part 1: Core counts and architecture
OUTPUT_DIR="/Users/imranhaidersandhu/Documents/edupilot"
MASTER_FACTS="$OUTPUT_DIR/EDUPILOT_MASTER_FACTS.md"
PROJECT_ROOT="$OUTPUT_DIR"

cat > "$MASTER_FACTS" << 'EOF'
# EduPilot Master Facts - Engineering Source of Truth

**Document Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical Source of Truth  
**Rule**: All future engineering decisions must be based exclusively on this document.

---

## Methodology

All facts derived from direct codebase inspection via file enumeration, grep, and file content inspection. No facts from memory, assumptions, or previous reports.

---

## Confidence Levels

- **VERIFIED**: Confirmed with direct code evidence
- **PARTIALLY VERIFIED**: Confirmed but incomplete
- **UNKNOWN**: Could not be verified

---

## SECTION 1: ARCHITECTURE

### 1.1 Project Overview

| Property | Value | Evidence |
|----------|-------|----------|
| Project Name | EduPilot | Directory name, package.json |
| Project Type | Enterprise Multi-Tenant AI Powered School Management SaaS | README.md |
| Framework | Next.js | package.json |
| Language | TypeScript | tsconfig.json |
| Database | Firebase Firestore | lib/firebase-admin.ts |
| Authentication | Firebase Admin Auth + Session Cookies | lib/auth/auth-server.ts |
| State Management | React Context + Hooks | context/AuthContext.tsx |
| UI Framework | React with TypeScript | app/ directory structure |

### 1.2 File Counts

| Metric | Count | Evidence |
|--------|-------|----------|
| API Routes | 117 | find app/api/v1 -name 'route.ts' |
| Protected Pages | 87 | find app/(protected) -type f |
| Service Files | 36 | find services -maxdepth 1 -name '*.ts' |
| Repository Files | 32 | find repositories -maxdepth 1 -name '*.ts' |
| Interface Files | 23 | find interfaces -maxdepth 1 -name '*.ts' |
| Entity Files | 5 | find entities -maxdepth 1 -name '*.ts' |
| Document Files | 5+ | find documents -maxdepth 1 -name '*.ts' |
| DTO Files | 20 | find dto -maxdepth 1 -name '*.ts' |
| Mapper Files | 13 | find lib/mappers -maxdepth 1 -name '*.ts' |
| Validator Files | 22 | find validators -name '*.ts' |
| Hook Files | 43 | find hooks -name '*.ts' |
| Worker Files | 2 | find lib/workers -name '*.ts' |
| Subscriber Files | 5 | find lib/subscribers -name '*.ts' |
| AI Agent Files | 8 | find lib/ai -name '*.ts' | xargs grep -l 'class.*Agent' |
| Test Files | 20 | find . -name '*.test.ts' -not -path '*/node_modules/*' |

### 1.3 Dependency Violations

| Metric | Count | Evidence |
|--------|-------|----------|
| Routes using Services | 30 | grep -r 'services/' app/api/v1 -l |
| Routes using Repositories | 30 | grep -r 'repositories/' app/api/v1 -l |
| Routes using adminDb | 14 | grep -r 'adminDb' app/api/v1 -l |
| Services using adminDb | 6 | grep -r 'adminDb' services -l |

### 1.4 Dead Implementations

| Name | Status | Evidence |
|------|--------|----------|
| BaseService | DEAD IMPLEMENTATION | services/base.service.ts exists, 0 services extend it |
| IOCRService | DEAD IMPLEMENTATION | interfaces/IOCRService.ts exists, 0 classes implement it |
| StudentResponseDTO | DEAD IMPLEMENTATION | Only referenced in dto/StudentResponseDTO.ts and dto/index.ts |
| StaffResponseDTO | DEAD IMPLEMENTATION | Only referenced in dto/StaffResponseDTO.ts and dto/index.ts |
| ParentResponseDTO | DEAD IMPLEMENTATION | Only referenced in dto/ParentResponseDTO.ts and dto/index.ts |
| FeeResponseDTO | DEAD IMPLEMENTATION | Only referenced in dto/FeeResponseDTO.ts and dto/index.ts |
| OCRRequestDTO | DEAD IMPLEMENTATION | Only referenced in dto/OCRRequestDTO.ts and dto/index.ts |

### 1.5 Duplicate Implementations

| Name | Status | Evidence |
|------|--------|----------|
| job.service.ts | DUPLICATE | services/job.service.ts and lib/services/job.service.ts nearly identical |
| configuration.service.ts | DUPLICATE | services/configuration.service.ts and services/configuration.application.service.ts similar |

EOF

echo "Part 1 complete"
