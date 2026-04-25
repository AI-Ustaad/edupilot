import { NextResponse } from "next/server";

export function unauthorized() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

export function forbidden() {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

export function allowRoles(
  role: string | undefined,
  allowed: string[]
) {
  if (!role) return false;
  return allowed.includes(role);
}
