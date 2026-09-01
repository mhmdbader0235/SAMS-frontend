import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import LayoutSidebar from '../components/LayoutSidebar.vue';
import { useAuthStore } from '../store';

const RouterLinkStub = defineComponent({
  name: 'RouterLink',
  props: ['to', 'custom'],
  template: '<div><slot :navigate="() => {}" :isActive="false"></slot></div>'
});

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useRoute: () => ({
    path: '/',
    query: {},
  })
}));

// Mock pinia store
vi.mock('../store', () => ({
  useAuthStore: vi.fn(),
  useSchoolStore: vi.fn(() => ({
    profile: null,
    displayName: 'Test School',
    setupStateLoaded: true,
    isLive: true,
    ensureProfileLoaded: vi.fn().mockResolvedValue()
  }))
}));

describe('LayoutSidebar.vue Role Testing', () => {
  let mockAuthStore;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore = {
      logout: vi.fn(),
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      can: vi.fn(),
      // LayoutSidebar.vue's per-link v-ifs (Grades & Class Sections, Student
      // Placement, Curriculum Wizard vs. Students & Families) now delegate
      // straight to these two getters (the single definitions shared with
      // router.js, ManageUsersView.vue and ManageStructureView.vue) rather
      // than re-deriving visibility from hasRole/can themselves, so each
      // test below sets them directly rather than relying on the component
      // to recompute them. Their own role/permission resolution logic is
      // exercised against the real store in store.test.js instead -- that's
      // where it actually lives now.
      canAccessAcademicHub: false,
      canAccessManageUsers: false,
    };
    useAuthStore.mockReturnValue(mockAuthStore);
  });

  // The component reads route info two ways: `useRoute()` in <script setup>
  // (mocked above) and the legacy `$route` template global, which only
  // exists in a real app because the router plugin injects it via
  // app.use(router). No router is installed here, so it must be supplied
  // as a global mock or `$route.path` throws on every mount.
  const mountOptions = {
    global: {
      mocks: { $route: { path: '/', query: {} } },
      stubs: { RouterLink: RouterLinkStub, GraduationCap: true, LayoutDashboard: true, Calendar: true, UserCircle: true, ShieldCheck: true, LogOut: true, Users: true, Layers: true, CalendarDays: true, KeyRound: true, ChevronDown: true, FolderOpen: true }
    }
  };

  it('renders correctly for a Student (limited access)', () => {
    // Setup Student capabilities
    mockAuthStore.hasRole.mockImplementation(role => role === 'student');
    mockAuthStore.hasAnyRole.mockReturnValue(false);
    mockAuthStore.can.mockImplementation(action => {
      // Students can't do much
      const allowed = ['event:read', 'event:view'];
      return allowed.includes(action);
    });

    const wrapper = mount(LayoutSidebar, mountOptions);

    const html = wrapper.html();

    // Should see Dashboard and Calendar
    expect(html).toContain('Dashboard &amp; Overview');
    expect(html).toContain('School Calendar');
    expect(html).toContain('My Account');

    // Should NOT see Admin, Operations, or Teaching Hub
    // Note: 'Academic Admin' is deliberately avoided as a match string here —
    // it's a substring of the always-present HTML comment "<!-- Section 2:
    // Academic Administration -->", which would make this assertion pass
    // regardless of whether the actual gated section renders.
    expect(html).not.toContain('Events &amp; Teaching');
    expect(html).not.toContain('Plan Trip / Event');
    expect(html).not.toContain('Grades &amp; Class Sections');
  });

  it('renders correctly for a Teacher', () => {
    // Setup Teacher capabilities
    mockAuthStore.hasRole.mockImplementation(role => role === 'teacher');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('teacher'));
    mockAuthStore.can.mockImplementation(action => {
      const allowed = ['event:create', 'class:read'];
      return allowed.includes(action);
    });

    const wrapper = mount(LayoutSidebar, mountOptions);

    const html = wrapper.html();

    // Teacher should see Operations and Teaching Hub
    expect(html).toContain('Events &amp; Teaching');
    expect(html).toContain('Plan Trip / Event');
    expect(html).toContain('My Assigned Class');

    expect(html).not.toContain('Grades &amp; Class Sections');
  });

  it('hides the whole Academic Admin section whenever both gates are false, regardless of other roles/permissions', () => {
    // Wiring test: the section header and every one of its links must track
    // authStore.canAccessAcademicHub / canAccessManageUsers and nothing
    // else. It used to be a single local OR-chain covering the whole section
    // as one unit (`can('user:view') || can('level:manage') ||
    // can('user:invite') || hasAnyRole([...])`), and a real leak slipped
    // through it -- teacher genuinely holds 'user:view' in
    // COMPOSITE_ROLE_PERMISSIONS (needed elsewhere, to view user profile
    // info), so that OR-chain showed the whole "Academic Admin" section,
    // including /manage/users and the Academic Administration Hub, to every
    // teacher. The getters' own role/permission resolution logic (what
    // actually prevents that leak now) is exercised against the real store
    // in store.test.js -- this test only proves the sidebar honors whatever
    // they say, even when hasRole/can would otherwise suggest access.
    mockAuthStore.hasRole.mockImplementation(role => role === 'teacher');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('teacher'));
    mockAuthStore.can.mockImplementation(action => action === 'user:view');
    mockAuthStore.canAccessAcademicHub = false;
    mockAuthStore.canAccessManageUsers = false;

    const wrapper = mount(LayoutSidebar, mountOptions);
    const html = wrapper.html();

    expect(html).not.toContain('Grades &amp; Class Sections');
    expect(html).not.toContain('Students &amp; Families');
    expect(html).not.toContain('Curriculum Wizard');
  });

  it('a manager granted ONLY user:create sees Students & Families but not the Academic Hub links', () => {
    // This is the actual point of splitting the single gate in two: holding
    // one granted permission surfaces the specific page it unlocks, not the
    // whole admin area. canAccessManageUsers/canAccessAcademicHub are mocked
    // here exactly as the real getters would resolve them for this grant
    // (see the matching case in store.test.js) -- this test only checks the
    // sidebar renders the right links for that combination.
    mockAuthStore.hasRole.mockImplementation(role => role === 'manager');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('manager'));
    mockAuthStore.can.mockImplementation(action => action === 'user:create');
    mockAuthStore.canAccessAcademicHub = false;
    mockAuthStore.canAccessManageUsers = true;

    const html = mount(LayoutSidebar, mountOptions).html();

    expect(html).toContain('Students &amp; Families');
    expect(html).not.toContain('Grades &amp; Class Sections');
    // '</span>' disambiguates from the always-present HTML comment
    // "<!-- 2. Student Placement -->" above the actual gated nav link,
    // which also contains the bare substring "Student Placement".
    expect(html).not.toContain('Student Placement</span>');
    expect(html).not.toContain('Curriculum Wizard');
  });

  it('a manager granted ONLY level:create sees the Academic Hub links but not Students & Families', () => {
    mockAuthStore.hasRole.mockImplementation(role => role === 'manager');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('manager'));
    mockAuthStore.can.mockImplementation(action => action === 'level:create');
    mockAuthStore.canAccessAcademicHub = true;
    mockAuthStore.canAccessManageUsers = false;

    const html = mount(LayoutSidebar, mountOptions).html();

    expect(html).toContain('Grades &amp; Class Sections');
    // '</span>' disambiguates from the always-present HTML comment
    // "<!-- 2. Student Placement -->", which also contains this bare
    // substring -- without it, this assertion would pass even if the link
    // never actually rendered.
    expect(html).toContain('Student Placement</span>');
    expect(html).not.toContain('Students &amp; Families');
  });

  it('a manager granted user:link sees "System Admin" (the parent-student linking page)', () => {
    // "System Admin" was the last role-only sidebar link (hasRole('super_admin')
    // || hasRole('school_admin'), no permission escape hatch at all) -- despite
    // its name, the page it opens (ManageAdminView.vue) is purely parent-student
    // linking. user:link is the real, cataloged permission for exactly that
    // action (TenantService.link_student_parent); it existed in
    // COMPOSITE_ROLE_PERMISSIONS but was never actually checked anywhere until
    // now, so granting it previously did nothing.
    mockAuthStore.hasRole.mockImplementation(role => role === 'manager');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('manager'));
    mockAuthStore.can.mockImplementation(action => action === 'user:link');
    mockAuthStore.canAccessAcademicHub = false;
    mockAuthStore.canAccessManageUsers = false;

    const html = mount(LayoutSidebar, mountOptions).html();

    // Matched with the closing tag, not just 'System Admin', because that bare
    // substring also appears in the always-present HTML comment "<!-- 6.
    // System Admin Panel -->" above the actual gated nav link.
    expect(html).toContain('System Admin</span>');
    expect(html).not.toContain('Grades &amp; Class Sections');
    expect(html).not.toContain('Students &amp; Families');
  });

  it('does NOT show "Permission Control Center" for a manager granted every other permission -- it stays super_admin-only', () => {
    // Deliberately excluded from the permission-escape-hatch treatment: this
    // page is the tool that GRANTS permissions/roles in the first place, so
    // letting a delegated permission open it would be a real escalation path
    // (grant yourself more grants), not a convenience. Mirrors why
    // create_school_admin has no user:create escape hatch on the backend.
    mockAuthStore.hasRole.mockImplementation(role => role === 'manager');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('manager'));
    mockAuthStore.can.mockReturnValue(true); // even a maximally-permissive grant
    mockAuthStore.canAccessAcademicHub = true;
    mockAuthStore.canAccessManageUsers = true;

    const html = mount(LayoutSidebar, mountOptions).html();

    // '</span>' disambiguates from the always-present HTML comment "<!-- 7.
    // Permission Control Center -- super_admin only, ... -->", which also
    // contains this bare substring.
    expect(html).not.toContain('Permission Control Center</span>');
  });

  it('renders correctly for a School Admin', () => {
    // Setup Admin capabilities
    mockAuthStore.hasRole.mockImplementation(role => role === 'school_admin');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('school_admin'));
    mockAuthStore.can.mockReturnValue(true); // admin can do everything
    mockAuthStore.canAccessAcademicHub = true;
    mockAuthStore.canAccessManageUsers = true;

    const wrapper = mount(LayoutSidebar, mountOptions);

    const html = wrapper.html();

    // Admin should see absolutely everything
    expect(html).toContain('Dashboard &amp; Overview');
    expect(html).toContain('Events &amp; Teaching');
    expect(html).toContain('Plan Trip / Event');
    expect(html).toContain('Grades &amp; Class Sections');
    expect(html).toContain('Students &amp; Families');
    // Matched with the closing tag, not just 'System Admin', because that
    // bare substring also appears in the always-present HTML comment
    // "<!-- 6. System Admin Panel -->" above the actual gated nav link.
    expect(html).toContain('System Admin</span>');
  });
});
