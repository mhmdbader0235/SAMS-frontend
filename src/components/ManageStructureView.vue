<template>
  <!-- Hard block for anyone without academic-hub access -- the Academic
       Administration Hub (grades, class sections, student placement,
       curriculum wizard) is school_admin/super_admin only, plus whoever an
       admin has explicitly granted level:create/level:manage/class:create/
       class:update to via Manage Permissions (see
       authStore.canAccessAcademicHub in store.js, the single shared
       definition). Presentation only: every mutation reachable from here is
       independently rejected by the backend regardless of what renders here
       (TenantService._has_intersection checks in tenant/service.py). Mirrors
       the same pattern in ManageUsersView.vue. -->
  <div v-if="isBlockedFromAdminHub" class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-md text-center space-y-3">
      <div class="w-12 h-12 mx-auto rounded bg-rose-50 border border-rose-200 flex items-center justify-center">
        <ShieldAlert class="w-6 h-6 text-rose-600" />
      </div>
      <h2 class="text-base font-bold text-slate-900">Access Denied</h2>
      <p class="text-sm text-slate-600">You do not have access to the Academic Administration Hub. Redirecting…</p>
    </div>
  </div>
  <div v-else class="min-h-screen space-y-6 max-w-7xl mx-auto">

    <!-- Top Header -->
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
    </div>

    <KeepAlive>
      <component :is="activeTabComponent" />
    </KeepAlive>

  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Layers, ShieldAlert } from 'lucide-vue-next';
import { useStructureStore, useAuthStore } from '../store';
import StructureClassesView from './StructureClassesView.vue';
import StudentPlacementView from './StudentPlacementView.vue';
import LadderWizardView from './LadderWizardView.vue';

const route = useRoute();
const router = useRouter();
const structureStore = useStructureStore();
const authStore = useAuthStore();

// Mirrors authStore.canAccessAcademicHub (the single shared definition --
// see store.js). router.js's beforeEach already blocks the fast path (SPA
// navigation, user already loaded); this covers the hard-reload case, where
// authStore.user is still null when the component first mounts and only
// resolves after fetchMe() completes. Mirrors the same pattern in
// ManageUsersView.vue (which checks canAccessManageUsers instead).
const isBlockedFromAdminHub = computed(() =>
  !!authStore.user && !authStore.canAccessAcademicHub
);
watch(isBlockedFromAdminHub, (blocked) => {
  if (blocked) router.replace('/');
}, { immediate: true });

// Prime the shared data at the top level of setup, before any child mounts,
// so children's own defensive ensure*() calls resolve against an in-flight
// (or already-resolved) promise instead of triggering a second fetch. Skipped
// when a disallowed viewer is about to be redirected off this page -- not a
// security concern either way (these are reads many roles already have
// elsewhere), just no reason to fire them during a redirect that's already
// in flight.
if (!isBlockedFromAdminHub.value) {
  structureStore.ensureLiveStructureLoaded();
  structureStore.ensureCurriculumSetupLoaded();
}

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
</script>
