import {
  normalizePakistaniPhone,
  isValidPakistaniPhone,
  isLegacyPakistaniPhone,
  resolvePhoneForCreate,
  resolvePhoneForEdit,
  isPlaceholderEmail,
} from "@/lib/validation/contact";

// B21 — 10-digit phones + test emails: regression tests for the shared
// contact validation. The audit found staff/guardian phones stored as
// 10 digits (0308245206, 0303341057, …) and staff emails like
// teacher02.test@example.com, and the Student edit page blocked saving
// because the stored 10-digit guardian phone failed the strict 11-digit
// check.

describe("normalizePakistaniPhone", () => {
  test("canonical 11-digit numbers pass through unchanged", () => {
    expect(normalizePakistaniPhone("03001234567")).toBe("03001234567");
    expect(normalizePakistaniPhone("0300 1234567")).toBe("03001234567");
    expect(normalizePakistaniPhone("0300-1234567")).toBe("03001234567");
  });

  test("international +92 / 92 / 0092 forms normalise to 03…", () => {
    expect(normalizePakistaniPhone("+92 300 1234567")).toBe("03001234567");
    expect(normalizePakistaniPhone("923001234567")).toBe("03001234567");
    expect(normalizePakistaniPhone("0092 300 1234567")).toBe("03001234567");
  });

  test("10-digit number without the leading 0 normalises", () => {
    expect(normalizePakistaniPhone("3001234567")).toBe("03001234567");
  });

  test("legacy 10-digit numbers starting with 03 cannot be normalised", () => {
    // A digit is missing and its position/value are unknown — guessing
    // would fabricate a wrong number, so these must return null.
    expect(normalizePakistaniPhone("0308245206")).toBeNull();
    expect(normalizePakistaniPhone("0303341057")).toBeNull();
    expect(normalizePakistaniPhone("0308078673")).toBeNull();
  });

  test("other invalid shapes return null", () => {
    expect(normalizePakistaniPhone("")).toBeNull();
    expect(normalizePakistaniPhone("   ")).toBeNull();
    expect(normalizePakistaniPhone(null)).toBeNull();
    expect(normalizePakistaniPhone(undefined)).toBeNull();
    expect(normalizePakistaniPhone("12345")).toBeNull();
    expect(normalizePakistaniPhone("030012345678")).toBeNull();
    expect(normalizePakistaniPhone("04001234567")).toBeNull();
    expect(normalizePakistaniPhone("02001234567")).toBeNull();
  });
});

describe("isValidPakistaniPhone / isLegacyPakistaniPhone", () => {
  test("valid numbers are valid, legacy numbers are legacy — never both", () => {
    expect(isValidPakistaniPhone("03001234567")).toBe(true);
    expect(isLegacyPakistaniPhone("03001234567")).toBe(false);
    expect(isValidPakistaniPhone("0308245206")).toBe(false);
    expect(isLegacyPakistaniPhone("0308245206")).toBe(true);
    expect(isLegacyPakistaniPhone("0303341057")).toBe(true);
    expect(isLegacyPakistaniPhone("3001234567")).toBe(false);
    expect(isLegacyPakistaniPhone("")).toBe(false);
  });
});

describe("resolvePhoneForCreate", () => {
  test("empty is allowed (phone is optional)", () => {
    expect(resolvePhoneForCreate("")).toEqual({ value: "" });
    expect(resolvePhoneForCreate("   ")).toEqual({ value: "" });
    expect(resolvePhoneForCreate(null)).toEqual({ value: "" });
  });

  test("valid forms resolve to the canonical number", () => {
    expect(resolvePhoneForCreate("+92 300 1234567")).toEqual({
      value: "03001234567",
    });
    expect(resolvePhoneForCreate("3001234567")).toEqual({
      value: "03001234567",
    });
  });

  test("legacy 10-digit and garbage values are rejected for new records", () => {
    expect(resolvePhoneForCreate("0308245206")).toEqual({
      error: "Phone must be in 11-digit Pakistani format: 03XXXXXXXXX",
    });
    expect(resolvePhoneForCreate("12345")).toEqual({
      error: "Phone must be in 11-digit Pakistani format: 03XXXXXXXXX",
    });
  });
});

describe("resolvePhoneForEdit", () => {
  test("an unchanged legacy 10-digit value passes through — edit is not blocked", () => {
    // The audit's Student-edit blocker: Ahmed Shah's stored guardian phone
    // 0303341057 must not stop the user changing another field and saving.
    expect(resolvePhoneForEdit("0303341057", "0303341057")).toEqual({
      value: "0303341057",
    });
    expect(resolvePhoneForEdit("0308245206", "0308245206")).toEqual({
      value: "0308245206",
    });
  });

  test("an unchanged valid value passes through untouched", () => {
    expect(resolvePhoneForEdit("03001234567", "03001234567")).toEqual({
      value: "03001234567",
    });
  });

  test("a changed value must normalise to a valid number", () => {
    expect(resolvePhoneForEdit("+92 300 1234567", "03001112222")).toEqual({
      value: "03001234567",
    });
  });

  test("a changed value that cannot normalise is rejected", () => {
    expect(resolvePhoneForEdit("0308245206", "03001112222")).toEqual({
      error: "Phone must be in 11-digit Pakistani format: 03XXXXXXXXX",
    });
    expect(resolvePhoneForEdit("abc", "03001112222")).toEqual({
      error: "Phone must be in 11-digit Pakistani format: 03XXXXXXXXX",
    });
  });

  test("clearing the phone is allowed", () => {
    expect(resolvePhoneForEdit("", "03001112222")).toEqual({ value: "" });
  });
});

describe("isPlaceholderEmail", () => {
  test("the audit's live placeholder emails are rejected", () => {
    expect(isPlaceholderEmail("teacher02.test@example.com")).toBe(true);
    expect(isPlaceholderEmail("teacher10.test@example.com")).toBe(true);
    expect(isPlaceholderEmail("someone@example.org")).toBe(true);
    expect(isPlaceholderEmail("someone@example.net")).toBe(true);
  });

  test("other placeholder/test domains are rejected", () => {
    expect(isPlaceholderEmail("a@test.com")).toBe(true);
    expect(isPlaceholderEmail("a@school.test")).toBe(true);
    expect(isPlaceholderEmail("a@mail.invalid")).toBe(true);
    expect(isPlaceholderEmail("a@localhost")).toBe(true);
  });

  test("real school and personal addresses pass", () => {
    expect(isPlaceholderEmail("teacher@ghssahiwal.edu.pk")).toBe(false);
    expect(isPlaceholderEmail("imran.haider@gmail.com")).toBe(false);
    expect(isPlaceholderEmail("")).toBe(false);
    expect(isPlaceholderEmail(null)).toBe(false);
    expect(isPlaceholderEmail("not-an-email")).toBe(false);
  });
});
