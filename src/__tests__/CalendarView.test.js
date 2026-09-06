import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import CalendarView from '../components/CalendarView.vue';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../api', () => ({
  apiLoadClasses: vi.fn().mockResolvedValue([]),
}));

let mockWeekendDays = ['Friday', 'Saturday'];

vi.mock('../store', () => ({
  useEventStore: vi.fn(() => ({ events: [], loadEvents: vi.fn().mockResolvedValue([]) })),
  useAuthStore: vi.fn(() => ({ user: { role: 'school_admin', user_id: 1 } })),
  useSchoolStore: vi.fn(() => ({
    timezone: 'UTC',
    ensureProfileLoaded: vi.fn().mockResolvedValue(),
  })),
  useStructureStore: vi.fn(() => ({
    get curriculumSetup() {
      return { calendar: { weekend_days: mockWeekendDays } };
    },
    ensureCurriculumSetupLoaded: vi.fn().mockResolvedValue(),
  })),
}));

function headerLabels(wrapper) {
  return wrapper
    .findAll('.grid.grid-cols-7.border-b.border-gray-800.theme-card-subtle > div')
    .map((el) => el.text());
}

describe('CalendarView week grid', () => {
  it('starts the week on Sunday for a Friday/Saturday weekend school', async () => {
    mockWeekendDays = ['Friday', 'Saturday'];
    const wrapper = mount(CalendarView);
    await flushPromises();
    expect(headerLabels(wrapper)[0]).toBe('Sun');
  });

  it('starts the week on Monday for a Saturday/Sunday weekend school', async () => {
    mockWeekendDays = ['Saturday', 'Sunday'];
    const wrapper = mount(CalendarView);
    await flushPromises();
    expect(headerLabels(wrapper)[0]).toBe('Mon');
  });
});
