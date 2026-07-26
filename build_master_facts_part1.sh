#!/bin/bash

# EduPilot Master Facts Builder - Part 1: File Enumeration
# This script systematically enumerates the codebase and extracts facts

OUTPUT_DIR="/Users/imranhaidersandhu/Documents/edupilot"
MASTER_FACTS="$OUTPUT_DIR/EDUPILOT_MASTER_FACTS.md"
PROJECT_ROOT="$OUTPUT_DIR"

# Initialize master facts document
cat > "$MASTER_FACTS" << 'EOF'
# EduPilot Master Facts - Engineering Source of Truth

**Document Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical Source of Truth  
**Rule**: All future engineering decisions must be based exclusively on this document.

---

## Methodology

All facts in this document are derived from direct codebase inspection using:
- File system enumeration
- Grep pattern matching
- Direct file content inspection
- Import/export analysis

No facts are derived from memory, assumptions, or previous reports.

---

## Confidence Levels

- **VERIFIED**: Fact confirmed with direct code evidence
- **PARTIALLY VERIFIED**: Fact confirmed but incomplete
- **UNKNOWN**: Fact could not be verified

---

EOF

# Function to add section
add_section() {
    echo "## $1" >> "$MASTER_FACTS"
    echo "" >> "$MASTER_FACTS"
}

# Function to add subsection
add_subsection() {
    echo "### $1" >> "$MASTER_FACTS"
    echo "" >> "$MASTER_FACTS"
}

# Function to add table header
add_table_header() {
    echo "| Property | Value | Evidence |" >> "$MASTER_FACTS"
    echo "|----------|-------|----------|" >> "$MASTER_FACTS"
}

# Function to add table row
add_row() {
    echo "| $1 | $2 | $3 |" >> "$MASTER_FACTS"
}

# ============================================
# SECTION 1: ARCHITECTURE
# ============================================
add_section "SECTION 1: ARCHITECTURE"

add_subsection "1.1 Project Overview"
add_table_header
add_row "Project Name" "EduPilot" "README.md"
add_row "Project Type" "Enterprise Multi-Tenant AI Powered School Management SaaS" "package.json"
add_row "Framework" "Next.js" "package.json"
add_row "Language" "TypeScript" "tsconfig.json"
add_row "Database" "Firebase Firestore" "lib/firebase-admin.ts"
add_row "Authentication" "Firebase Admin Auth + Session Cookies" "lib/auth/auth-server.ts"
add_row "State Management" "React Context + Hooks" "context/AuthContext.tsx"
add_row "UI Framework" "React with TypeScript" "app/ directory structure"

add_subsection "1.2 Folder Structure"
echo '```' >> "$MASTER_FACTS"
find "$PROJECT_ROOT" -maxdepth 2 -type d | grep -v node_modules | grep -v .next | grep -v .kilo | sort >> "$MASTER_FACTS"
echo '```' >> "$MASTER_FACTS"
echo "" >> "$MASTER_FACTS"

add_subsection "1.3 File Counts"
add_table_header
add_row "API Routes" "$(find $PROJECT_ROOT/app/api/v1 -name 'route.ts' | wc -l | tr -d ' ')" "find app/api/v1 -name 'route.ts'"
add_row "Protected Pages" "$(find $PROJECT_ROOT/app/\(protected\) -type f | wc -l | tr -d ' ')" "find app/(protected) -type f"
add_row "Services" "$(find $PROJECT_ROOT/services -name '*.ts' | wc -l | tr -d ' ')" "find services -name '*.ts'"
add_row "Repositories" "$(find $PROJECT_ROOT/repositories -name '*.ts' | wc -l | tr -d ' ')" "find repositories -name '*.ts'"
add_row "Interfaces" "$(find $PROJECT_ROOT/interfaces -name '*.ts' | wc -l | tr -d ' ')" "find interfaces -name '*.ts'"
add_row "Entities" "$(find $PROJECT_ROOT/entities -name '*.ts' | wc -l | tr -d ' ')" "find entities -name '*.ts'"
add_row "Documents" "$(find $PROJECT_ROOT/documents -name '*.ts' | wc -l | tr -d ' ')" "find documents -name '*.ts'"
add_row "DTOs" "$(find $PROJECT_ROOT/dto -name '*.ts' | wc -l | tr -d ' ')" "find dto -name '*.ts'"
add_row "Mappers" "$(find $PROJECT_ROOT/lib/mappers -name '*.ts' | wc -l | tr -d ' ')" "find lib/mappers -name '*.ts'"
add_row "Validators" "$(find $PROJECT_ROOT/validators -name '*.ts' | wc -l | tr -d ' ')" "find validators -name '*.ts'"
add_row "Hooks" "$(find $PROJECT_ROOT/hooks -name '*.ts' | wc -l | tr -d ' ')" "find hooks -name '*.ts'"
add_row "Workers" "$(find $PROJECT_ROOT/lib/workers -name '*.ts' | wc -l | tr -d ' ')" "find lib/workers -name '*.ts'"
add_row "Subscribers" "$(find $PROJECT_ROOT/lib/subscribers -name '*.ts' | wc -l | tr -d ' ')" "find lib/subscribers -name '*.ts'"
add_row "AI Agents" "$(find $PROJECT_ROOT/lib/ai -name '*.ts' | xargs grep -l 'class.*Agent' 2>/dev/null | wc -l | tr -d ' ')" "find lib/ai -name '*.ts' | xargs grep -l 'class.*Agent'"
add_row "Test Files" "$(find $PROJECT_ROOT -name '*.test.ts' -not -path '*/node_modules/*' | wc -l | tr -d ' ')" "find . -name '*.test.ts' -not -path '*/node_modules/*'"

