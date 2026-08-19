<template>
  <div class="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col">

    <!-- Brand Header -->
    <header class="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded bg-blue-600 flex items-center justify-center shrink-0 text-white shadow-xs">
          <GraduationCap class="w-4 h-4" />
        </div>
        <div>
          <h1 class="text-xs font-black text-slate-900 tracking-tight leading-none">SchoolDesk</h1>
          <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 block">School Setup</span>
        </div>
      </div>
      <button @click="handleLogout" class="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors">
        <LogOut class="w-3.5 h-3.5" /> Sign Out
      </button>
    </header>

    <!-- Top Stepper -->
    <div class="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 overflow-x-auto shrink-0">
      <div class="max-w-5xl mx-auto flex items-center gap-1.5 min-w-max">
        <template v-for="(label, idx) in STEP_LABELS" :key="label">
          <div class="flex items-center gap-1.5">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              :class="stepDotClass(idx + 1)">
              <Check v-if="idx + 1 < currentMainStep" class="w-3 h-3" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wide hidden sm:inline"
              :class="idx + 1 === currentMainStep ? 'text-blue-700' : 'text-slate-400'">{{ label }}</span>
          </div>
          <div v-if="idx < STEP_LABELS.length - 1" class="w-4 sm:w-8 h-px bg-slate-200 shrink-0"></div>
        </template>
      </div>
    </div>

    <!-- Body -->
    <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28">
      <div class="max-w-5xl mx-auto space-y-4">
        <transition name="fade">
          <div v-if="errorMsg" class="p-3.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 font-semibold flex items-center gap-2.5 shadow-xs">
            <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
            <span>{{ errorMsg }}</span>
          </div>
        </transition>

        <div v-if="!ready" class="flex items-center justify-center py-24">
          <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
        </div>

        <template v-else>
          <StepSchoolIdentity
            v-if="currentMainStep === 1"
            v-model="identityForm"
            :is-locked="!!schoolStore.profile?.activated_at"
          />
          <StepSchoolCampus
            v-else-if="currentMainStep === 2"
            v-model="campusForm"
          />
          <StepSchoolContacts
            v-else-if="currentMainStep === 3"
          />
          <LadderWizardView
            v-show="currentMainStep >= 4 && currentMainStep <= 7"
            ref="ladderRef"
            embedded
            @saved="onLadderSaved"
          />
          <StepReviewActivate
            v-if="currentMainStep === 8"
            @activated="onActivated"
          />
        </template>
      </div>
    </main>

    <!-- Footer Navigation -->
    <div v-if="ready" class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-lg">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <button @click="backClicked" :disabled="currentMainStep === 1 || isBusy"
          class="px-4 py-2 rounded font-semibold text-xs transition-all disabled:opacity-30 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200">
          Back
        </button>
        <button v-if="currentMainStep < 8" @click="continueClicked" :disabled="isBusy"
          class="btn-primary font-bold px-5 py-2 rounded text-xs text-white transition-all active:scale-95 flex items-center gap-2 shadow-xs disabled:opacity-50">
          <Loader2 class="w-3.5 h-3.5 animate-spin" v-if="isBusy" />
          <template v-else>{{ currentMainStep === 3 ? 'Complete Stage 1' : currentMainStep === 7 ? 'Save & Continue' : 'Continue' }} <ArrowRight class="w-3.5 h-3.5" /></template>
        </button>
        <span v-else class="text-xs text-slate-400 font-medium">Use the Activate button above to finish setup.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { GraduationCap, LogOut, Check, ArrowRight, AlertCircle, Loader2 } from 'lucide-vue-next';
import { useAuthStore, useSchoolStore } from '../store';
import LadderWizardView from './LadderWizardView.vue';
import StepSchoolIdentity from './onboarding/StepSchoolIdentity.vue';
import StepSchoolCampus from './onboarding/StepSchoolCampus.vue';
import StepSchoolContacts from './onboarding/StepSchoolContacts.vue';
import StepReviewActivate from './onboarding/StepReviewActivate.vue';

const STEP_LABELS = ['Identity', 'Campus', 'Contacts', 'System', 'Ladder', 'Sections', 'Calendar', 'Review'];

const authStore = useAuthStore();
const schoolStore = useSchoolStore();

const ready = ref(false);
const isBusy = ref(false);
const errorMsg = ref(null);
const currentMainStep = ref(1);
const ladderRef = ref(null);

