#!/usr/bin/env python3
"""Generate 07-ai, 08-memory documents and master README"""
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

# 07-ai documents
ai_docs = {
    "07-ai/AI_SYSTEM.md": header("AI System", "AISYS") + section("Overview") + "EduPilot AI uses Google Gemini with strategy pattern.\n\n" + section("Components") + table(
        ["Component", "File", "Purpose"],
        [
            ["AIGateway", "lib/ai/gateway/AIGateway.ts", "Main orchestrator"],
            ["GeminiProvider", "lib/ai/providers/GeminiProvider.ts", "LLM provider"],
            ["UsageTracker", "lib/ai/monitoring/UsageTracker.ts", "Usage tracking"],
            ["PromptGuard", "lib/ai/prompt-guard.ts", "Content moderation"],
        ]
    ) + "\n",
    "07-ai/PROMPT_ENGINEERING.md": header("Prompt Engineering", "PROMPT") + section("Templates") + "Prompt templates exist in lib/ai/prompts/\n\n",
    "07-ai/AI_AGENTS.md": header("AI Agents", "AIAGENTS") + section("Agents") + table(
        ["Agent", "File", "Purpose"],
        [
            ["TeacherAgent", "lib/ai/strategies/TeacherAgent.ts", "Teacher operations"],
            ["HRAgent", "lib/ai/strategies/HRAgent.ts", "HR operations"],
            ["FinanceAgent", "lib/ai/strategies/FinanceAgent.ts", "Financial analysis"],
            ["StudentAgent", "lib/ai/strategies/StudentAgent.ts", "Student support"],
            ["PrincipalAgent", "lib/ai/strategies/PrincipalAgent.ts", "Principal dashboard"],
            ["ParentAgent", "lib/ai/strategies/ParentAgent.ts", "Parent communication"],
            ["AdmissionAgent", "lib/ai/strategies/AdmissionAgent.ts", "Admissions"],
            ["StaffStrategy", "lib/ai/strategies/StaffStrategy.ts", "Staff management"],
        ]
    ) + "\n",
    "07-ai/MODEL_SELECTION.md": header("Model Selection", "MODEL") + section("Current Model") + table(
        ["Property", "Value", "Evidence"],
        [
            ["Provider", "Google Gemini", "EDUPILOT_AI_CATALOG.md"],
            ["Model", "gemini-2.5-flash", "lib/ai/providers/GeminiProvider.ts"],
            ["Fallback", "None", "Missing"],
        ]
    ) + "\n",
    "07-ai/RAG.md": header("RAG", "RAG") + section("Current Status") + "No RAG implementation found.\n\n",
    "07-ai/SAFETY.md": header("AI Safety", "SAFETY") + section("Current Controls") + table(
        ["Control", "Status", "Evidence"],
        [
            ["Content moderation", "Prompt guard", "lib/ai/prompt-guard.ts"],
            ["Usage limits", "Per-tenant quotas", "EDUPILOT_SAAS_CATALOG.md"],
            ["Input validation", "Zod schemas", "EDUPILOT_MASTER_FACTS.md"],
            ["Fallback provider", "Missing", "UNKNOWN"],
        ]
    ) + "\n",
}

for path, content in ai_docs.items():
    write_doc(path, content)

# 08-memory documents
mem_docs = {
    "08-memory/MEMORY.md": header("Project Memory", "MEM") + section("Current State") + "All facts derived from EDUPILOT_MASTER_FACTS.md.\n\n",
    "08-memory/ARCHITECTURAL_DECISIONS.md": header("Architectural Decisions", "AD") + section("Decisions") + "See 00-governance/DECISION_LOG.md\n\n",
    "08-memory/KNOWN_LIMITATIONS.md": header("Known Limitations", "LIM") + section("Current Limitations") + table(
        ["Limitation", "Impact", "Planned Fix"],
        [
            ["No refresh tokens", "5-day session limit", "Q4 2026"],
            ["No MFA", "Weak auth", "Q1 2027"],
            ["No event persistence", "Events lost on restart", "Q1 2027"],
            ["No integration tests", "Undetected regressions", "Q1 2027"],
            ["No monitoring", "No observability", "Q4 2027"],
        ]
    ) + "\n",
    "08-memory/FUTURE_IMPROVEMENTS.md": header("Future Improvements", "FUTURE") + section("Planned") + table(
        ["Improvement", "Priority", "Timeline"],
        [
            ["Refresh token implementation", "HIGH", "Q4 2026"],
            ["Integration test suite", "HIGH", "Q1 2027"],
            ["E2E test suite", "HIGH", "Q1 2027"],
            ["Monitoring and observability", "HIGH", "Q4 2027"],
            ["AI fallback provider", "MEDIUM", "Q1 2027"],
            ["Event replay capability", "MEDIUM", "Q2 2027"],
        ]
    ) + "\n",
}

for path, content in mem_docs.items():
    write_doc(path, content)

print("AI and Memory documents created")
