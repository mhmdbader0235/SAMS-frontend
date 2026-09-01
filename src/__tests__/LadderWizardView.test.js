import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import LadderWizardView from '../components/LadderWizardView.vue';
import { useStructureStore, useSchoolStore } from '../store';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../store', () => ({
  useStructureStore: vi.fn(),
  useSchoolStore: vi.fn(),
}));

const iconStubs = {
  Globe: true, CheckCircle: true, ArrowRight: true, Eye: true, GitCommit: true,
  RotateCcw: true, Network: true, Plus: true, CopyPlus: true, Trash2: true,
  CalendarDays: true, Calendar: true, Save: true, Loader2: true, X: true,
  AlertCircle: true, Lock: true,
};

function makeStructureStore() {
  return {
    curriculumSetup: null,
    curriculumSetupLoaded: false,
    curriculumSetupError: null,
    ensureCurriculumSetupLoaded: vi.fn().mockResolvedValue(null),
    saveCurriculumSetup: vi.fn().mockResolvedValue(),
    setDraftCurriculumSystem: vi.fn(),
  };
}

function makeSchoolStore() {
  return {
    profile: { hemisphere: 'Northern' },
    ensureProfileLoaded: vi.fn().mockResolvedValue(),
  };
}

describe('LadderWizardView.vue Bulk Generate confirmation', () => {
  let confirmSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    useStructureStore.mockReturnValue(makeStructureStore());
    useSchoolStore.mockReturnValue(makeSchoolStore());
    confirmSpy = vi.spyOn(window, 'confirm');
  });

  // executeBulkAdd/bulkForm/structureState are internal to <script setup>
  // and not defineExpose'd (only the wizard-shell-driving methods are) --
  // reached here via Vue Test Utils' documented escape hatch for
  // script-setup internals, since the behavior under test (the confirm
  // gate) doesn't warrant expanding the component's public surface.
  function setupState(wrapper) {
    return wrapper.vm.$.setupState;
  }

  it('asks for confirmation before regenerating sections that already exist', async () => {
    confirmSpy.mockReturnValue(false); // decline -- must not wipe anything
    const wrapper = mount(LadderWizardView, { global: { stubs: iconStubs } });
    await flushPromises();

    const state = setupState(wrapper);
    state.structureState.levels = [
      {
        ordinal: 1, isced_level: 1, name: 'Grade 1', is_active: true,
        sections: [{ name: 'Grade 1 - A', suffix: 'A', capacity: 25 }],
      },
    ];
    state.bulkForm = { targetIsced: [1], count: 3 };

    state.executeBulkAdd();

    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(confirmSpy.mock.calls[0][0]).toMatch(/replace/i);
    // Declined -- the hand-tuned section must survive untouched.
    expect(state.structureState.levels[0].sections).toHaveLength(1);
    expect(state.structureState.levels[0].sections[0].name).toBe('Grade 1 - A');
  });

  it('regenerates without asking when the targeted grades have no existing sections', async () => {
    const wrapper = mount(LadderWizardView, { global: { stubs: iconStubs } });
    await flushPromises();

    const state = setupState(wrapper);
    state.structureState.levels = [
      { ordinal: 1, isced_level: 1, name: 'Grade 1', is_active: true, sections: [] },
    ];
    state.bulkForm = { targetIsced: [1], count: 2 };

    state.executeBulkAdd();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(state.structureState.levels[0].sections).toHaveLength(2);
  });

  it('proceeds and replaces sections when the admin confirms', async () => {
    confirmSpy.mockReturnValue(true);
    const wrapper = mount(LadderWizardView, { global: { stubs: iconStubs } });
    await flushPromises();

    const state = setupState(wrapper);
    state.structureState.levels = [
      {
        ordinal: 1, isced_level: 1, name: 'Grade 1', is_active: true,
        sections: [{ name: 'Grade 1 - Custom Name', suffix: 'Custom Name', capacity: 40 }],
      },
    ];
    state.bulkForm = { targetIsced: [1], count: 2 };

    state.executeBulkAdd();

    expect(confirmSpy).toHaveBeenCalledOnce();
    expect(state.structureState.levels[0].sections).toHaveLength(2);
    expect(state.structureState.levels[0].sections[0].name).toBe('Grade 1 - A');
  });
});
