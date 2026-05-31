export function hasPermission(
  permissions: string[],
  permission: string
): boolean {
  return permissions.includes(permission);
}

export function hasAnyPermission(
  permissions: string[],
  required: string[]
): boolean {
  return required.some((p) => permissions.includes(p));
}

export function hasAllPermissions(
  permissions: string[],
  required: string[]
): boolean {
  return required.every((p) => permissions.includes(p));
}
