import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DashboardView from '../components/DashboardView.vue';
import { useAuthStore } from '../store';

// Mock the router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock pinia store
vi.mock('../store', () => ({
  useAuthStore: vi.fn(),
  useEventStore: vi.fn(() => ({ loadEvents: vi.fn(), events: [], loading: false, error: null })),
  useNotificationStore: vi.fn(() => ({ loadNotifications: vi.fn(), notifications: [], loading: false, error: null }))
}));

// Mock lucid icons used in DashboardView
const mockLucideIcons = {
  template: '<i><slot /></i>'
};

describe('DashboardView.vue Role Testing', () => {
  let mockAuthStore;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore = {
      user: { email: 'test@example.com', name: 'Test User' },
      activePerspective: 'all',
      hasRole: vi.fn(),
      hasAnyRole: vi.fn(),
      can: vi.fn(),
      hasMultipleRoles: false,
      setActivePerspective: vi.fn(),
      activeRoles: []
    };
    useAuthStore.mockReturnValue(mockAuthStore);
  });

  const mountDashboard = () => {
    return mount(DashboardView, {
      global: {
        stubs: {
          RouterLink: true,
          Plus: mockLucideIcons,
          Clock: mockLucideIcons,
          CheckCircle: mockLucideIcons,
          MapPin: mockLucideIcons,
          Settings: mockLucideIcons
        }
      }
    });
  };

  it('renders correctly for a Student without Perspective Switcher', () => {
    mockAuthStore.user.role = 'student';
    mockAuthStore.activeRoles = ['student'];
    mockAuthStore.hasRole.mockImplementation(role => role === 'student');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('student'));
    mockAuthStore.hasMultipleRoles = false;
    mockAuthStore.can.mockReturnValue(false); // Can't create events

    const wrapper = mountDashboard();
    const html = wrapper.html();

    // Perspective Switcher should NOT be rendered
    expect(html).not.toContain('Unified Overview');
    expect(html).not.toContain('Teacher Hub');
    
    // Create Event button should NOT be rendered
    expect(html).not.toContain('Create Event Proposal');
  });

  it('renders correctly for a Teacher with ability to create events', () => {
    mockAuthStore.user.role = 'teacher';
    mockAuthStore.activeRoles = ['teacher'];
    mockAuthStore.hasRole.mockImplementation(role => role === 'teacher');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('teacher'));
    mockAuthStore.hasMultipleRoles = false;
    mockAuthStore.can.mockImplementation(action => action === 'event:create');

    const wrapper = mountDashboard();
    const html = wrapper.html();

    // Perspective Switcher should NOT be rendered (since they are only a teacher)
    expect(html).not.toContain('Unified Overview');
    
    // Create Event button SHOULD be rendered
    expect(html).toContain('Create Event Proposal');
  });

  it('renders Perspective Switcher for Multi-Role Users', () => {
    mockAuthStore.user.role = 'teacher';
    mockAuthStore.activeRoles = ['teacher', 'parent'];
    mockAuthStore.hasRole.mockImplementation(role => ['teacher', 'parent'].includes(role));
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.some(r => ['teacher', 'parent'].includes(r)));
    mockAuthStore.hasMultipleRoles = true;
    mockAuthStore.activePerspective = 'all';

    const wrapper = mountDashboard();
    const html = wrapper.html();

    // Perspective Switcher SHOULD be rendered with relevant buttons
    expect(html).toContain('Unified Overview');
    expect(html).toContain('Teacher Hub');
    expect(html).toContain('Parent Portal');

    // Should NOT contain roles the user doesn't have
    expect(html).not.toContain('Manager Review');
    expect(html).not.toContain('System Admin');
  });

});
