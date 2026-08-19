<template>
  <div class="min-h-screen pb-32 space-y-6 max-w-7xl mx-auto">

    <!-- Top Header & Domain Section Switcher -->
    <div class="theme-card rounded p-6 shadow-xs border border-slate-200 bg-white relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div class="flex items-center gap-4 relative z-10">
        <div class="w-12 h-12 rounded bg-blue-50 border border-blue-200 flex items-center justify-center relative z-10 shrink-0">
          <Layers class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-slate-900 tracking-tight">Academic Administration Hub</h2>
            <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {{ structureStore.currentSystemName }} Standard
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium mt-1">Manage school grades, class sections (up to 25 per grade), student placements, and curriculum ladder</p>
        </div>
      </div>

      <!-- Main Domain Tabs Switcher -->
      <div class="flex items-center p-1 bg-slate-100 rounded border border-slate-200 relative z-10 self-start lg:self-auto flex-wrap gap-1">
        <button
          @click="switchTab('manage')"
          class="px-3.5 py-2 rounded text-xs font-bold transition-all flex items-center gap-2"
          :class="activeMainTab === 'manage' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
        >
          <Building2 class="w-4 h-4 text-blue-600" /> Live Structure & Classes
        </button>
        <button
          @click="switchTab('enrollment')"
          class="px-3.5 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 relative"
          :class="activeMainTab === 'enrollment' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
        >
          <UserPlus class="w-4 h-4 text-indigo-600" /> Student Class Placement
          <span v-if="structureStore.unassignedStudentsCount > 0" class="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-400 text-slate-950 ml-1">
            {{ structureStore.unassignedStudentsCount }}
          </span>
        </button>
        <button
          @click="switchTab('setup')"
          class="px-3.5 py-2 rounded text-xs font-bold transition-all flex items-center gap-2"
          :class="activeMainTab === 'setup' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
        >
          <Sliders class="w-4 h-4 text-sky-600" /> Setup & Ladder Wizard
        </button>
      </div>
    </div>

    <KeepAlive>
      <component :is="activeTabComponent" />
    </KeepAlive>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Layers, Building2, Sliders, UserPlus } from 'lucide-vue-next';
import { useStructureStore } from '../store';
import StructureClassesView from './StructureClassesView.vue';
import StudentPlacementView from './StudentPlacementView.vue';
import LadderWizardView from './LadderWizardView.vue';

const route = useRoute();
const router = useRouter();
const structureStore = useStructureStore();

// Prime the shared data at the top level of setup, before any child mounts,
// so children's own defensive ensure*() calls resolve against an in-flight
// (or already-resolved) promise instead of triggering a second fetch.
structureStore.ensureLiveStructureLoaded();
structureStore.ensureCurriculumSetupLoaded();

// Main Domain Tabs: 'manage' (Live Structure) | 'enrollment' (Student Placement) | 'setup' (Wizard & Ladder)
const syncTabWithRoute = () => {
  const p = (route.path || '').toLowerCase();
  const q = route.query.tab;
  if (p.includes('placement') || p.includes('enrollment') || q === 'enrollment') {
    return 'enrollment';
  } else if (p.includes('ladder') || p.includes('wizard') || p.includes('setup') || q === 'setup') {
    return 'setup';
  }
  return 'manage';
};

const activeMainTab = computed(() => syncTabWithRoute());

const activeTabComponent = computed(() => {
  if (activeMainTab.value === 'enrollment') return StudentPlacementView;
  if (activeMainTab.value === 'setup') return LadderWizardView;
  return StructureClassesView;
});

const switchTab = (tabName) => {
  if (tabName === 'manage') {
    router.replace({ path: '/manage/structure' }).catch(() => {});
  } else if (tabName === 'enrollment') {
    router.replace({ path: '/manage/placement' }).catch(() => {});
  } else if (tabName === 'setup') {
    router.replace({ path: '/manage/ladder-wizard' }).catch(() => {});
  }
};
</script>
