<template>
  <div class="space-y-6 animation-fade-in">
    <div>
      <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <Rocket class="w-5 h-5 text-blue-600" /> Review &amp; Activate
      </h3>
      <p class="text-xs text-slate-500 mt-1">Once activated, the dashboard and every workspace module unlock. The curriculum system (not the grades or class sections themselves) locks permanently at this point.</p>
    </div>

    <transition name="fade">
      <div v-if="errorMsg" class="p-3.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 font-semibold flex items-center gap-2.5 shadow-xs">
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
        <span>{{ errorMsg }}</span>
      </div>
    </transition>

    <div class="grid md:grid-cols-2 gap-4">
      <div class="theme-card rounded p-5 border border-slate-200 bg-white shadow-xs space-y-3">
        <h4 class="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Building2 class="w-3.5 h-3.5 text-blue-600" /> School Information
        </h4>
        <div class="text-xs space-y-1.5">
          <div class="flex justify-between"><span class="text-slate-500">Legal Name</span><span class="font-semibold text-slate-900">{{ profile?.legal_name || '—' }}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">School Code</span><span class="font-semibold text-slate-900">{{ profile?.school_code || '—' }}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Currency</span><span class="font-semibold text-slate-900">{{ profile?.currency || '—' }}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Campuses</span><span class="font-semibold text-slate-900">{{ (profile?.campuses || []).length }}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Contacts</span><span class="font-semibold text-slate-900">{{ (profile?.contacts || []).length }} ({{ emergencyContactCount }} emergency)</span></div>
        </div>
      </div>

      <div class="theme-card rounded p-5 border border-slate-200 bg-white shadow-xs space-y-3">
        <h4 class="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <GitCommit class="w-3.5 h-3.5 text-blue-600" /> Academic Structure
        </h4>
        <div class="text-xs space-y-1.5">
          <div class="flex justify-between"><span class="text-slate-500">Curriculum System</span><span class="font-semibold text-slate-900">{{ structureStore.currentSystemName }}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Active Grades</span><span class="font-semibold text-slate-900">{{ activeGradeCount }}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Class Sections</span><span class="font-semibold text-slate-900">{{ sectionCount }}</span></div>
        </div>
      </div>
    </div>

    <div v-if="blocking.length" class="theme-card rounded p-5 border border-amber-200 bg-amber-50 shadow-xs space-y-3">
      <h4 class="font-bold text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
        <AlertTriangle class="w-3.5 h-3.5" /> Before you can activate
      </h4>
      <ul class="text-xs text-amber-800 space-y-1.5 list-disc list-inside">
        <li v-for="(item, idx) in blocking" :key="idx">{{ item }}</li>
      </ul>
    </div>
    <div v-else class="theme-card rounded p-5 border border-emerald-200 bg-emerald-50 shadow-xs flex items-center gap-2.5">
      <CheckCircle class="w-4 h-4 text-emerald-600 shrink-0" />
      <span class="text-xs font-semibold text-emerald-800">Everything is configured. You're ready to activate {{ profile?.display_name || 'your school' }}.</span>
    </div>

    <button
      @click="handleActivate"
      :disabled="blocking.length > 0 || isActivating"
      class="btn-primary w-full font-bold px-6 py-3 rounded text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Loader2 class="w-4 h-4 animate-spin" v-if="isActivating" />
      <Rocket class="w-4 h-4" v-else />
      {{ isActivating ? 'Activating…' : `Activate ${profile?.display_name || 'School'}` }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Rocket, Building2, GitCommit, AlertTriangle, CheckCircle, Loader2, AlertCircle
} from 'lucide-vue-next';
import { useSchoolStore, useStructureStore } from '../../store';

const emit = defineEmits(['activated']);

const schoolStore = useSchoolStore();
const structureStore = useStructureStore();

const isActivating = ref(false);
const errorMsg = ref(null);

const profile = computed(() => schoolStore.profile);
const blocking = computed(() => schoolStore.setupState?.blocking || []);
const emergencyContactCount = computed(() => (profile.value?.contacts || []).filter(c => c.is_emergency_contact).length);
const activeGradeCount = computed(() => structureStore.liveLevels.filter(l => l.is_active !== false).length);
const sectionCount = computed(() => structureStore.liveClasses.length);

const handleActivate = async () => {
  errorMsg.value = null;
  isActivating.value = true;
  try {
    await schoolStore.activate();
    await structureStore.reloadLiveStructure();
    emit('activated');
  } catch (err) {
    errorMsg.value = err.message || 'Failed to activate school';
  } finally {
    isActivating.value = false;
  }
};

onMounted(async () => {
  await schoolStore.ensureProfileLoaded(true);
  await schoolStore.reloadSetupState();
  await structureStore.reloadLiveStructure();
});
</script>
