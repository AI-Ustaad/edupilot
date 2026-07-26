# Coding Standards

**Document ID**: EDU-CODE-001  
**Version**: 1.0  
**Date**: 2026-07-26  
**Status**: Canonical  
**Owner**: CTO Office, EduPilot Engineering  
**Classification**: Internal — Engineering Governance  

---

## 1. General Principles

- **Verify before implementing**: Check EDUPILOT_MASTER_FACTS.md first
- **No dead code**: Remove unused code immediately
- **No duplication**: DRY principle enforced
- **Type safety**: TypeScript strict mode
- **Explicit over implicit**: Clear intent in code

## 2. Naming Conventions

| Type | Convention | Example |
| --- | --- | --- |
| Services | PascalCase + Service suffix | StudentService.ts |
| Repositories | PascalCase + Repository suffix | student.repository.ts |
| Interfaces | I prefix + PascalCase | IStudentService.ts |
| Entities | PascalCase + Entity suffix | student.entity.ts |
| DTOs | PascalCase + DTO suffix | CreateStudentDTO.ts |
| Mappers | PascalCase + Mapper suffix | StudentPersistenceMapper.ts |
| Validators | PascalCase + Validator suffix | CreateStudentValidator.ts |

## 3. File Organization

```
services/
  {Domain}Service.ts          # Business logic

repositories/
  {domain}.repository.ts      # Data access

interfaces/
  I{Domain}Service.ts         # Service contract
  I{Domain}Repository.ts      # Repository contract

entities/
  {domain}.entity.ts          # Domain entity

dto/
  Create{Domain}DTO.ts        # Input DTO
  Update{Domain}DTO.ts        # Update DTO
  {Domain}ResponseDTO.ts      # Output DTO

lib/mappers/
  {Domain}PersistenceMapper.ts # Entity <-> DB mapping
```

