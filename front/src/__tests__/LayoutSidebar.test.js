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
  })
}));

// Mock pinia store
vi.mock('../store', () => ({
  useAuthStore: vi.fn()
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

  it('renders correctly for a Student (limited access)', () => {
    // Setup Student capabilities
    mockAuthStore.hasRole.mockImplementation(role => role === 'student');
    mockAuthStore.hasAnyRole.mockReturnValue(false);
    mockAuthStore.can.mockImplementation(action => {
      // Students can't do much
      const allowed = ['event:read', 'event:view'];
      return allowed.includes(action);
    });

    const wrapper = mount(LayoutSidebar, {
      global: {
        stubs: { RouterLink: RouterLinkStub, GraduationCap: true, LayoutDashboard: true, Calendar: true, UserCircle: true, ShieldCheck: true, LogOut: true, Users: true, Layers: true, CalendarDays: true, KeyRound: true, ChevronDown: true, FolderOpen: true }
      }
    });

    const html = wrapper.html();

    // Should see Dashboard and Calendar
    expect(html).toContain('Overview &amp; Dashboard');
    expect(html).toContain('Global Calendar');
    expect(html).toContain('My Profile');

    // Should NOT see Admin, Operations, or Teaching Hub
    expect(html).not.toContain('Event Operations');
    expect(html).not.toContain('My Teaching Hub');
    expect(html).not.toContain('Administration &amp; Settings');
  });

  it('renders correctly for a Teacher', () => {
    // Setup Teacher capabilities
    mockAuthStore.hasRole.mockImplementation(role => role === 'teacher');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('teacher'));
    mockAuthStore.can.mockImplementation(action => {
      const allowed = ['event:create', 'class:read'];
      return allowed.includes(action);
    });

    const wrapper = mount(LayoutSidebar, {
      global: {
        stubs: { RouterLink: RouterLinkStub, GraduationCap: true, LayoutDashboard: true, Calendar: true, UserCircle: true, ShieldCheck: true, LogOut: true, Users: true, Layers: true, CalendarDays: true, KeyRound: true, ChevronDown: true, FolderOpen: true }
      }
    });

    const html = wrapper.html();

    // Teacher should see Operations and Teaching Hub
    expect(html).toContain('Event Operations');
    expect(html).toContain('My Teaching Hub');
    
    expect(html).not.toContain('Administration &amp; Settings');
  });

  it('renders correctly for a School Admin', () => {
    // Setup Admin capabilities
    mockAuthStore.hasRole.mockImplementation(role => role === 'school_admin');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('school_admin'));
    mockAuthStore.can.mockReturnValue(true); // admin can do everything

    const wrapper = mount(LayoutSidebar, {
      global: {
        stubs: { RouterLink: RouterLinkStub, GraduationCap: true, LayoutDashboard: true, Calendar: true, UserCircle: true, ShieldCheck: true, LogOut: true, Users: true, Layers: true, CalendarDays: true, KeyRound: true, ChevronDown: true, FolderOpen: true }
      }
    });

    const html = wrapper.html();

    // Admin should see absolutely everything
    expect(html).toContain('Overview &amp; Dashboard');
    expect(html).toContain('Event Operations');
    expect(html).toContain('My Teaching Hub');
    expect(html).toContain('Administration &amp; Settings');
    expect(html).toContain('System Admin Panel');
  });
});