const identityForm = ref({
  legal_name: '', display_name: '', school_code: '', school_type: '',
  country: '', timezone: '', hemisphere: 'Northern', default_language: 'en',
  currency: 'JOD', logo_url: '', primary_color: '', website: ''
});
const campusForm = ref({
  name: '', address_line1: '', area: '', city: '', state_region: '', country: '',
  po_box: '', postal_code: '', latitude: '', longitude: '', day_start: '', day_end: ''
});

const stepDotClass = (step) => {
  if (step < currentMainStep.value) return 'bg-emerald-500 text-white';
  if (step === currentMainStep.value) return 'bg-blue-600 text-white';
  return 'bg-slate-200 text-slate-500';
};

async function enterLadderStep(mainStep) {
  currentMainStep.value = mainStep;
  await nextTick();
  if (ladderRef.value) ladderRef.value.currentStep = mainStep - 3;
}

const cleanOptionalNumber = (val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const num = Number(val);
  return Number.isNaN(num) ? undefined : num;
};

async function continueClicked() {
  errorMsg.value = null;
  isBusy.value = true;
  try {
    if (currentMainStep.value === 1) {
      await schoolStore.updateProfile(identityForm.value);
      currentMainStep.value = 2;
    } else if (currentMainStep.value === 2) {
      const payload = { ...campusForm.value };
      const lat = cleanOptionalNumber(payload.latitude);
      const lng = cleanOptionalNumber(payload.longitude);
      payload.latitude = lat;
      payload.longitude = lng;
      Object.keys(payload).forEach((k) => { if (payload[k] === '') payload[k] = undefined; });
      await schoolStore.upsertCampus(payload);
      currentMainStep.value = 3;
    } else if (currentMainStep.value === 3) {
      await schoolStore.commitProfile();
      await enterLadderStep(4);
    } else if (currentMainStep.value >= 4 && currentMainStep.value <= 6) {
      ladderRef.value?.goNext();
      currentMainStep.value++;
    } else if (currentMainStep.value === 7) {
      await ladderRef.value?.save();
      currentMainStep.value = 8;
    }
  } catch (err) {
    errorMsg.value = err.message || 'Something went wrong. Please check the fields above and try again.';
  } finally {
    isBusy.value = false;
  }
}

function backClicked() {
  if (currentMainStep.value === 1 || isBusy.value) return;
  if (currentMainStep.value >= 5 && currentMainStep.value <= 7) {
    ladderRef.value?.goBack();
    currentMainStep.value--;
  } else {
    currentMainStep.value--;
  }
}

function onLadderSaved() {
  currentMainStep.value = 8;
}

function onActivated() {
  // App.vue's needsOnboarding gate is reactive to schoolStore.setupState —
  // once activate() resolves, it flips to "live" and the whole app re-renders
  // out of this shell automatically. Nothing else to do here.
}

const handleLogout = () => {
  authStore.logout();
};

onMounted(async () => {
  await Promise.all([
    schoolStore.ensureProfileLoaded(),
    schoolStore.ensureSetupStateLoaded()
  ]);

  const p = schoolStore.profile;
  if (p) {
    identityForm.value = {
      legal_name: p.legal_name || '',
      display_name: p.display_name || '',
      school_code: p.school_code || '',
      school_type: p.school_type || '',
      country: p.country || '',
      timezone: p.timezone || '',
      hemisphere: p.hemisphere || 'Northern',
      default_language: p.default_language || 'en',
      currency: p.currency || 'JOD',
      logo_url: p.logo_url || '',
      primary_color: p.primary_color || '',
      website: p.website || ''
    };

    const primaryCampus = (p.campuses || []).find(c => c.is_primary) || (p.campuses || [])[0];
    if (primaryCampus) {
      campusForm.value = {
        name: primaryCampus.name || '',
        address_line1: primaryCampus.address_line1 || '',
        area: primaryCampus.area || '',
        city: primaryCampus.city || '',
        state_region: primaryCampus.state_region || '',
        country: primaryCampus.country || '',
        po_box: primaryCampus.po_box || '',
        postal_code: primaryCampus.postal_code || '',
        latitude: primaryCampus.latitude ?? '',
        longitude: primaryCampus.longitude ?? '',
        day_start: primaryCampus.day_start || '',
        day_end: primaryCampus.day_end || ''
      };
    }
  }

  // Resume mid-wizard progress after a page reload instead of restarting.
  const steps = schoolStore.setupState?.steps;
  if (steps?.structure_committed) {
    currentMainStep.value = 8;
  } else if (steps?.profile_committed) {
    await enterLadderStep(4);
  }

  ready.value = true;
});
</script>

<style scoped>
.animation-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
