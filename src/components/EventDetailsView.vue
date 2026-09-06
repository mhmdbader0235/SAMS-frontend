<template>
  <div class="min-h-full flex flex-col relative">
    <!-- Header (Scrolls away with page content) -->
    <header class="relative -mx-8 -mt-8 border-b border-gray-800 px-8 h-16 flex items-center justify-between mb-6 shrink-0 theme-card-subtle/95">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="p-2 rounded-md theme-text-muted hover:text-white hover:bg-slate-800/60 transition-all">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h2 class="text-base font-bold theme-text-heading">{{ event && event.status === 'draft' ? 'Edit Draft Event' : 'Manage Event' }}</h2>
          <p class="text-xs theme-text-muted">{{ event && event.status === 'draft' ? 'Update event details and submit for approval' : 'Edit event details, costs, and manage student enrollments' }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="userClass" class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-bold dark:text-emerald-500">
          Class: {{ userClass.name }}
        </span>
        <button
          v-if="authStore.hasAnyRole(['school_admin', 'super_admin', 'event_teacher', 'manager', 'teacher'])"
          @click="handleDeleteEvent"
          class="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all active:scale-95 dark:text-rose-500"
          title="Delete Event"
        >
          <Trash class="w-4 h-4" /> Delete Event
        </button>
      </div>
    </header>

    <!-- Internal planning workflow: shows the event's real pipeline stage,
         who currently holds the action, and whether it's locked. -->
    <div v-if="!loading && !error && event" class="theme-card rounded-md p-4 mb-6">
      <StageStepper
        :steps="internalPhases"
        :current-index="internalStage.index"
        :sub-label="internalStage.subLabel"
        :holder="internalStage.holder || null"
        :locked="internalStage.locked"
      />
    </div>

    <!-- Content -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-4">
        <Loader2 class="w-10 h-10 text-emerald-500 animate-spin mx-auto dark:text-emerald-400" />
        <p class="theme-text-muted text-sm">Loading event details...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex-1 flex items-center justify-center p-8">
      <div class="bg-rose-500/10 border border-rose-500/20 rounded-md p-8 text-center max-w-md">
        <AlertTriangle class="w-12 h-12 text-rose-400 mx-auto mb-4 dark:text-rose-500" />
        <h3 class="text-lg font-bold theme-text-heading mb-2">Error Loading Event</h3>
        <p class="theme-text-muted text-sm mb-6">{{ error }}</p>
        <button @click="goBack" class="px-5 py-2.5 btn-secondary rounded-md text-sm transition-all">
          Go Back
        </button>
      </div>
    </div>

    <!-- Draft mode or Event Teacher Resource Planning mode: show full wizard -->
    <div v-else-if="event && (event.status === 'draft' || (authStore.hasRole('event_teacher') && event.status === 'resource_planning'))" class="flex-1 p-8 max-w-4xl mx-auto w-full">
      <div class="space-y-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-1 bg-purple-500/15 text-purple-400 border border-purple-500/25 rounded-sm text-xs font-bold uppercase tracking-wide dark:text-purple-500">
              {{ event.status === 'resource_planning' ? 'Resource Planning' : 'Draft' }}
            </span>
            <h2 class="text-xl font-black theme-text-heading">
              {{ event.status === 'resource_planning' ? 'Plan Event Resources & Review' : 'Edit Event Draft' }}
            </h2>
          </div>
          <p class="text-xs theme-text-muted">
            {{ event.status === 'resource_planning' ? 'Review proposal, allocate resources, and reject or submit to manager.' : 'Complete all steps and submit for approval when ready.' }}
          </p>
        </div>
        <EventWizard :editEventId="eventId" @completed="goBack" />
      </div>
    </div>

    <div v-else class="flex-1 p-8 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-8">
      <!-- Left side: General details and Ticket Price -->
      <div class="lg:col-span-1 space-y-6">
        <div class="theme-card rounded-md p-6 shadow-xs space-y-4">
          <h3 class="text-sm font-bold theme-text-heading border-b border-gray-800 pb-3 flex items-center gap-2">
            <Settings class="w-4 h-4 text-emerald-400 dark:text-emerald-500" />
            General Information
          </h3>

          <div class="space-y-4 mt-4">
            <div>
              <label class="block text-xs font-bold theme-text-muted uppercase tracking-wider mb-2">Event Title</label>
              <input v-model="form.title" type="text" placeholder="e.g. Science Museum Trip"
                class="w-full theme-card-subtle border border-gray-800 rounded-md px-4 py-2.5 text-sm theme-text-heading focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>

            <div>
              <label class="block text-xs font-bold theme-text-muted uppercase tracking-wider mb-2">Description</label>
              <textarea v-model="form.description" rows="3" placeholder="Describe the event..."
                class="w-full theme-card-subtle border border-gray-800 rounded-md px-4 py-2.5 text-sm theme-text-heading focus:outline-none focus:border-emerald-500 transition-colors resize-none"></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold theme-text-muted uppercase tracking-wider mb-2">Address / Location</label>
              <input v-model="form.address" type="text" placeholder="e.g. Main Street 123"
                class="w-full theme-card-subtle border border-gray-800 rounded-md px-4 py-2.5 text-sm theme-text-heading focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold theme-text-muted uppercase tracking-wider mb-2">Event Date</label>
                <input v-model="form.date" type="datetime-local"
                  class="w-full theme-card-subtle border border-gray-800 rounded-md px-4 py-2.5 text-sm theme-text-heading focus:outline-none focus:border-emerald-500 transition-colors" />
                <p class="text-xs theme-text-muted mt-1">Times are in {{ schoolStore.timezone }}</p>
              </div>
              <div>
                <label class="block text-xs font-bold theme-text-muted uppercase tracking-wider mb-2">School Subsidy ($)</label>
                <input v-model.number="form.school_subsidy" type="number" step="0.01" min="0"
                  class="w-full theme-card-subtle border border-gray-800 rounded-md px-4 py-2.5 text-sm theme-text-heading focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <!-- Ticket pricing -->
        <div class="theme-card rounded-md p-6 shadow-xs space-y-4">
          <h3 class="text-sm font-bold theme-text-heading border-b border-gray-800 pb-3 flex items-center gap-2">
            <Tag class="w-4 h-4 text-emerald-400 dark:text-emerald-500" />
            Ticket Pricing (Your Class)
          </h3>
          <div class="mt-4">
            <label class="block text-xs font-bold theme-text-muted uppercase tracking-wider mb-2">Ticket Price ($)</label>
            <input v-model.number="classMappingForm.ticket_price" type="number" step="0.01" min="0"
              class="w-full theme-card-subtle border border-gray-800 rounded-md px-4 py-2.5 text-sm theme-text-heading focus:outline-none focus:border-emerald-500 transition-colors" />
            <p class="text-[10px] theme-text-muted mt-2">Specify the price parent should pay per student enrolled from your class.</p>
          </div>
        </div>
      </div>

      <!-- Center: Costs & Budgets -->
      <div class="lg:col-span-1 space-y-6">
        <div class="theme-card rounded-md p-6 shadow-xs flex flex-col h-full space-y-4">
          <h3 class="text-sm font-bold theme-text-heading border-b border-gray-800 pb-3 flex items-center justify-between">
            <span class="flex items-center gap-2">
              <DollarSign class="w-4 h-4 text-emerald-400 dark:text-emerald-500" />
              Event Costs / Budget
            </span>
            <button @click="addBudgetItem" class="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:text-white rounded-sm text-xs font-bold transition-all flex items-center gap-1 dark:text-emerald-500">
              <Plus class="w-3.5 h-3.5" /> Add Cost
            </button>
          </h3>

          <!-- Costs & Resources list -->
          <div class="flex-1 overflow-y-auto space-y-3 min-h-[300px] pr-1">
            <div v-if="!classMappingForm.budgets.length" class="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-800/80 rounded-md theme-card-subtle/20">
              <DollarSign class="w-8 h-8 text-slate-700 mb-2 dark:text-slate-400" />
              <p class="theme-text-muted text-xs font-medium">No resource costs added yet</p>
              <p class="text-[10px] theme-text-muted mt-1">Add items like transport, staffing, entry fees, or meals.</p>
            </div>

            <div v-for="(item, idx) in classMappingForm.budgets" :key="idx"
              class="flex flex-col gap-2 theme-card-subtle/60 border border-gray-800/60 p-3 rounded-md transition-all hover:border-slate-700/80 shadow-xs">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider dark:text-emerald-500">
                  {{ item.resource_type_name || 'Resource Line' }}
                </span>
                <button @click="removeBudgetItem(idx)" class="p-1 theme-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-sm transition-colors flex-shrink-0 dark:hover:text-rose-500" title="Remove line item">
                  <Trash class="w-3.5 h-3.5" />
                </button>
              </div>

              <input v-model="item.description" type="text" placeholder="Description (e.g. 50-seater bus)..."
                class="w-full bg-slate-900 border border-slate-800 rounded-sm px-2.5 py-1.5 text-xs theme-text-heading focus:outline-none focus:border-emerald-500 placeholder-slate-600" />

              <div class="grid grid-cols-3 gap-2 items-center pt-1 border-t border-slate-850">
                <div>
                  <label class="block text-[9px] font-bold text-gray-500 uppercase">Qty</label>
                  <input v-model.number="item.quantity" type="number" min="1" step="1" placeholder="1"
                    class="w-full bg-slate-900 border border-slate-800 rounded-sm px-2 py-1 text-xs theme-text-heading text-center focus:outline-none focus:border-emerald-500 font-bold" />
                </div>
                <div>
                  <label class="block text-[9px] font-bold text-gray-500 uppercase">Unit Cost ($)</label>
                  <input v-model.number="item.unit_price" type="number" step="0.01" min="0" placeholder="0.00"
                    class="w-full bg-slate-900 border border-slate-850 rounded-sm px-2 py-1 text-xs theme-text-heading text-right focus:outline-none focus:border-emerald-500" />
                </div>
                <div class="text-right">
                  <label class="block text-[9px] font-bold text-gray-500 uppercase">Total ($)</label>
                  <span class="text-xs font-black text-emerald-400 dark:text-emerald-500">
                    ${{ (parseFloat(item.quantity || 1) * parseFloat(item.unit_price || item.price || 0)).toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Total costs summary -->
          <div class="theme-card-subtle rounded-md p-4 mt-auto">
            <div class="flex items-center justify-between text-xs theme-text-muted mb-1.5">
              <span>Class Students Enrolled:</span>
              <span class="font-bold theme-text-heading">{{ enrolledStudentsCount }}</span>
            </div>
            <div class="flex items-center justify-between text-xs theme-text-muted mb-3">
              <span>Potential Class Ticket Revenue:</span>
              <span class="font-bold theme-text-heading">${{ parseFloat(potentialRevenue || 0).toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-between border-t border-gray-800/80 pt-3">
              <span class="text-sm font-bold theme-text-heading">Total Event Budget:</span>
              <span class="text-base font-black text-emerald-400 dark:text-emerald-500">${{ parseFloat(totalCosts || 0).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Student approvals -->
      <div class="lg:col-span-1 space-y-6">
        <div class="theme-card rounded-md p-6 shadow-xs flex flex-col h-full space-y-4">
          <h3 class="text-sm font-bold theme-text-heading border-b border-gray-800 pb-3 flex items-center justify-between">
            <span class="flex items-center gap-2">
              <Users class="w-4 h-4 text-emerald-400 dark:text-emerald-500" />
              Student Enrollments
            </span>
            <span class="text-xs theme-text-muted">{{ enrolledStudentsCount }} / {{ classStudents.length }} enrolled</span>
          </h3>

          <div class="flex-1 overflow-y-auto space-y-3 min-h-[350px] pr-1">
            <div v-if="!classStudents.length" class="h-full flex flex-col items-center justify-center text-center p-8">
              <Users class="w-8 h-8 text-slate-700 mb-2 dark:text-slate-400" />
              <p class="theme-text-muted text-xs">No students in your class</p>
            </div>

            <div v-for="student in classStudents" :key="student.id"
              class="theme-card-subtle/60 border border-gray-800/40 rounded-md p-3.5 space-y-2 hover:border-gray-800 transition-all flex flex-col">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="text-xs font-bold theme-text-heading">{{ student.name }}</div>
                  <div class="text-[10px] theme-text-muted mt-0.5">{{ student.email }}</div>
                </div>
                <StageStepper
                  :steps="enrollmentSteps"
                  :current-index="enrollmentStageFor(getStudentEnrollmentState(student.id)).index"
                  :terminal="enrollmentStageFor(getStudentEnrollmentState(student.id)).terminal"
                  size="compact"
                  tone="violet"
                />
              </div>

              <!-- Enrollment Actions -->
              <div class="flex items-center gap-2 pt-1 border-t border-slate-900/60 mt-1">
                <template v-if="getStudentEnrollment(student.id)">
                  <!-- If enrollment exists, show Approve / Reject logic based on state -->
                  <div v-if="getStudentEnrollmentState(student.id) === 'requested_by_student'" class="w-full text-[10px] theme-text-muted italic py-1 text-center">
                    Waiting on the parent -- a teacher cannot approve or reject until they decide.
                  </div>
                  <div v-else-if="getStudentEnrollmentState(student.id) === 'approved_by_parent'" class="flex gap-2 w-full">
                    <button @click="updateStudentState(student.id, 'approved_by_teacher')"
                      class="flex-1 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-sm transition-all dark:text-emerald-500">
                      Approve
                    </button>
                    <button @click="updateStudentState(student.id, 'rejected_by_teacher')"
                      class="flex-1 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-sm transition-all dark:text-rose-500">
                      Reject
                    </button>
                  </div>
                  <div v-else-if="getStudentEnrollmentState(student.id) === 'approved_by_teacher' && !getStudentEnrollment(student.id)?.parent_id" class="w-full">
                    <!-- Enrolled directly by a teacher, no parent ever involved --
                         cancel outright rather than "reject" against no one. -->
                    <button @click="cancelStudentEnrollment(student.id)"
                      class="w-full py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-sm transition-all dark:text-rose-500">
                      Cancel Enrollment
                    </button>
                  </div>
                  <div v-else-if="getStudentEnrollmentState(student.id) === 'approved_by_teacher'" class="w-full">
                    <button @click="updateStudentState(student.id, 'rejected_by_teacher')"
                      class="w-full py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-sm transition-all dark:text-rose-500">
                      Reject Enrollment
                    </button>
                  </div>
                  <div v-else-if="getStudentEnrollmentState(student.id) === 'rejected_by_teacher' || getStudentEnrollmentState(student.id) === 'rejected_by_parent'" class="w-full">
                    <button @click="updateStudentState(student.id, 'approved_by_teacher')"
                      class="w-full py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-sm transition-all dark:text-emerald-500">
                      Approve Enrollment
                    </button>
                  </div>
                </template>
                <template v-else>
                  <!-- Teacher enrolling from their own class roster is a direct
                       decision -- lands on approved_by_teacher immediately.
                       teacher_id is still recorded server-side for audit. -->
                  <button @click="enrollStudentDirectly(student.id)"
                    class="w-full py-1.5 btn-primary text-white text-[10px] font-bold rounded-sm transition-all flex items-center justify-center gap-1">
                    <UserPlus class="w-3 h-3" /> Enroll Student
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Event Feedback -- staff-only, spans the full grid width. Wired up
           2026-08-31: the backend endpoint (GET /events/{id}/feedbacks) and
           submit endpoint always existed with no role gate, but no view in
           the whole frontend ever rendered feedback anywhere -- it was dead
           script code. This is the first place it's actually shown. -->
      <div v-if="authStore.hasAnyRole(['school_admin', 'super_admin', 'manager', 'teacher', 'event_teacher'])" class="lg:col-span-3 theme-card rounded-md p-6 shadow-xs space-y-4">
        <h3 class="text-sm font-bold theme-text-heading border-b border-gray-800 pb-3 flex items-center justify-between">
          <span class="flex items-center gap-2">
            <Star class="w-4 h-4 text-emerald-400" />
            Event Feedback
          </span>
          <span v-if="eventFeedback.length" class="text-xs theme-text-muted">
            {{ averageFeedbackRating }} / 5 avg · {{ eventFeedback.length }} response{{ eventFeedback.length === 1 ? '' : 's' }}
          </span>
        </h3>

        <div v-if="!eventFeedback.length" class="text-xs theme-text-muted italic py-2">
          No feedback submitted for this event yet.
        </div>

        <div v-else class="space-y-3 max-h-80 overflow-y-auto pr-1">
          <div v-for="fb in eventFeedback" :key="fb.id" class="theme-card-subtle/60 border border-gray-800/40 rounded-md p-3.5 space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold theme-text-heading">{{ fb.user_name || 'User #' + fb.user_id }}</span>
              <span class="text-amber-400 text-xs font-bold tracking-wide">{{ '★'.repeat(fb.rating) }}{{ '☆'.repeat(5 - fb.rating) }}</span>
            </div>
            <p v-if="fb.comments" class="text-xs theme-text-muted">{{ fb.comments }}</p>
            <p class="text-[10px] text-slate-600">{{ formatFeedbackDate(fb.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action footer (Sticky at bottom) -->
    <footer v-if="!loading && !error && !(event && event.status === 'draft')" class="sticky -bottom-8 -mx-8 -mb-8 z-30 theme-card-subtle border-t border-gray-800 px-8 h-20 flex items-center justify-end gap-3 shrink-0 shadow-sm mt-8">
      <button @click="goBack" class="px-5 py-2.5 btn-secondary rounded-md text-sm transition-all">
        Cancel
      </button>
      <button @click="saveChanges" :disabled="saving" class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-violet-600 text-white font-bold text-sm rounded-md hover:opacity-90 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
        <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
      <button v-if="event?.status === 'approved' && (authStore.hasAnyRole(['teacher', 'school_admin']) || user?.role === 'teacher' || user?.role === 'school_admin')" @click="publishEvent" :disabled="publishing" class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-sm rounded-md hover:opacity-90 transition-all active:scale-95 flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:pointer-events-none">
        🚀 Publish Event
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore, useSchoolStore } from '../store';
import { toDateTimeLocal, fromDateTimeLocal } from '../format';
import EventWizard from './wizard/EventWizard.vue';
import StageStepper from './ui/StageStepper.vue';
import { INTERNAL_PHASES, ENROLLMENT_STEPS, internalStageFor, enrollmentStageFor } from '../workflow';
import {
  apiGetEvent,
  apiGetEventResources,
  apiUpdateEvent,
  apiDeleteEvent,
  apiLoadClasses,
  apiLoadStudents,
  apiLoadEnrollments,
  apiCreateEnrollment,
  apiUpdateEnrollmentApproval,
  apiCancelEnrollment,
  apiLoadFeedbacks,
  apiSubmitEvent,
  apiPublishEvent
} from '../api';
import {
  ArrowLeft, Loader2, AlertTriangle, Settings, Tag,
  DollarSign, Plus, Trash, Users, UserPlus, CheckCircle, Package, Star
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const schoolStore = useSchoolStore();
const user = computed(() => authStore.user);

const eventId = parseInt(route.params.id);

const internalPhases = INTERNAL_PHASES;
const enrollmentSteps = ENROLLMENT_STEPS;
const internalStage = computed(() => internalStageFor(event.value?.status));
const publishing = ref(false);

const handleDeleteEvent = async () => {
  if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
  try {
    await apiDeleteEvent(eventId);
    router.push('/');
  } catch (err) {
    alert('Failed to delete event: ' + (err.message || err));
  }
};

const loading = ref(true);
const saving = ref(false);
const error = ref(null);

const event = ref(null);
const eventResources = ref([]);
const eventResourceSummary = ref(null);
const userClass = ref(null);
const classStudents = ref([]);
const classEnrollments = ref([]);

// Form states
const form = reactive({
  title: '',
  description: '',
  address: '',
  date: '',
  school_subsidy: 0
});

const classMappingForm = reactive({
  id: null,
  class_id: null,
  ticket_price: 0,
  budgets: []
});

onMounted(async () => {
  try {
    // 1. Fetch user profile and class info
    await authStore.fetchMe();
    
    // Check access role
    const allowedRoles = ['teacher', 'school_admin', 'event_teacher', 'manager'];
    if (!authStore.hasAnyRole(allowedRoles)) {
      error.value = 'Access denied. Only staff members can view and edit this page.';
      loading.value = false;
      return;
    }

    // Load classes - fallback gracefully if teacher is not head teacher of a specific class
    const classesList = await apiLoadClasses();
    userClass.value = classesList.find(c => c.head_teacher_id === parseInt(user.value.user_id)) || classesList[0] || null;

    // 2. Fetch event details & event resources
    event.value = await apiGetEvent(eventId);
    
    try {
      const resSummary = await apiGetEventResources(eventId);
      eventResourceSummary.value = resSummary;
      eventResources.value = resSummary.resources || [];
    } catch (rErr) {
      console.warn('Could not load event resources:', rErr.message);
    }

    // Set general form fields
    form.title = event.value.title;
    form.description = event.value.description;
    form.address = event.value.address || '';
    
    // Date conversions to the school's local datetime-local format
    if (event.value.date) {
      form.date = toDateTimeLocal(event.value.date, schoolStore.timezone);
    }
    form.school_subsidy = parseFloat(event.value.school_subsidy || 0);

    // 3. Find teacher class mapping in event
    let mapping = null;
    if (userClass.value) {
      mapping = (event.value?.class_mappings || []).find(m => m.class_id === userClass.value.id) || event.value?.class_mappings?.[0];
    } else if (event.value?.class_mappings?.length) {
      mapping = event.value.class_mappings[0];
    }

    if (mapping) {
      classMappingForm.id = mapping.id;
      classMappingForm.class_id = mapping.class_id;
      classMappingForm.ticket_price = parseFloat(mapping.ticket_price || 0);
      classMappingForm.budgets = (mapping.budgets || []).map(b => ({
        resource_type_name: b.resource_type_name || 'Custom Resource',
        description: b.description,
        quantity: parseInt(b.quantity || 1),
        unit_price: parseFloat(b.unit_price || b.price || 0),
        price: parseFloat(b.price || 0)
      }));
    } else {
      classMappingForm.id = null;
      classMappingForm.class_id = userClass.value?.id || null;
      classMappingForm.ticket_price = 0;
      classMappingForm.budgets = [];
    }

    // Always merge or populate allocated eventResources into classMappingForm.budgets
    if (eventResources.value.length) {
      classMappingForm.budgets = eventResources.value.map(r => ({
        resource_type_name: r.resource_type_name || 'Allocated Resource',
        description: r.description || r.resource_type_name || 'Resource line',
        quantity: parseInt(r.quantity || 1),
        unit_price: parseFloat(r.unit_cost || 0),
        price: parseFloat(r.total_cost || ((r.quantity || 1) * (r.unit_cost || 0)) || 0)
      }));
    }

    // 4. Fetch students & enrollments
    if (userClass.value) {
      await refreshEnrollments();
    }

    // 5. Feedback -- only meaningful once the event isn't still a draft
    if (event.value && event.value.status !== 'draft') {
      loadEventFeedback();
    }

  } catch (err) {
    error.value = err.message || 'An error occurred during loading';
  } finally {
    loading.value = false;
  }
});

const eventFeedback = ref([]);

const loadEventFeedback = async () => {
  try {
    eventFeedback.value = await apiLoadFeedbacks(eventId);
  } catch (err) {
    console.warn('Could not load event feedback:', err.message);
  }
};

const averageFeedbackRating = computed(() => {
  if (!eventFeedback.value.length) return '0.0';
  const sum = eventFeedback.value.reduce((total, fb) => total + (fb.rating || 0), 0);
  return (sum / eventFeedback.value.length).toFixed(1);
});

const formatFeedbackDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const refreshEnrollments = async () => {
  try {
    const studentsList = await apiLoadStudents();
    classStudents.value = studentsList.filter(s => s.class_id === userClass.value.id);

    const enrollList = await apiLoadEnrollments();
    // Filter enrollments for this event class map
    if (classMappingForm.id) {
      classEnrollments.value = enrollList.filter(en => en.event_class_map_id === classMappingForm.id);
    } else {
      classEnrollments.value = [];
    }
  } catch (err) {
    console.error('Failed to load enrollments:', err);
    alert((err.message || 'Failed to refresh the enrollment roster') + ' -- reload the page to see the latest data.');
  }
};

const goBack = () => {
  router.push('/');
};

// Cost / Budget list helpers
const addBudgetItem = () => {
  classMappingForm.budgets.push({
    resource_type_name: 'Custom Resource',
    description: '',
    quantity: 1,
    unit_price: 0,
    price: 0
  });
};

const removeBudgetItem = (idx) => {
  classMappingForm.budgets.splice(idx, 1);
};

const totalCosts = computed(() => {
  return classMappingForm.budgets.reduce((acc, curr) => {
    const qty = parseFloat(curr.quantity || 1);
    const unitPrice = parseFloat(curr.unit_price || curr.price || 0);
    return acc + (qty * unitPrice);
  }, 0);
});

const enrolledStudentsCount = computed(() => {
  return classEnrollments.value.filter(en => en.state === 'approved_by_teacher').length;
});

const potentialRevenue = computed(() => {
  return enrolledStudentsCount.value * classMappingForm.ticket_price;
});

// Student Enrollment helpers
const getStudentEnrollment = (studentId) => {
  return classEnrollments.value.find(en => en.student_id === studentId);
};

const getStudentEnrollmentState = (studentId) => {
  const en = getStudentEnrollment(studentId);
  return en ? en.state : 'not_enrolled';
};

const formatStateLabel = (state) => {
  if (state === 'approved_by_parent') return 'Pending Teacher';
  if (state === 'requested_by_student') return 'Pending Parent';
  if (state === 'approved_by_teacher') return 'Approved';
  if (state === 'rejected_by_parent') return 'Rejected by Parent';
  if (state === 'rejected_by_teacher') return 'Rejected';
  return 'Not Enrolled';
};

const getStateBadgeClass = (state) => {
  switch (state) {
    case 'requested_by_student': return 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
    case 'approved_by_parent': return 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20';
    case 'approved_by_teacher': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
    case 'rejected_by_parent':
    case 'rejected_by_teacher': return 'bg-rose-500/15 text-rose-400 border border-rose-500/20';
    default: return 'bg-slate-800 theme-text-muted border border-gray-800';
  }
};

const enrollStudentDirectly = async (studentId) => {
  if (!classMappingForm.id) {
    alert('Please save the event and class ticket price first to generate class event targets before enrolling students.');
    return;
  }
  try {
    await apiCreateEnrollment({
      student_id: studentId,
      event_class_map_id: classMappingForm.id
    });
    await refreshEnrollments();
  } catch (err) {
    alert(err.message);
  }
};

const updateStudentState = async (studentId, newState) => {
  const en = getStudentEnrollment(studentId);
  if (!en) return;
  try {
    await apiUpdateEnrollmentApproval(en.id, { state: newState });
    await refreshEnrollments();
  } catch (err) {
    alert(err.message);
  }
};

// A teacher's own direct enroll (no parent ever involved -- parent_id is
// null) has no one to "reject" against, so it gets a real cancel instead:
// this deletes the enrollment row outright via DELETE /enrollments/{id},
// same endpoint parents/students already use to cancel their own.
const cancelStudentEnrollment = async (studentId) => {
  const en = getStudentEnrollment(studentId);
  if (!en) return;
  if (!confirm('Cancel this enrollment? This removes it completely and cannot be undone.')) return;
  try {
    await apiCancelEnrollment(en.id);
    await refreshEnrollments();
  } catch (err) {
    alert(err.message);
  }
};

const publishEvent = async () => {
  if (!event.value) return;
  if (!confirm('Publish this approved event? Students and parents will be notified.')) return;
  publishing.value = true;
  try {
    await apiPublishEvent(eventId);
    event.value = await apiGetEvent(eventId);
  } catch (err) {
    alert(err.message || 'Failed to publish event');
  } finally {
    publishing.value = false;
  }
};

const saveChanges = async () => {
  saving.value = true;
  try {
    // 1. Gather class mapping data
    const mappings = [...event.value.class_mappings];
    const userMapIdx = mappings.findIndex(m => m.class_id === userClass.value.id);
    
    const ourMapping = {
      class_id: classMappingForm.class_id,
      ticket_price: classMappingForm.ticket_price,
      budgets: classMappingForm.budgets.filter(b => b.description.trim() !== '')
    };

    if (userMapIdx > -1) {
      mappings[userMapIdx] = ourMapping;
    } else {
      mappings.push(ourMapping);
    }

    // 2. Call PUT API
    const updated = await apiUpdateEvent(eventId, {
      title: form.title,
      description: form.description,
      address: form.address,
      school_subsidy: form.school_subsidy,
      date: fromDateTimeLocal(form.date, schoolStore.timezone),
      class_mappings: mappings
    });

    event.value = updated;
    const mapping = event.value.class_mappings.find(m => m.class_id === userClass.value.id);
    if (mapping) {
      classMappingForm.id = mapping.id;
    }
    
    await refreshEnrollments();
    alert('Event details and class budget successfully saved!');
  } catch (err) {
    alert(err.message || 'Failed to save changes');
  } finally {
    saving.value = false;
  }
};
</script>
