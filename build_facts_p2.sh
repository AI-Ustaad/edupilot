#!/bin/bash
# Part 2: Core Codebase Inventories
OUTPUT_DIR="/Users/imranhaidersandhu/Documents/edupilot"
MASTER_FACTS="$OUTPUT_DIR/EDUPILOT_MASTER_FACTS.md"

cat >> "$MASTER_FACTS" << 'EOF'

## SECTION 2: CORE CODEBASE INVENTORIES

### 2.1 Services Inventory

| Service Name | Interface | adminDb | eventBus | File |
|--------------|-----------|---------|----------|------|
EOF

for f in services/*.ts; do
    [ -f "$f" ] || continue
    SERVICE=$(basename "$f" .ts)
    INTERFACE=$(grep -o 'implements I[A-Za-z]*' "$f" | head -1 | sed 's/implements //')
    [ -z "$INTERFACE" ] && INTERFACE="NONE"
    ADMINDB=$(grep -q 'adminDb' "$f" && echo "YES" || echo "NO")
    EVENTBUS=$(grep -q 'eventBus' "$f" && echo "YES" || echo "NO")
    echo "| $SERVICE | $INTERFACE | $ADMINDB | $EVENTBUS | $f |" >> "$MASTER_FACTS"
done

cat >> "$MASTER_FACTS" << 'EOF'

### 2.2 Repositories Inventory

| Repository Name | Interface | BaseRepository | File |
|-----------------|-----------|----------------|------|
EOF

for f in repositories/*.ts; do
    [ -f "$f" ] || continue
    REPO=$(basename "$f" .ts)
    INTERFACE=$(grep -o 'implements I[A-Za-z]*' "$f" | head -1 | sed 's/implements //')
    [ -z "$INTERFACE" ] && INTERFACE="NONE"
    BASE=$(grep -q 'extends BaseRepository' "$f" && echo "YES" || echo "NO")
    echo "| $REPO | $INTERFACE | $BASE | $f |" >> "$MASTER_FACTS"
done

cat >> "$MASTER_FACTS" << 'EOF'

### 2.3 Interfaces Inventory

| Interface Name | File | Implementations |
|----------------|------|-----------------|
EOF

for f in interfaces/*.ts; do
    [ -f "$f" ] || continue
    NAME=$(basename "$f" .ts)
    COUNT=$(grep -r "implements $NAME" . --include="*.ts" | grep -v node_modules | wc -l | tr -d ' ')
    echo "| $NAME | $f | $COUNT |" >> "$MASTER_FACTS"
done

cat >> "$MASTER_FACTS" << 'EOF'

### 2.4 Entities Inventory

| Entity Name | File | References |
|-------------|------|------------|
EOF

for f in entities/*.ts; do
    [ -f "$f" ] || continue
    NAME=$(basename "$f" .ts)
    COUNT=$(grep -r "$NAME" . --include="*.ts" | grep -v node_modules | grep -v ".kilo" | wc -l | tr -d ' ')
    echo "| $NAME | $f | $COUNT |" >> "$MASTER_FACTS"
done

cat >> "$MASTER_FACTS" << 'EOF'

### 2.5 Documents Inventory

| Document Name | File | References |
|---------------|------|------------|
EOF

for f in documents/*.ts; do
    [ -f "$f" ] || continue
    NAME=$(basename "$f" .ts)
    COUNT=$(grep -r "$NAME" . --include="*.ts" | grep -v node_modules | grep -v ".kilo" | wc -l | tr -d ' ')
    echo "| $NAME | $f | $COUNT |" >> "$MASTER_FACTS"
done

cat >> "$MASTER_FACTS" << 'EOF'

### 2.6 DTOs Inventory

| DTO Name | File | References | Status |
|----------|------|------------|--------|
EOF

for f in dto/*.ts; do
    [ -f "$f" ] || continue
    NAME=$(basename "$f" .ts)
    COUNT=$(grep -r "$NAME" . --include="*.ts" | grep -v node_modules | grep -v ".kilo" | wc -l | tr -d ' ')
    if [ "$COUNT" -gt 2 ]; then
        STATUS="VERIFIED"
    elif [ "$COUNT" -eq 2 ]; then
        STATUS="DEAD IMPLEMENTATION"
    else
        STATUS="UNKNOWN"
    fi
    echo "| $NAME | $f | $COUNT | $STATUS |" >> "$MASTER_FACTS"
done

cat >> "$MASTER_FACTS" << 'EOF'

### 2.7 Mappers Inventory

| Mapper Name | File | References |
|-------------|------|------------|
EOF

for f in lib/mappers/*.ts; do
    [ -f "$f" ] || continue
    NAME=$(basename "$f" .ts)
    COUNT=$(grep -r "$NAME" . --include="*.ts" | grep -v node_modules | grep -v ".kilo" | wc -l | tr -d ' ')
    echo "| $NAME | $f | $COUNT |" >> "$MASTER_FACTS"
done

echo "Part 2 complete"
