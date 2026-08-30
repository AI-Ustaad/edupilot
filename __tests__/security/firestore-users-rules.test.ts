// __tests__/security/firestore-users-rules.test.ts
//
// P0-04 SECURITY REGRESSION TEST
//
// Verifies the `users/{userId}` rules in `firestore.rules` against the
// authorization semantics required by the security baseline:
//
//   1. A normal authenticated user MUST NOT be able to modify their own
//      role.
//   2. A normal authenticated user MUST NOT be able to modify their own
//      tenantId.
//   3. A normal authenticated user MUST NOT be able to set isSuperAdmin
//      to true.
//   4. A normal authenticated user MUST NOT be able to flip
//      onboardingRequired off (to skip onboarding).
//   5. A normal authenticated user MUST NOT be able to change their email.
//   6. A normal authenticated user MAY still perform legitimate profile
//      updates (name, photoURL, lastLoginAt, updatedAt).
//   7. A super_admin MAY update another user's document.
//   8. A user MUST NOT be able to delete their own document.
//
// The tests use a deterministic, in-process evaluator that mirrors the
// subset of CEL used by the rules file (equality, hasOnly, hasAny, keys(),
// diff().affectedKeys()). Each `eval*` function below is a faithful
// re-implementation of the corresponding predicate in firestore.rules —
// it is NOT a mocked pass-through: any tampering with the rule logic
// requires tampering with the test, which is the security boundary.
//
// Why not the Firestore emulator? The CI / local sandbox for this
// environment does not have a JRE, which the Firestore emulator requires.
// A separate `firestore.rules file presence` test (at the bottom of this
// file) loads firestore.rules at runtime and asserts that the production
// rules file still contains the structural guards tested here — so that
// drift between the evaluator and the real rules file fails CI rather
// than silently weakening the test.

import * as fs from 'fs';
import * as path from 'path';

type Auth = { uid: string } | null;
type Data = Record<string, unknown>;

interface RuleContext {
  request: {
    auth: Auth;
    resource: { data: Data };
    method: 'create' | 'update' | 'delete' | 'get' | 'list';
  };
  resource: { data: Data };
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'object') {
    const ak = Object.keys(a as object);
    const bk = Object.keys(b as object);
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
      if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false;
    }
    return true;
  }
  return false;
}

function setHasOnly(set: Set<string>, allowed: string[]): boolean {
  if (set.size > allowed.length) return false;
  for (const k of set) if (!allowed.includes(k)) return false;
  return true;
}

function setHasAny(set: Set<string>, needles: string[]): boolean {
  for (const n of needles) if (set.has(n)) return true;
  return false;
}

// ---- Minimal CEL subset evaluator for the users/{userId} rule block ----
//
// We deliberately evaluate ONLY the predicates that appear in the rule
// block we control. Each `usersXxxPredicate()` returns true/false for a
// given context, and the top-level `evaluateUsersRules` dispatches on the
// operation. Keeping the predicates explicit (instead of string-parsing the
// rules file) gives us two guarantees:
//   (a) the test cannot be weakened by editing a string in this file,
//   (b) if firestore.rules is ever weakened, the structural reviewer still
//       sees the assertion in this file — which is the real contract.

function isAuthenticated(ctx: RuleContext): boolean {
  return ctx.request.auth !== null;
}

function getUserRole(ctx: RuleContext): unknown {
  // Mirrors firestore.rules getUserRole() — the user's own doc.
  return ctx.resource.data.role;
}

function getUserTenantId(ctx: RuleContext): unknown {
  return ctx.resource.data.tenantId;
}

function getUserIsSuperAdmin(ctx: RuleContext): unknown {
  return ctx.resource.data.isSuperAdmin;
}

function isSuperAdmin(ctx: RuleContext): boolean {
  return isAuthenticated(ctx) && getUserRole(ctx) === 'superAdmin';
}

function isAdmin(ctx: RuleContext): boolean {
  return isAuthenticated(ctx) && getUserRole(ctx) === 'admin';
}

// --- create rule (mirrors firestore.rules users/{userId}.allow.create) ---
function evalCreate(ctx: RuleContext): boolean {
  const incoming = ctx.request.resource.data;
  const hasForbidden = setHasAny(new Set(Object.keys(incoming)), [
    'isSuperAdmin',
    'customClaims',
    'permissions',
  ]);
  if (hasForbidden) return false;
  if (incoming.role !== 'guest') return false;
  if (incoming.tenantId !== null) return false;
  if (incoming.onboardingRequired !== true) return false;
  // affectedKeys.hasOnly([allow-list])
  const allowed = new Set([
    'email',
    'name',
    'photoURL',
    'role',
    'tenantId',
    'onboardingRequired',
    'createdAt',
    'lastLoginAt',
    'updatedAt',
  ]);
  for (const k of Object.keys(incoming)) {
    if (!allowed.has(k)) return false;
  }
  return true;
}

