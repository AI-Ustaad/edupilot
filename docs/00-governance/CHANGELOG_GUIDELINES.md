# Changelog Guidelines

**Document ID**: EDU-CLG-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. Purpose

This document defines the standards for maintaining the EduPilot changelog. All changes must be documented for audit, compliance, and customer communication.

## 2. Format

```
## [VERSION] - YYYY-MM-DD

### Added
- Feature description

### Changed
- Change description

### Fixed
- Bug fix description

### Security
- Security fix description
```

## 3. Categories

| Category | Description | Example |
| --- | --- | --- |
| Added | New features | Added student bulk import |
| Changed | Changes to existing features | Changed fee calculation logic |
| Deprecated | Features being removed | Deprecated legacy API |
| Removed | Removed features | Removed unused DTOs |
| Fixed | Bug fixes | Fixed tenant leak in teacher classes |
| Security | Security fixes | Fixed role escalation vulnerability |

