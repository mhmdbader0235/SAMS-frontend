<template>
  <div class="theme-card rounded-3xl shadow-sm p-8 space-y-6 relative flex flex-col">
    <!-- Stepper Progress Tracker (Scrolls away with content) -->
    <div class="-mx-8 -mt-8 px-8 py-5 border-b border-gray-800/80 rounded-t-3xl mb-2 theme-card-subtle/95">
      <WizardStepper :current-step="currentStep" :steps="stepperSteps" />
    </div>

    <!-- Alert Messaging -->
    <transition name="fade">
      <div v-if="errorMsg" class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400 font-medium">
        {{ errorMsg }}
      </div>
    </transition>
    <transition name="fade">
      <div v-if="successMsg" class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 font-medium">
        {{ successMsg }}
      </div>
    </transition>

    <!-- Wizard Steps -->
    <div class="min-h-[250px]">
      <StepBasics v-if="currentStep === 1" v-model="form" />
      <StepAudience v-else-if="currentStep === 2" v-model="form" :event-id="eventId" />
      <StepResources v-else-if="currentStep === 3" v-model="form" />
      <StepProposalReview v-else-if="currentStep === 4" v-model="form" />
    </div>

    <!-- Wizard Navigation Actions (Sticky Footer) -->
    <div class="sticky -bottom-8 -mx-8 -mb-8 z-30 theme-card-subtle/95 backdrop-blur-xl border-t border-gray-800 px-8 py-5 rounded-b-3xl flex justify-between items-center mt-6 shadow-2xl">
      <button
        v-if="currentStep > 1"
        type="button"
        @click="prevStep"
        class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-bold font-heading tracking-wide active:scale-95 transition-all"
      >
        ← Back
      </button>
      <div v-else></div>

      <div class="flex gap-3">
        <!-- Save Draft Button visible in review step -->
        <button
          v-if="isFinalStep"
          type="button"
          @click="handleSaveDraft"
          :disabled="loading"
          class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-gray-700 text-emerald-400 rounded-xl text-xs font-bold font-heading tracking-wide active:scale-95 transition-all disabled:opacity-50"
        >
          {{ loading ? 'Saving...' : 'Save Draft' }}
        </button>

        <button
          id="editor-save-btn"
          type="button"
          @click="nextStep"
          :disabled="loading"
          class="btn-primary font-heading font-bold"
        >
          <span v-if="loading">Processing...</span>
          <span v-else-if="isFinalStep">Submit for Manager Approval ➔</span>
          <span v-else>Next Step →</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import WizardStepper from './WizardStepper.vue';
import StepBasics from './StepBasics.vue';
import StepAudience from './StepAudience.vue';
import StepResources from './StepResources.vue';
import StepProposalReview from './StepProposalReview.vue';

import {
  apiCreateEvent,
  apiUpdateEvent,
  apiSaveEventAudience,
  apiSaveEventResources,
  apiSubmitEvent,
  apiGetEvent,
  apiGetEventResources,
  apiManagerDecision,
  apiGetAudiencePrediction
} from '../../api';

import { useAuthStore } from '../../store';

const authStore = useAuthStore();
const isTeacher = computed(() => authStore.hasRole('teacher'));
const isManager = computed(() => authStore.hasAnyRole(['manager', 'school_admin']));
const canSetSubsidy = computed(() => isManager.value);

