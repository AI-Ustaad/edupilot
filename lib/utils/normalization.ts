export function normalizeNaturalKey(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function sectionNaturalKey(tenantId: string, classGrade: string, sectionName: string): string {
  return `${normalizeNaturalKey(tenantId)}::${normalizeNaturalKey(classGrade)}::${normalizeNaturalKey(sectionName)}`;
}

export function sectionDocId(tenantId: string, classGrade: string, sectionName: string): string {
  return `${normalizeNaturalKey(tenantId)}__${normalizeNaturalKey(classGrade)}__${normalizeNaturalKey(sectionName)}`;
}

export function departmentNaturalKey(tenantId: string, name: string): string {
  return `${normalizeNaturalKey(tenantId)}::${normalizeNaturalKey(name)}`;
}