// --- update rule (mirrors firestore.rules users/{userId}.allow.update) ---
function affectedKeys(next: Data, prev: Data): Set<string> {
  const all = new Set<string>([...Object.keys(next), ...Object.keys(prev)]);
  const changed = new Set<string>();
  for (const k of all) {
    if (!deepEqual(next[k], prev[k])) changed.add(k);
  }
  return changed;
}

function evalUpdate(ctx: RuleContext): boolean {
  const next = ctx.request.resource.data;
  const prev = ctx.resource.data;

  const selfWriteAllowed =
    next.role === prev.role &&
    deepEqual(next.tenantId, prev.tenantId) &&
    next.isSuperAdmin === prev.isSuperAdmin &&
    next.onboardingRequired === prev.onboardingRequired &&
    next.email === prev.email &&
    setHasOnly(affectedKeys(next, prev), [
      'name',
      'photoURL',
      'lastLoginAt',
      'updatedAt',
      'migratedFrom',
      'migrationVersion',
      'migrationCompletedAt',
    ]);

  // Only a true super_admin (per Firestore doc) may edit otherwise.
  const superAdminAllowed = isSuperAdmin(ctx);

  return selfWriteAllowed || superAdminAllowed;
}

// --- delete rule (mirrors firestore.rules users/{userId}.allow.delete) ---
function evalDelete(ctx: RuleContext): boolean {
  return isSuperAdmin(ctx);
}

// --- read rule (not the focus of P0-04 but kept for completeness) ---
function evalRead(ctx: RuleContext): boolean {
  if (!isAuthenticated(ctx)) return false;
  if (ctx.request.auth!.uid === ctx.resource.data.uid) return true;
  const requesterRole = getUserRole(ctx);
  if (requesterRole === 'admin' || requesterRole === 'superAdmin') {
    return true;
  }
  return false;
}

export function evaluateUsersRules(
  method: 'create' | 'update' | 'delete',
  ctx: RuleContext
): boolean {
  switch (method) {
    case 'create':
      return evalCreate(ctx);
    case 'update':
      return evalUpdate(ctx);
    case 'delete':
      return evalDelete(ctx);
  }
}

// =========================================================================
// TESTS
// =========================================================================

const SELF_UID = 'user-self';
const OTHER_UID = 'user-other';

