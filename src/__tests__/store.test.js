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

  it('are both false for a bare manager -- COMPOSITE_ROLE_PERMISSIONS.manager grants none of these permissions by default', () => {
    const store = useAuthStore();
    setUser(store, { role: 'manager' });
    expect(store.canAccessAcademicHub).toBe(false);
    expect(store.canAccessManageUsers).toBe(false);
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

  describe('a manager granted a SPECIFIC permission unlocks only the matching page', () => {
    it('level:create -> academic hub only, not manage users', () => {
      const store = useAuthStore();
      setUser(store, { role: 'manager', permissions: ['level:create'] });
      expect(store.canAccessAcademicHub).toBe(true);
      expect(store.canAccessManageUsers).toBe(false);
    });

    it('class:create -> academic hub only, not manage users', () => {
      const store = useAuthStore();
      setUser(store, { role: 'manager', permissions: ['class:create'] });
      expect(store.canAccessAcademicHub).toBe(true);
      expect(store.canAccessManageUsers).toBe(false);
    });

    it('class:update -> academic hub only, not manage users', () => {
      const store = useAuthStore();
      setUser(store, { role: 'manager', permissions: ['class:update'] });
      expect(store.canAccessAcademicHub).toBe(true);
      expect(store.canAccessManageUsers).toBe(false);
    });

    it('user:create -> manage users only, not academic hub', () => {
      const store = useAuthStore();
      setUser(store, { role: 'manager', permissions: ['user:create'] });
      expect(store.canAccessAcademicHub).toBe(false);
      expect(store.canAccessManageUsers).toBe(true);
    });

    it('user:invite -> manage users only, not academic hub', () => {
      const store = useAuthStore();
      setUser(store, { role: 'manager', permissions: ['user:invite'] });
      expect(store.canAccessAcademicHub).toBe(false);
      expect(store.canAccessManageUsers).toBe(true);
    });

    it('teacher:create -> manage users only, not academic hub', () => {
      const store = useAuthStore();
      setUser(store, { role: 'manager', permissions: ['teacher:create'] });
      expect(store.canAccessAcademicHub).toBe(false);
      expect(store.canAccessManageUsers).toBe(true);
    });

    it('an unrelated custom permission unlocks neither', () => {
      const store = useAuthStore();
      setUser(store, { role: 'manager', permissions: ['billing:refund'] });
      expect(store.canAccessAcademicHub).toBe(false);
      expect(store.canAccessManageUsers).toBe(false);
    });

    it('granting both kinds of permission unlocks both pages', () => {
      const store = useAuthStore();
      setUser(store, { role: 'manager', permissions: ['level:create', 'user:create'] });
      expect(store.canAccessAcademicHub).toBe(true);
      expect(store.canAccessManageUsers).toBe(true);
    });
  });
});
