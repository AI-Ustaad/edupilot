#!/bin/bash

# EduPilot Master Facts Builder - Part 2: Services, Repositories, API Routes
# This script appends detailed facts to EDUPILOT_MASTER_FACTS.md

OUTPUT_DIR="/Users/imranhaidersandhu/Documents/edupilot"
MASTER_FACTS="$OUTPUT_DIR/EDUPILOT_MASTER_FACTS.md"
PROJECT_ROOT="$OUTPUT_DIR"

# ============================================
# SECTION 2: CORE CODEBASE - SERVICES
# ============================================
cat >> "$MASTER_FACTS" << 'EOF'

---

## SECTION 2: CORE CODEBASE

### 2.1 Services Inventory

EOF

# Enumerate all services
find "$PROJECT_ROOT/services" -maxdepth 1 -name "*.ts" -type f | sort | while read f; do
    SERVICE_NAME=$(basename "$f" .ts)
    echo "#### $SERVICE_NAME" >> "$MASTER_FACTS"
    echo "" >> "$MASTER_FACTS"
    echo "| Property | Value | Evidence |" >> "$MASTER_FACTS"
    echo "|----------|-------|----------|" >> "$MASTER_FACTS"
    
    # Check if implements interface
    IMPLEMENTS=$(grep -o 'implements I[A-Za-z]*' "$f" | head -1 | sed 's/implements //')
    if [ -n "$IMPLEMENTS" ]; then
        add_row "Interface" "$IMPLEMENTS" "$f"
    else
        add_row "Interface" "NONE" "$f"
    fi
    
    # Check for adminDb usage
    if grep -q 'adminDb' "$f"; then
        add_row "Direct adminDb" "YES - VIOLATION" "$f"
    else
        add_row "Direct adminDb" "NO" "$f"
    fi
    
    # Check for eventBus usage
    if grep -q 'eventBus' "$f"; then
        add_row "EventBus Usage" "YES" "$f"
    else
        add_row "EventBus Usage" "NO" "$f"
    fi
    
    # Repository usage
    REPOS=$(grep -o 'private [a-zA-Z]*Repository' "$f" | sed 's/private //' | sed 's/Repository//' | tr '\n' ', ' | sed 's/, $//')
    if [ -n "$REPOS" ]; then
        add_row "Repositories" "$REPOS" "$f"
    else
        add_row "Repositories" "NONE" "$f"
    fi
    
    # File path
    add_row "File" "$f" "$f"
    
    echo "" >> "$MASTER_FACTS"
done

# ============================================
# SECTION 2: CORE CODEBASE - REPOSITORIES
# ============================================
cat >> "$MASTER_FACTS" << 'EOF'

### 2.2 Repositories Inventory

EOF

find "$PROJECT_ROOT/repositories" -maxdepth 1 -name "*.ts" -type f | sort | while read f; do
    REPO_NAME=$(basename "$f" .ts)
    echo "#### $REPO_NAME" >> "$MASTER_FACTS"
    echo "" >> "$MASTER_FACTS"
    echo "| Property | Value | Evidence |" >> "$MASTER_FACTS"
    echo "|----------|-------|----------|" >> "$MASTER_FACTS"
    
    # Check if implements interface
    IMPLEMENTS=$(grep -o 'implements I[A-Za-z]*' "$f" | head -1 | sed 's/implements //')
    if [ -n "$IMPLEMENTS" ]; then
        add_row "Interface" "$IMPLEMENTS" "$f"
    else
        add_row "Interface" "NONE" "$f"
    fi
    
    # Check if extends BaseRepository
    if grep -q 'extends BaseRepository' "$f"; then
        add_row "Extends BaseRepository" "YES" "$f"
    else
        add_row "Extends BaseRepository" "NO" "$f"
    fi
    
    # Check for adminDb usage
    if grep -q 'adminDb' "$f"; then
        add_row "Direct adminDb" "YES" "$f"
    else
        add_row "Direct adminDb" "NO" "$f"
    fi
    
    # File path
    add_row "File" "$f" "$f"
    
    echo "" >> "$MASTER_FACTS"
done

# ============================================
# SECTION 2: CORE CODEBASE - INTERFACES
# ============================================
cat >> "$MASTER_FACTS" << 'EOF'

### 2.3 Interfaces Inventory

EOF

find "$PROJECT_ROOT/interfaces" -maxdepth 1 -name "*.ts" -type f | sort | while read f; do
    INTERFACE_NAME=$(basename "$f" .ts)
    echo "- **$INTERFACE_NAME**: \`$f\`" >> "$MASTER_FACTS"
done

echo "" >> "$MASTER_FACTS"

# ============================================
# SECTION 2: CORE CODEBASE - ENTITIES
# ============================================
cat >> "$MASTER_FACTS" << 'EOF'

### 2.4 Entities Inventory

EOF

find "$PROJECT_ROOT/entities" -maxdepth 1 -name "*.ts" -type f | sort | while read f; do
    ENTITY_NAME=$(basename "$f" .ts)
    echo "- **$ENTITY_NAME**: \`$f\`" >> "$MASTER_FACTS"
done

echo "" >> "$MASTER_FACTS"

# ============================================
# SECTION 2: CORE CODEBASE - DOCUMENTS
# ============================================
cat >> "$MASTER_FACTS" << 'EOF'

### 2.5 Documents Inventory

EOF

find "$PROJECT_ROOT/documents" -maxdepth 1 -name "*.ts" -type f | sort | while read f; do
    DOC_NAME=$(basename "$f" .ts)
    echo "- **$DOC_NAME**: \`$f\`" >> "$MASTER_FACTS"
done

echo "" >> "$MASTER_FACTS"

# ============================================
# SECTION 2: CORE CODEBASE - DTOS
# ============================================
cat >> "$MASTER_FACTS" << 'EOF'

### 2.6 DTOs Inventory

EOF

find "$PROJECT_ROOT/dto" -maxdepth 1 -name "*.ts" -type f | sort | while read f; do
    DTO_NAME=$(basename "$f" .ts)
    echo "- **$DTO_NAME**: \`$f\`" >> "$MASTER_FACTS"
done

echo "" >> "$MASTER_FACTS"

# ============================================
# SECTION 2: CORE CODEBASE - MAPPERS
# ============================================
cat >> "$MASTER_FACTS" << 'EOF'

### 2.7 Mappers Inventory

EOF

find "$PROJECT_ROOT/lib/mappers" -maxdepth 1 -name "*.ts" -type f | sort | while read f; do
    MAPPER_NAME=$(basename "$f" .ts)
    echo "- **$MAPPER_NAME**: \`$f\`" >> "$MASTER_FACTS"
done

echo "" >> "$MASTER_FACTS"

echo "Part 2 complete: Services, Repositories, and Core Codebase sections generated."