const props = defineProps({
  editEventId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['completed']);

const currentStep = ref(1);
const eventId = ref(null);
const loading = ref(false);
const errorMsg = ref(null);
const successMsg = ref(null);

const maxSteps = computed(() => 4);
const isFinalStep = computed(() => currentStep.value === maxSteps.value);

const stepperSteps = computed(() => {
  return [
    { number: 1, label: 'Basics' },
    { number: 2, label: 'Audience' },
    { number: 3, label: 'Resources' },
    { number: 4, label: 'Review' }
  ];
});


const form = ref({
  title: '',
  description: '',
  address: '',
  school_subsidy: 0.0,
  date: '',
  class_ids: [],
  class_suggested_prices: {},
  resources: [],
  predicted_attendance: 0
});

const formatForDateTimeLocal = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

onMounted(async () => {
  if (props.editEventId) {
    loading.value = true;
    try {
      eventId.value = props.editEventId;
      const ev = await apiGetEvent(props.editEventId);
      form.value.title = ev.title || '';
      form.value.description = ev.description || '';
      form.value.address = ev.address || '';
      form.value.school_subsidy = parseFloat(ev.school_subsidy || 0);
      
      if (ev.date) {
        form.value.date = formatForDateTimeLocal(ev.date);
      }
      
      if (ev.class_mappings) {
        form.value.class_ids = ev.class_mappings.map(m => m.class_id);
        ev.class_mappings.forEach(m => {
          form.value.class_suggested_prices[m.class_id] = m.ticket_price;
        });
        if (form.value.class_ids.length > 0) {
          try {
            const pred = await apiGetAudiencePrediction(props.editEventId, form.value.class_ids);
            if (pred !== undefined) {
              form.value.predicted_attendance = pred;
            }
          } catch (e) {
            console.error('Failed to load prediction:', e);
          }
        }
      }
      
      const resData = await apiGetEventResources(props.editEventId);
      form.value.resources = resData.resources || [];
    } catch (err) {
      setError(err.message || 'Failed to load draft event details');
    } finally {
      loading.value = false;
    }
  }
});

const setError = (msg) => {
  errorMsg.value = msg;
  setTimeout(() => { errorMsg.value = null; }, 5000);
};

const setSuccess = (msg) => {
  successMsg.value = msg;
  setTimeout(() => { successMsg.value = null; }, 5000);
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const submitProposal = async () => {
  loading.value = true;
  try {
    const classMappings = form.value.class_ids.map(cid => {
      const priceVal = form.value.class_suggested_prices[cid] ?? form.value.class_suggested_prices[String(cid)] ?? 0.0;
      return {
        class_id: cid,
        ticket_price: parseFloat(priceVal || 0.0)
      };
    });
    await apiSaveEventAudience(eventId.value, form.value.class_ids, classMappings);

    await apiSubmitEvent(eventId.value);
    setSuccess('Event proposal submitted to Manager for approval successfully!');
    setTimeout(() => {
      emit('completed');
    }, 1500);
  } catch (err) {
    setError(err.message);
  } finally {
    loading.value = false;
  }
};

const handleManagerApprove = async () => {
  loading.value = true;
  try {
    await apiManagerDecision(eventId.value, 'approve');
    setSuccess('Event approved and published successfully!');
    setTimeout(() => {
      emit('completed');
    }, 1500);
  } catch (err) {
    setError(err.message || 'Failed to approve event');
  } finally {
    loading.value = false;
  }
};

const handleManagerReject = async () => {
  const reason = prompt('Enter reason for rejecting event proposal back to draft:');
  if (reason === null) return; // User cancelled
  if (!reason.trim()) {
    return setError('Please enter a non-empty rejection reason');
  }
  loading.value = true;
  try {
    await apiManagerDecision(eventId.value, 'reject', reason.trim());
    setSuccess('Event proposal rejected and returned to draft status successfully!');
    setTimeout(() => {
      emit('completed');
    }, 1500);
  } catch (err) {
    setError(err.message || 'Failed to reject event');
  } finally {
    loading.value = false;
  }
};

const nextStep = async () => {
  errorMsg.value = null;
  
  if (currentStep.value === 1) {
    // Validate Step 1
    if (!form.value.title.trim()) return setError('Event title is required');
    if (!form.value.description.trim()) return setError('Event description is required');
    if (!form.value.address.trim()) return setError('Address / location is required');
    if (!form.value.date) return setError('Date and time is required');
    
    loading.value = true;
    try {
      const payload = {
        title: form.value.title,
        description: form.value.description,
        address: form.value.address,
        date: new Date(form.value.date).toISOString(),
        class_mappings: []
      };
      
      if (!eventId.value) {
        const res = await apiCreateEvent(payload);
        eventId.value = res.id;
      } else {
        await apiUpdateEvent(eventId.value, payload);
      }
      currentStep.value = 2;
    } catch (err) {
      setError(err.message);
    } finally {
      loading.value = false;
    }
    
  } else if (currentStep.value === 2) {
    if (!form.value.class_ids || form.value.class_ids.length === 0) {
      return setError('Please select at least one class');
    }
    
    loading.value = true;
    try {
      const classMappings = form.value.class_ids.map(cid => ({
        class_id: cid,
        ticket_price: form.value.class_suggested_prices[cid] || 0.0
      }));
      if (eventId.value) {
        const res = await apiSaveEventAudience(eventId.value, form.value.class_ids, classMappings);
        if (res && res.predicted_attendance !== undefined) {
          form.value.predicted_attendance = res.predicted_attendance;
        }
      }
      
      currentStep.value = 3;
    } catch (err) {
      setError(err.message);
    } finally {
      loading.value = false;
    }
    
  } else if (currentStep.value === 3) {
    if (!form.value.resources || form.value.resources.length === 0) {
      return setError('Please select at least one resource line');
    }
    
    loading.value = true;
    try {
      const payload = form.value.resources.map(r => ({
        resource_type_id: r.resource_type_id,
        description: r.description || '',
        quantity: parseInt(r.quantity || 1),
        unit_price: parseFloat(r.unit_price || 0)
      }));
      await apiSaveEventResources(eventId.value, payload);
      currentStep.value = 4;
    } catch (err) {
      setError(err.message);
    } finally {
      loading.value = false;
    }
    
  } else if (currentStep.value === 4) {
    return await submitProposal();
  }
};

const handleSaveDraft = async () => {
  errorMsg.value = null;
  loading.value = true;
  try {
    const payloadBasics = {
      title: form.value.title,
      description: form.value.description,
      address: form.value.address,
      date: new Date(form.value.date).toISOString(),
      class_mappings: []
    };
    await apiUpdateEvent(eventId.value, payloadBasics);
    const classMappings = form.value.class_ids.map(cid => ({
      class_id: cid,
      ticket_price: parseFloat(form.value.class_suggested_prices[cid] || 0.0)
    }));
    await apiSaveEventAudience(eventId.value, form.value.class_ids, classMappings);
    
    if (userRole !== 'teacher' && form.value.resources?.length) {
      const payloadResources = form.value.resources.map(r => ({
        resource_type_id: r.resource_type_id,
        description: r.description,
        quantity: parseInt(r.quantity)
      }));
      await apiSaveEventResources(eventId.value, payloadResources);
    }
    
    setSuccess('Event draft progress saved successfully!');
    setTimeout(() => {
      emit('completed');
    }, 1200);
  } catch (err) {
    setError(err.message);
  } finally {
    loading.value = false;
  }
};
</script>
