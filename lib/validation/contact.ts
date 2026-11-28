// lib/validation/contact.ts
// B21 — single source of truth for Pakistani phone numbers and placeholder
// emails. Previously every form inlined its own strict /^03\d{9}$/ check on
// the RAW stored value, which caused two defects:
//
// 1. Stored legacy 10-digit numbers (e.g. guardian 0303341057, staff
//    0308245206) failed the check, so editing an UNRELATED field on an
//    existing student/staff record was blocked with
//    "Guardian phone must be in 11-digit format".
// 2. No normalisation existed, so even correctly typed numbers in the
//    formats the forms themselves suggest ("+92 300 1234567",
//    "3001234567") were rejected — only an already-canonical 03XXXXXXXXX
//    passed.
//
// A 10-digit legacy number CANNOT be safely "corrected" to 11 digits: one
// digit is missing and its position/value are unknown, so inventing a digit
// would fabricate a wrong number. Legacy values are therefore grandfathered
// on edit (unchanged values pass through untouched) and only CHANGED values
// must normalise to a valid 11-digit number. New records must always be
// valid 11-digit numbers.

export const PAKISTANI_PHONE_MESSAGE =
  "Phone must be in 11-digit Pakistani format: 03XXXXXXXXX";

export const PLACEHOLDER_EMAIL_MESSAGE =
  "Please use a realistic school email domain (e.g. @ghssahiwal.edu.pk)";

/**
 * Normalise a Pakistani mobile number to canonical 11-digit form
 * (03XXXXXXXXX). Accepts the forms users actually type:
 *   "03001234567", "0300 1234567", "+92 300 1234567", "923001234567",
 *   "0092 300 1234567", "3001234567".
 * Returns null when the value cannot be normalised to a valid number —
 * including legacy 10-digit numbers starting with 03 (a digit is missing;
 * see the module header — they must be corrected by hand, never guessed).
 */
export function normalizePakistaniPhone(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return null;

  let local = digits;
  if (local.startsWith("0092") && local.length === 14) {
    local = `0${local.slice(4)}`;
  } else if (local.startsWith("92") && local.length === 12) {
    local = `0${local.slice(2)}`;
  } else if (local.startsWith("3") && local.length === 10) {
    local = `0${local}`;
  }

  return /^03\d{9}$/.test(local) ? local : null;
}

export function isValidPakistaniPhone(value: unknown): boolean {
  return normalizePakistaniPhone(value) !== null;
}

/**
 * True for the stored legacy shape: exactly 10 digits starting with 03
 * (e.g. 0308245206). Such a number is missing one digit and cannot be
 * auto-corrected — it is grandfathered on edit, never rewritten.
 */
export function isLegacyPakistaniPhone(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const digits = String(value).replace(/\D/g, "");
  return /^03\d{8}$/.test(digits);
}

export type PhoneResolution = { value: string } | { error: string };

function isPhoneError(
  r: PhoneResolution,
): r is { error: string } {
  return "error" in r;
}

/**
 * Resolve a phone typed into a CREATE form (new student / new staff / bulk
 * import). Empty is allowed (phone is optional); any non-empty value must
 * normalise to a valid 11-digit number. The returned value is the canonical
 * form to store.
 */
export function resolvePhoneForCreate(value: unknown): PhoneResolution {
  const raw = value === null || value === undefined ? "" : String(value).trim();
  if (!raw) return { value: "" };
  const normalized = normalizePakistaniPhone(raw);
  if (!normalized) return { error: PAKISTANI_PHONE_MESSAGE };
  return { value: normalized };
}

/**
 * Resolve a phone typed into an EDIT form.
 * An UNCHANGED stored value passes through untouched — a legacy 10-digit
 * number must never block saving an unrelated field (B21 / Student edit).
 * A CHANGED value must normalise to a valid 11-digit number, and the
 * canonical form is what gets stored.
 */
export function resolvePhoneForEdit(
  value: unknown,
  original: unknown,
): PhoneResolution {
  const raw = value === null || value === undefined ? "" : String(value);
  const orig = original === null || original === undefined ? "" : String(original);
  if (raw === orig) return { value: raw };
  return resolvePhoneForCreate(raw);
}

export { isPhoneError };

// Reserved / placeholder email domains that must never be stored as a real
// contact address (B21: live staff records still carry
// teacher02.test@example.com … teacher10.test@example.com).
const PLACEHOLDER_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "example.edu",
  "test.com",
]);

const PLACEHOLDER_EMAIL_TLDS = [".test", ".invalid", ".localhost", ".example"];

/** True for placeholder/test addresses such as *@example.com or *@x.test. */
export function isPlaceholderEmail(email: unknown): boolean {
  if (email === null || email === undefined) return false;
  const clean = String(email).trim().toLowerCase();
  if (!clean || !clean.includes("@")) return false;
  const domain = clean.split("@").pop() || "";
  if (PLACEHOLDER_EMAIL_DOMAINS.has(domain)) return true;
  return PLACEHOLDER_EMAIL_TLDS.some(
    (tld) => domain === tld.slice(1) || domain.endsWith(tld),
  );
}
