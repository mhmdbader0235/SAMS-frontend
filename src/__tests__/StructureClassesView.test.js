import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import StructureClassesView from '../components/StructureClassesView.vue';
import { useStructureStore } from '../store';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../api', () => ({
  apiCreateClass: vi.fn(),
  apiUpdateClass: vi.fn(),
  apiDeleteClass: vi.fn(),
  apiGetClassStudents: vi.fn(),
  apiReassignStudentClass: vi.fn(),
  apiCreateLevel: vi.fn(),
  apiUpdateLevel: vi.fn(),
  apiDeleteLevel: vi.fn(),
}));

vi.mock('../store', () => ({
  useStructureStore: vi.fn(),
}));

const iconStubs = {
  GitCommit: true, Network: true, GraduationCap: true, UserCheck: true, Filter: true,
  Search: true, Plus: true, Loader2: true, Layers: true, Edit3: true, Trash2: true,
  Users: true, Building2: true, X: true, CheckCircle: true, AlertCircle: true,
};

function makeStore({ liveLevels = [], liveClasses = [] } = {}) {
  return {
    liveLevels,
    liveClasses,
    teachersList: [],
    allStudentsList: [],
    liveStructureError: null,
    liveStructureLoading: false,
    sortedLevelsByOrdinal: [...liveLevels].sort((a, b) => (a.ordinal || 0) - (b.ordinal || 0)),
    getClassesForLevel: (levelId) => liveClasses.filter((c) => c.level_id === levelId),
    ensureLiveStructureLoaded: vi.fn().mockResolvedValue(),
    reloadLiveStructure: vi.fn().mockResolvedValue(),
  };
}

describe('StructureClassesView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the grade list on first load instead of "No Grades Displayed"', async () => {
    // Regression: selectedGradeIds started at [] with nothing to seed it,
    // so the class list -- filtered through it -- rendered permanently
    // empty even though real levels were loaded, while the filter chips
    // (which read liveLevels directly) correctly showed all of them.
    const store = makeStore({
      liveLevels: [
        { level_id: 1, name: 'Grade 1', ordinal: 1, isced_level: 1 },
        { level_id: 2, name: 'Grade 2', ordinal: 2, isced_level: 1 },
      ],
      liveClasses: [
        { id: 10, level_id: 1, name: 'Grade 1 - A', capacity: 25, head_teacher_id: null },
      ],
    });
    useStructureStore.mockReturnValue(store);

    const wrapper = mount(StructureClassesView, { global: { stubs: iconStubs } });
    await flushPromises();

    const html = wrapper.html();
    expect(html).toContain('Grade 1 - A');
    expect(html).not.toContain('No classes match');
  });

  it('does not crash opening the Edit modal for a grade name containing an unbalanced regex character class', async () => {
    // Regression: openEditClassModal interpolated the level name directly
    // into `new RegExp(...)` -- a name like "Year 7 [IB" (an unclosed `[`,
    // e.g. from a typo) threw a SyntaxError ("Unterminated character
    // class") inside the click handler, so the modal never opened and
    // nothing visible indicated why. A *balanced* bracket like "[IB]" is
    // actually valid regex and does not reproduce this -- the bug needs a
    // genuinely malformed pattern.
    const store = makeStore({
      liveLevels: [{ level_id: 1, name: 'Year 7 [IB', ordinal: 1, isced_level: 2 }],
      liveClasses: [
        { id: 10, level_id: 1, name: 'Year 7 [IB - A', capacity: 25, head_teacher_id: null },
      ],
    });
    useStructureStore.mockReturnValue(store);

    const wrapper = mount(StructureClassesView, { global: { stubs: iconStubs } });
    await flushPromises();

    const editButton = wrapper.find('button[title="Edit Section"]');
    expect(editButton.exists()).toBe(true);

    await editButton.trigger('click');
    await flushPromises();

    // The modal must actually open -- proving the click handler ran to
    // completion instead of throwing partway through before reaching
    // `showClassModal.value = true`.
    expect(wrapper.html()).toContain('Edit Class Section');
  });
});