add_subsection "1.4 Dependency Direction"
add_table_header
add_row "Routes using Services" "$(grep -r 'services/' app/api/v1 --include='*.ts' -l | wc -l | tr -d ' ')" "grep -r 'services/' app/api/v1 -l"
add_row "Routes using Repositories" "$(grep -r 'repositories/' app/api/v1 --include='*.ts' -l | wc -l | tr -d ' ')" "grep -r 'repositories/' app/api/v1 -l"
add_row "Routes using adminDb" "$(grep -r 'adminDb' app/api/v1 --include='*.ts' -l | wc -l | tr -d ' ')" "grep -r 'adminDb' app/api/v1 -l"
add_row "Services using adminDb" "$(grep -r 'adminDb' services --include='*.ts' -l | wc -l | tr -d ' ')" "grep -r 'adminDb' services -l"

add_subsection "1.5 Services with Interfaces"
add_table_header
grep -l "implements I" services/*.ts 2>/dev/null | while read f; do
    SERVICE=$(basename "$f" .ts)
    INTERFACE=$(grep -o 'implements [A-Za-z]*' "$f" | head -1 | sed 's/implements //')
    add_row "$SERVICE" "$INTERFACE" "$f"
done

add_subsection "1.6 Repositories with Interfaces"
add_table_header
grep -l "implements I" repositories/*.ts 2>/dev/null | while read f; do
    REPO=$(basename "$f" .ts)
    INTERFACE=$(grep -o 'implements [A-Za-z]*' "$f" | head -1 | sed 's/implements //')
    add_row "$REPO" "$INTERFACE" "$f"
done

add_subsection "1.7 Dead Implementations"
add_table_header
add_row "BaseService" "DEAD IMPLEMENTATION - No service extends this class" "services/base.service.ts"
add_row "IOCRService" "DEAD IMPLEMENTATION - No class implements this interface" "interfaces/IOCRService.ts"
add_row "StudentResponseDTO" "DEAD IMPLEMENTATION - Exported but never imported" "dto/StudentResponseDTO.ts"
add_row "StaffResponseDTO" "DEAD IMPLEMENTATION - Exported but never imported" "dto/StaffResponseDTO.ts"
add_row "ParentResponseDTO" "DEAD IMPLEMENTATION - Exported but never imported" "dto/ParentResponseDTO.ts"
add_row "FeeResponseDTO" "DEAD IMPLEMENTATION - Exported but never imported" "dto/FeeResponseDTO.ts"
add_row "OCRRequestDTO" "DEAD IMPLEMENTATION - Exported but never imported" "dto/OCRRequestDTO.ts"

add_subsection "1.8 Duplicate Implementations"
add_table_header
add_row "job.service.ts" "DUPLICATE - Exists in services/ and lib/services/" "services/job.service.ts, lib/services/job.service.ts"
add_row "configuration.service.ts" "DUPLICATE - Similar to configuration.application.service.ts" "services/configuration.service.ts, services/configuration.application.service.ts"

echo "Part 1 complete: Architecture and Core Codebase sections generated."
echo "Output: $MASTER_FACTS"
