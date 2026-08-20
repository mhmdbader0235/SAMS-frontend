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
      can: vi.fn()
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

  it('renders correctly for a School Admin', () => {
    // Setup Admin capabilities
    mockAuthStore.hasRole.mockImplementation(role => role === 'school_admin');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('school_admin'));
    mockAuthStore.can.mockReturnValue(true); // admin can do everything

    const wrapper = mount(LayoutSidebar, mountOptions);

    const html = wrapper.html();

    // Admin should see absolutely everything
    expect(html).toContain('Dashboard &amp; Overview');
    expect(html).toContain('Events &amp; Teaching');
    expect(html).toContain('Plan Trip / Event');
    expect(html).toContain('Grades &amp; Class Sections');
    // Matched with the closing tag, not just 'System Admin', because that
    // bare substring also appears in the always-present HTML comment
    // "<!-- 6. System Admin Panel -->" above the actual gated nav link.
    expect(html).toContain('System Admin</span>');
  });
});