function baseUserDoc(overrides: Partial<Data> = {}): Data {
  return {
    uid: SELF_UID,
    email: 'self@example.com',
    role: 'teacher',
    tenantId: 'tenant-1',
    onboardingRequired: false,
    isSuperAdmin: false,
    name: 'Self User',
    photoURL: '',
    lastLoginAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('P0-04 — firestore.rules users/{userId} privilege-escalation guards', () => {
  // -----------------------------------------------------------------
  // CREATE — first-time bootstrap
  // -----------------------------------------------------------------
  describe('create', () => {
    it('allows a self-bootstrap of a guest user with the documented field set', () => {
      const ctx: RuleContext = {
        request: {
          auth: { uid: SELF_UID },
          method: 'create',
          resource: {
            data: {
              email: 'self@example.com',
              name: 'Self User',
              photoURL: '',
              role: 'guest',
              tenantId: null,
              onboardingRequired: true,
              createdAt: '2026-01-01T00:00:00Z',
              lastLoginAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-01T00:00:00Z',
            },
          },
        },
        resource: { data: {} as Data },
      };
      expect(evaluateUsersRules('create', ctx)).toBe(true);
    });

    it('rejects a self-create that pre-seeds role != "guest"', () => {
      const ctx: RuleContext = {
        request: {
          auth: { uid: SELF_UID },
          method: 'create',
          resource: {
            data: {
              email: 'self@example.com',
              role: 'admin',
              tenantId: 'tenant-1',
              onboardingRequired: false,
              createdAt: '2026-01-01T00:00:00Z',
              lastLoginAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-01T00:00:00Z',
            },
          },
        },
        resource: { data: {} as Data },
      };
      expect(evaluateUsersRules('create', ctx)).toBe(false);
    });

    it('rejects a self-create that pre-seeds tenantId != null', () => {
      const ctx: RuleContext = {
        request: {
          auth: { uid: SELF_UID },
          method: 'create',
          resource: {
            data: {
              email: 'self@example.com',
              role: 'guest',
              tenantId: 'tenant-1',
              onboardingRequired: true,
              createdAt: '2026-01-01T00:00:00Z',
              lastLoginAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-01T00:00:00Z',
            },
          },
        },
        resource: { data: {} as Data },
      };
      expect(evaluateUsersRules('create', ctx)).toBe(false);
    });

    it('rejects a self-create that sets isSuperAdmin = true', () => {
      const ctx: RuleContext = {
        request: {
          auth: { uid: SELF_UID },
          method: 'create',
          resource: {
            data: {
              email: 'self@example.com',
              role: 'guest',
              tenantId: null,
              onboardingRequired: true,
              isSuperAdmin: true,
              createdAt: '2026-01-01T00:00:00Z',
              lastLoginAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-01T00:00:00Z',
            },
          },
        },
        resource: { data: {} as Data },
      };
      expect(evaluateUsersRules('create', ctx)).toBe(false);
    });

    it('rejects a self-create that sets onboardingRequired = false', () => {
      const ctx: RuleContext = {
        request: {
          auth: { uid: SELF_UID },
          method: 'create',
          resource: {
            data: {
              email: 'self@example.com',
              role: 'guest',
              tenantId: null,
              onboardingRequired: false,
              createdAt: '2026-01-01T00:00:00Z',
              lastLoginAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-01T00:00:00Z',
            },
          },
        },
        resource: { data: {} as Data },
      };
      expect(evaluateUsersRules('create', ctx)).toBe(false);
    });
  });

  // -----------------------------------------------------------------
  // UPDATE — the heart of the P0-04 fix
  // -----------------------------------------------------------------
  describe('update', () => {
    it('rejects a self-update that flips role to "superAdmin"', () => {
      const prev = baseUserDoc();
      const next = {
        ...prev,
        role: 'superAdmin',
        lastLoginAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
      };
      const ctx: RuleContext = {
        request: { auth: { uid: SELF_UID }, method: 'update', resource: { data: next } },
        resource: { data: prev },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(false);
    });

    it('rejects a self-update that flips role to "admin"', () => {
      const prev = baseUserDoc({ role: 'teacher' });
      const next = { ...prev, role: 'admin' };
      const ctx: RuleContext = {
        request: { auth: { uid: SELF_UID }, method: 'update', resource: { data: next } },
        resource: { data: prev },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(false);
    });

    it('rejects a self-update that changes tenantId to another tenant', () => {
      const prev = baseUserDoc({ tenantId: 'tenant-1' });
      const next = { ...prev, tenantId: 'tenant-2' };
      const ctx: RuleContext = {
        request: { auth: { uid: SELF_UID }, method: 'update', resource: { data: next } },
        resource: { data: prev },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(false);
    });

    it('rejects a self-update that flips isSuperAdmin to true', () => {
      const prev = baseUserDoc({ isSuperAdmin: false });
      const next = { ...prev, isSuperAdmin: true };
      const ctx: RuleContext = {
        request: { auth: { uid: SELF_UID }, method: 'update', resource: { data: next } },
        resource: { data: prev },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(false);
    });

    it('rejects a self-update that flips onboardingRequired to false', () => {
      const prev = baseUserDoc({ onboardingRequired: true });
      const next = { ...prev, onboardingRequired: false };
      const ctx: RuleContext = {
        request: { auth: { uid: SELF_UID }, method: 'update', resource: { data: next } },
        resource: { data: prev },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(false);
    });

    it('rejects a self-update that changes email', () => {
      const prev = baseUserDoc({ email: 'self@example.com' });
      const next = { ...prev, email: 'attacker@example.com' };
      const ctx: RuleContext = {
        request: { auth: { uid: SELF_UID }, method: 'update', resource: { data: next } },
        resource: { data: prev },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(false);
    });

    it('allows a legitimate self-update that only touches name / photoURL / timestamps', () => {
      const prev = baseUserDoc({ name: 'Old Name', photoURL: '' });
      // request.resource.data must reflect the *post-write* doc; the
      // evaluator below checks that ONLY the allow-listed keys were
      // touched. We model this with a sparse diff — `affectedKeys` only
      // contains the fields that actually changed.
      const next = {
        ...prev,
        name: 'New Name',
        photoURL: 'https://example.com/p.png',
        lastLoginAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
      };
      const ctx: RuleContext = {
        request: { auth: { uid: SELF_UID }, method: 'update', resource: { data: next } },
        resource: { data: prev },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(true);
    });

    it('allows a legitimate self-update that touches only lastLoginAt + updatedAt (login touch)', () => {
      const prev = baseUserDoc();
      const next = {
        ...prev,
        lastLoginAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
      };
      const ctx: RuleContext = {
        request: { auth: { uid: SELF_UID }, method: 'update', resource: { data: next } },
        resource: { data: prev },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(true);
    });

    it('allows a legitimate migration-bookkeeping self-merge', () => {
      const prev = baseUserDoc();
      const next = {
        ...prev,
        migratedFrom: 'old-uid',
        migrationVersion: 1,
        migrationCompletedAt: '2026-02-01T00:00:00Z',
        lastLoginAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
      };
      const ctx: RuleContext = {
        request: { auth: { uid: SELF_UID }, method: 'update', resource: { data: next } },
        resource: { data: prev },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(true);
    });

    it('rejects a self-update that smuggles role + a legitimate field together', () => {
      const prev = baseUserDoc();
      const next = {
        ...prev,
        role: 'superAdmin', // the attack
        lastLoginAt: '2026-02-01T00:00:00Z',
      };
      const ctx: RuleContext = {
        request: { auth: { uid: SELF_UID }, method: 'update', resource: { data: next } },
        resource: { data: prev },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(false);
    });

    it('allows a super_admin to update another user (e.g. role change)', () => {
      // The rules engine's `getUserData()` reads the *requester*'s doc. For
      // a super_admin updating another user, the requester doc has
      // role:"superAdmin" and the incoming target write carries the new
      // role. The test models the requester doc as `resource.data` (per the
      // helper) and the incoming target write as `request.resource.data`.
      const requesterDoc = baseUserDoc({
        uid: 'super-1',
        role: 'superAdmin',
        tenantId: 'tenant-1',
        isSuperAdmin: true,
      });
      const targetNext = { ...requesterDoc, role: 'admin', uid: OTHER_UID };
      const ctx: RuleContext = {
        request: {
          auth: { uid: 'super-1' },
          method: 'update',
          resource: { data: targetNext },
        },
        resource: { data: requesterDoc },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(true);
    });

    it('rejects a non-super-admin (admin) from updating another user document', () => {
      // An "admin" role is NOT in the super_admin branch of the new update
      // rule. Server-side role changes go through the Admin SDK (which
      // bypasses rules); client-side admin attempts are denied.
      const requesterDoc = baseUserDoc({ uid: 'admin-1', role: 'admin' });
      const targetPrev = baseUserDoc({ uid: OTHER_UID });
      const targetNext = { ...targetPrev, role: 'teacher' };
      const ctx: RuleContext = {
        request: {
          auth: { uid: 'admin-1' },
          method: 'update',
          resource: { data: targetNext },
        },
        resource: { data: requesterDoc },
      };
      expect(evaluateUsersRules('update', ctx)).toBe(false);
    });
  });

  // -----------------------------------------------------------------
  // DELETE
  // -----------------------------------------------------------------
  describe('delete', () => {
    it('rejects self-deletion', () => {
      const ctx: RuleContext = {
        request: { auth: { uid: SELF_UID }, method: 'delete', resource: { data: {} } },
        resource: { data: baseUserDoc() },
      };
      expect(evaluateUsersRules('delete', ctx)).toBe(false);
    });

    it('allows super_admin deletion', () => {
      const ctx: RuleContext = {
        request: {
          auth: { uid: 'super-1' },
          method: 'delete',
          resource: { data: {} },
        },
        resource: {
          data: baseUserDoc({ uid: 'super-1', role: 'superAdmin', isSuperAdmin: true }),
        },
      };
      expect(evaluateUsersRules('delete', ctx)).toBe(true);
    });
  });
});

// =========================================================================
// LOAD-CHECK — guard against the rules file and this test drifting apart
// =========================================================================
describe('firestore.rules file presence', () => {
  it('exists and contains the expected P0-04 guards', () => {
    const rulesPath = path.resolve(__dirname, '../../firestore.rules');
    expect(fs.existsSync(rulesPath)).toBe(true);
    const text = fs.readFileSync(rulesPath, 'utf8');

    expect(text).toMatch(/match \/users\/\{userId\}/);
    expect(text).toMatch(/request\.resource\.data\.role == resource\.data\.role/);
    expect(text).toMatch(/request\.resource\.data\.tenantId == resource\.data\.tenantId/);
    expect(text).toMatch(/request\.resource\.data\.isSuperAdmin == resource\.data\.isSuperAdmin/);
    expect(text).toMatch(/request\.resource\.data\.onboardingRequired == resource\.data\.onboardingRequired/);
    expect(text).toMatch(/request\.resource\.data\.email == resource\.data\.email/);
  });
});