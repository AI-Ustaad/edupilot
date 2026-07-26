#!/usr/bin/env python3
import os
import re
from pathlib import Path

PROJECT_ROOT = Path("/Users/imranhaidersandhu/Documents/edupilot")
OUTPUT = PROJECT_ROOT / "EDUPILOT_MASTER_FACTS.md"

def read_file(path):
    try:
        return Path(path).read_text()
    except Exception:
        return ""

def count_glob(pattern):
    return len(list(PROJECT_ROOT.glob(pattern)))

lines = []

# Continue with more sections
lines.append("\n## SECTION 11: VALIDATION LAYER\n")
lines.append("### 11.1 Validators\n")
lines.append("| Validator | File | Used By Services |")
lines.append("|-----------|------|------------------|")
for f in sorted(PROJECT_ROOT.glob("validators/**/*.ts")):
    content = read_file(f)
    # Count imports from services
    imports = len(re.findall(r'from\s+["\']@/validators', content))
    lines.append(f"| {f.stem} | {f} | {imports} |")

lines.append("\n## SECTION 12: ERROR & RESPONSE LAYERS\n")
lines.append("### 12.1 Error Classes\n")
lines.append("| Error Class | File |")
lines.append("|-------------|------|")
errors_content = read_file("lib/errors/AppError.ts")
error_classes = re.findall(r'class\s+(\w+Error)', errors_content)
for err in error_classes:
    lines.append(f"| {err} | lib/errors/AppError.ts |")

lines.append("\n### 12.2 Response Helpers\n")
lines.append("| Helper | File |")
lines.append("|--------|------|")
response_content = read_file("lib/api/response.ts")
response_helpers = re.findall(r'export\s+(?:async\s+)?function\s+(\w+)', response_content)
for helper in response_helpers:
    lines.append(f"| {helper} | lib/api/response.ts |")

lines.append("\n## SECTION 13: MIDDLEWARE\n")
lines.append("| Middleware | File | Used By Routes |")
lines.append("|------------|------|----------------|")
middleware_files = list(PROJECT_ROOT.glob("route-helpers/*.ts")) + list(PROJECT_ROOT.glob("middleware.ts"))
for m in middleware_files:
    if m.is_file():
        content = read_file(m)
        usage = content.count("export") 
        lines.append(f"| {m.stem} | {m} | {usage} exports |")

lines.append("\n## SECTION 14: HOOKS\n")
lines.append("| Hook Name | File | References |")
lines.append("|-----------|------|------------|")
for f in sorted(PROJECT_ROOT.glob("hooks/*.ts")):
    content = read_file(f)
    count = content.count(f.stem)
    lines.append(f"| {f.stem} | {f.name} | {count} |")

lines.append("\n## SECTION 15: CONTEXTS & PROVIDERS\n")
lines.append("| Context/Provider | File |")
lines.append("|------------------|------|")
for f in sorted(PROJECT_ROOT.glob("context/*.tsx")) + sorted(PROJECT_ROOT.glob("providers/*.tsx")):
    lines.append(f"| {f.stem} | {f} |")

lines.append("\n---\n")
lines.append("## Document Control\n")
lines.append(f"| Property | Value |")
lines.append(f"|----------|-------|")
lines.append(f"| Generated | {Path(__file__).stat().st_mtime} |")
lines.append(f"| Tool | Python enumeration script |")
lines.append(f"| Scope | Full codebase |")
lines.append(f"| Total Lines | {len(OUTPUT.read_text().split(chr(10)))} |")

# Append
with open(OUTPUT, "a") as f:
    f.write('\n'.join(lines))

print(f"Final part complete: appended {len(lines)} lines")
print(f"Total document: {len(OUTPUT.read_text().split(chr(10)))} lines")
