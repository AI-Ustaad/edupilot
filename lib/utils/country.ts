// lib/utils/country.ts
// Country helpers for the General Settings Country field (B24).
// The school's country is stored canonically as an ISO code ("PK") — that is
// what MasterSchoolConfiguration, the Configuration Dashboard and the runtime
// kernel all use. The settings form shows the full name ("Pakistan") while
// saving the code, so every downstream consumer keeps working unchanged.

export interface CountryOption {
  code: string;
  name: string;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "PK", name: "Pakistan" },
  { code: "IN", name: "India" },
  { code: "BD", name: "Bangladesh" },
  { code: "NP", name: "Nepal" },
  { code: "LK", name: "Sri Lanka" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];

const BY_CODE = new Map(COUNTRY_OPTIONS.map((o) => [o.code, o.name]));
const BY_NAME = new Map(
  COUNTRY_OPTIONS.map((o) => [o.name.toLowerCase(), o.code])
);

/** Normalise any stored country value to its ISO code; default Pakistan ("PK"). */
export function normalizeCountryCode(value: unknown): string {
  if (typeof value !== "string") return "PK";
  const trimmed = value.trim();
  if (!trimmed) return "PK";
  const upper = trimmed.toUpperCase();
  if (BY_CODE.has(upper)) return upper;
  // Legacy aliases used elsewhere in the codebase.
  if (upper === "PAK") return "PK";
  const byName = BY_NAME.get(trimmed.toLowerCase());
  if (byName) return byName;
  // Unknown value: keep it as-is (upper-cased) rather than silently switching country.
  return upper;
}

/** Display name for a stored country value; default Pakistan. */
export function countryDisplayName(value: unknown): string {
  const code = normalizeCountryCode(value);
  return BY_CODE.get(code) ?? code;
}
