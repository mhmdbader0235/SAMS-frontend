import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EventPublishedCard from '../components/EventPublishedCard.vue';
import { useAuthStore } from '../store';

// Regression test for the studentId/childId payload-key mismatch: this card
// emits 'parent-enroll' and DashboardView.vue consumes it — if the emitted
// key ever drifts from `studentId` again, DashboardView's `data.studentId`
// read silently gets `undefined` and the enrollment click does nothing.

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../store', () => ({
  useAuthStore: vi.fn(),
  useSchoolStore: vi.fn(() => ({ currency: 'JPY' })),
}));

describe('EventPublishedCard.vue parent-enroll payload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({
      hasRole: (role) => role === 'parent',
      hasAnyRole: () => false,
      can: () => false,
    });
  });

  it('emits parent-enroll with a studentId key (not childId)', async () => {
    const event = {
      id: 1,
      title: 'Science Fair',
      date: new Date().toISOString(),
      class_mappings: [{ id: 10, class_id: 5, class_name: 'Class A', ticket_price: 5 }],
    };
    const children = [{ id: 42, name: 'Kid One', class_id: 5 }];

    const wrapper = mount(EventPublishedCard, {
      props: { event, enrollments: [], children },
      global: { stubs: { Clock: true, MapPin: true, CheckCircle: true, Copy: true, Trash: true, Settings: true } },
    });

    await wrapper.find('#enroll-child-10-42').trigger('click');

    const emitted = wrapper.emitted('parent-enroll');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual({ studentId: 42, mapId: 10 });
    expect(emitted[0][0]).not.toHaveProperty('childId');
  });
});
