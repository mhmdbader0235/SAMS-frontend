import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../store';

// api.js and keycloak.js are imported by store.js at module scope; neither
// needs network access just to construct, but api.js creates a real axios
// instance with interceptors that read `keycloak`/localStorage, so mock it
// out to keep this a pure unit test of the store's own getters.
vi.mock('../api', () => ({}));
vi.mock('../keycloak', () => ({
  default: { authenticated: false, token: null },
}));

function setUser(store, { role, roles, permissions = [] }) {
  store.user = { role, roles: roles || [role], permissions };
}

describe('useAuthStore().canAccessAcademicHub / canAccessManageUsers', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('are both false with no user loaded', () => {
    const store = useAuthStore();
    expect(store.canAccessAcademicHub).toBe(false);
    expect(store.canAccessManageUsers).toBe(false);
  });

  it('are both true for school_admin', () => {
    const store = useAuthStore();
    setUser(store, { role: 'school_admin' });
    expect(store.canAccessAcademicHub).toBe(true);
    expect(store.canAccessManageUsers).toBe(true);
  });

  it('are both true for super_admin', () => {
    const store = useAuthStore();
    setUser(store, { role: 'super_admin' });
    expect(store.canAccessAcademicHub).toBe(true);
    expect(store.canAccessManageUsers).toBe(true);
  });

  it('are both true for a bare manager -- level:create/level:manage/class:create/class:update/user:create are now role defaults, not a per-manager grant', () => {
    const store = useAuthStore();
    setUser(store, { role: 'manager' });
    expect(store.canAccessAcademicHub).toBe(true);
    expect(store.canAccessManageUsers).toBe(true);
  });

  it('are both false for a bare teacher, even though teacher legitimately holds user:view', () => {
    // Regression: teacher genuinely holds 'user:view' in
    // COMPOSITE_ROLE_PERMISSIONS (needed elsewhere, to view user profile
    // info). Neither getter may treat that as admin-hub access -- the
    // previous single canViewAdmin OR-chain in LayoutSidebar.vue did exactly
    // that (can('user:view') was one of its branches), leaking the whole
    // Academic Admin nav section to every teacher.
    const store = useAuthStore();
    setUser(store, { role: 'teacher' });
    expect(store.can('user:view')).toBe(true); // sanity: the permission really is held
    expect(store.canAccessAcademicHub).toBe(false);
    expect(store.canAccessManageUsers).toBe(false);
  });

  it('is false for a plain student on both', () => {
    const store = useAuthStore();
    setUser(store, { role: 'student' });
    expect(store.canAccessAcademicHub).toBe(false);
    expect(store.canAccessManageUsers).toBe(false);
  });

  describe('a teacher granted a SPECIFIC permission unlocks only the matching page', () => {
    // teacher (unlike manager, as of this session, which now gets these as
    // role defaults) starts with neither Academic Hub nor Manage Users
    // permissions, so it's the role that actually exercises the granular
    // escape-hatch-grant mechanism -- one specific permission surfacing only
    // the one matching page, not the whole admin area.
    it('level:create -> academic hub only, not manage users', () => {
      const store = useAuthStore();
      setUser(store, { role: 'teacher', permissions: ['level:create'] });
      expect(store.canAccessAcademicHub).toBe(true);
      expect(store.canAccessManageUsers).toBe(false);
    });

    it('class:create -> academic hub only, not manage users', () => {
      const store = useAuthStore();
      setUser(store, { role: 'teacher', permissions: ['class:create'] });
      expect(store.canAccessAcademicHub).toBe(true);
      expect(store.canAccessManageUsers).toBe(false);
    });

    it('class:update -> academic hub only, not manage users', () => {
      const store = useAuthStore();
      setUser(store, { role: 'teacher', permissions: ['class:update'] });
      expect(store.canAccessAcademicHub).toBe(true);
      expect(store.canAccessManageUsers).toBe(false);
    });

    it('user:create -> manage users only, not academic hub', () => {
      const store = useAuthStore();
      setUser(store, { role: 'teacher', permissions: ['user:create'] });
      expect(store.canAccessAcademicHub).toBe(false);
      expect(store.canAccessManageUsers).toBe(true);
    });

    it('user:invite -> manage users only, not academic hub', () => {
      const store = useAuthStore();
      setUser(store, { role: 'teacher', permissions: ['user:invite'] });
      expect(store.canAccessAcademicHub).toBe(false);
      expect(store.canAccessManageUsers).toBe(true);
    });

    it('teacher:create -> manage users only, not academic hub', () => {
      const store = useAuthStore();
      setUser(store, { role: 'teacher', permissions: ['teacher:create'] });
      expect(store.canAccessAcademicHub).toBe(false);
      expect(store.canAccessManageUsers).toBe(true);
    });

    it('an unrelated custom permission unlocks neither', () => {
      const store = useAuthStore();
      setUser(store, { role: 'teacher', permissions: ['billing:refund'] });
      expect(store.canAccessAcademicHub).toBe(false);
      expect(store.canAccessManageUsers).toBe(false);
    });

    it('granting both kinds of permission unlocks both pages', () => {
      const store = useAuthStore();
      setUser(store, { role: 'teacher', permissions: ['level:create', 'user:create'] });
      expect(store.canAccessAcademicHub).toBe(true);
      expect(store.canAccessManageUsers).toBe(true);
    });
  });

  describe('custom grants as GET /auth/me actually returns them (no separate "permissions" field)', () => {
    // Regression for the real bug, not the idealized shape above: back/app/
    // core/dependencies.py's CurrentUser has no distinct permissions
    // attribute -- get_current_user merges a user's DB `permissions` column
    // straight into the same set it calls "roles", and /auth/me (auth/
    // router.py) echoes exactly that merged set back as `"roles"`, with no
    // `"permissions"` key at all. Every test above sets `user.permissions`
    // directly, which is a contract the backend has never actually sent --
    // they were passing against a fiction. This block sets `user.roles` to
    // a real merged array instead, matching a real /auth/me response, which
    // is what caught the actual production bug: a manager granted
    // level:create/level:manage/class:create/class:update/user:create via
    // the Manage Permissions matrix still couldn't reach either page.
    function setUserFromRolesArray(store, role, mergedRoles) {
      store.user = { role, roles: mergedRoles, permissions: [] };
    }

    it('a granted permission sitting only in the merged roles array still unlocks the page (teacher, which has no default access)', () => {
      const store = useAuthStore();
      setUserFromRolesArray(store, 'teacher', ['teacher', 'level:create']);
      expect(store.canAccessAcademicHub).toBe(true);
      expect(store.canAccessManageUsers).toBe(false);
    });

    it('reproduces the originally reported bug exactly: manager granted the Academic Hub + Manage Users escape-hatch permissions, all merged into roles as the backend actually sends them', () => {
      const store = useAuthStore();
      setUserFromRolesArray(store, 'manager', [
        // the role's own server-expanded composite permissions (present
        // regardless of any custom grant -- harmless overlap with
        // COMPOSITE_ROLE_PERMISSIONS.manager on the frontend)
        'manager', 'event:read', 'billing:pay',
        // the actual custom grants from the Manage Permissions matrix
        // (now also role defaults, per the follow-up request, but this
        // reproduces the original per-user-grant report unchanged)
        'level:create', 'level:manage', 'class:create', 'class:update', 'user:create',
        // catalog-only entries that exist in the matrix UI but are never
        // enforced by any backend check (school_admin's composite list
        // includes them; see dependencies.py's COMPOSITE_ROLE_PERMISSIONS) --
        // must not be required for the hub to unlock, since real gating
        // runs on class:update, not these
        'class:edit', 'class:assign_teacher',
      ]);
      expect(store.canAccessAcademicHub).toBe(true);
      expect(store.canAccessManageUsers).toBe(true);
    });

    it('a bare manager with no custom grants sees both by default (role default, not a false positive from the merge mechanism)', () => {
      const store = useAuthStore();
      setUserFromRolesArray(store, 'manager', ['manager', 'event:read', 'billing:pay']);
      expect(store.canAccessAcademicHub).toBe(true);
      expect(store.canAccessManageUsers).toBe(true);
    });

    it('a bare teacher (no defaults, no grants) sees neither -- proves the merge mechanism itself introduces no false positive independent of manager\'s new defaults', () => {
      const store = useAuthStore();
      setUserFromRolesArray(store, 'teacher', ['teacher', 'event:read']);
      expect(store.canAccessAcademicHub).toBe(false);
      expect(store.canAccessManageUsers).toBe(false);
    });
  });
});
