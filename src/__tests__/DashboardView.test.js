import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
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
  useNotificationStore: vi.fn(() => ({ loadNotifications: vi.fn(), notifications: [], loading: false, error: null })),
  useSchoolStore: vi.fn(() => ({ currency: 'JPY', ensureProfileLoaded: vi.fn().mockResolvedValue() }))
}));

// Mock the API module — DashboardView's onMounted awaits several of these
// directly (not through the store), so without this mock every mount fires
// real, unmocked HTTP requests through jsdom that fail with ECONNREFUSED.
// That doesn't throw (each caller in the component has its own try/catch),
// but it makes the async onMounted chain race real network timing instead
// of resolving deterministically on the microtask queue.
vi.mock('../api', () => ({
  apiCreateEnrollment: vi.fn().mockResolvedValue({}),
  apiLoadEnrollments: vi.fn().mockResolvedValue([]),
  apiCancelEnrollment: vi.fn().mockResolvedValue({}),
  apiPayEnrollment: vi.fn().mockResolvedValue({}),
  apiUpdateEnrollmentApproval: vi.fn().mockResolvedValue({}),
  apiLoadLinkedStudents: vi.fn().mockResolvedValue([]),
  apiGetPayment: vi.fn().mockResolvedValue({}),
  apiCreateFeedback: vi.fn().mockResolvedValue({}),
  apiLoadFeedbacks: vi.fn().mockResolvedValue([]),
  apiLoadClasses: vi.fn().mockResolvedValue([]),
  apiLoadManagerQueue: vi.fn().mockResolvedValue([]),
  apiLoadPublishedEvents: vi.fn().mockResolvedValue([]),
  apiManagerDecision: vi.fn().mockResolvedValue({}),
  apiGetEventResources: vi.fn().mockResolvedValue([]),
  apiUpdateResourceCost: vi.fn().mockResolvedValue({}),
  apiUpdateResourceLine: vi.fn().mockResolvedValue({}),
  apiGetResourceTypes: vi.fn().mockResolvedValue([]),
  apiUpdateTicketPrices: vi.fn().mockResolvedValue({}),
  apiUpdateEventSubsidy: vi.fn().mockResolvedValue({}),
  apiCloneEvent: vi.fn().mockResolvedValue({}),
  apiEventTeacherDecision: vi.fn().mockResolvedValue({}),
  apiDeleteEvent: vi.fn().mockResolvedValue({}),
  apiSubmitEvent: vi.fn().mockResolvedValue({}),
  apiPublishEvent: vi.fn().mockResolvedValue({})
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

  it('renders correctly for a Student without Perspective Switcher', async () => {
    mockAuthStore.user.role = 'student';
    mockAuthStore.activeRoles = ['student'];
    mockAuthStore.hasRole.mockImplementation(role => role === 'student');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('student'));
    mockAuthStore.hasMultipleRoles = false;
    mockAuthStore.can.mockReturnValue(false); // Can't create events

    const wrapper = mountDashboard();
    await flushPromises();
    const html = wrapper.html();

    // Perspective Switcher should NOT be rendered
    expect(html).not.toContain('Unified Overview');
    expect(html).not.toContain('Teacher Hub');
    
    // Create Event button should NOT be rendered
    expect(html).not.toContain('Create Event Proposal');
  });

  it('renders correctly for a Teacher with ability to create events', async () => {
    mockAuthStore.user.role = 'teacher';
    mockAuthStore.activeRoles = ['teacher'];
    mockAuthStore.hasRole.mockImplementation(role => role === 'teacher');
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.includes('teacher'));
    mockAuthStore.hasMultipleRoles = false;
    mockAuthStore.can.mockImplementation(action => action === 'event:create');

    const wrapper = mountDashboard();
    await flushPromises();
    const html = wrapper.html();

    // Perspective Switcher should NOT be rendered (since they are only a teacher)
    expect(html).not.toContain('Unified Overview');
    
    // Create Event button SHOULD be rendered
    expect(html).toContain('Create Event Proposal');
  });

  it('renders Perspective Switcher for Multi-Role Users', async () => {
    mockAuthStore.user.role = 'teacher';
    mockAuthStore.activeRoles = ['teacher', 'parent'];
    mockAuthStore.hasRole.mockImplementation(role => ['teacher', 'parent'].includes(role));
    mockAuthStore.hasAnyRole.mockImplementation(roles => roles.some(r => ['teacher', 'parent'].includes(r)));
    mockAuthStore.hasMultipleRoles = true;
    mockAuthStore.activePerspective = 'all';

    const wrapper = mountDashboard();
    await flushPromises();
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
