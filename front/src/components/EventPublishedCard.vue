<template>
  <div class="theme-card rounded p-5 sm:p-6 space-y-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
            Published Event
          </span>
        </div>
        <h4 
          @click="hasAnyRole(['teacher', 'school_admin', 'super_admin', 'event_teacher', 'manager']) ? handleOpenSettings() : null"
          class="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors leading-snug cursor-pointer"
        >
          {{ event.title }}
        </h4>
        <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <span class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
            <Clock class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            {{ formatDate(event.date) }}
          </span>
          <span v-if="event.address" class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
            <MapPin class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {{ event.address }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 flex-shrink-0 self-start">
        <button
          v-if="hasAnyRole(['teacher', 'school_admin', 'super_admin', 'event_teacher', 'manager'])"
          @click="handleOpenSettings"
          class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
          title="Manage event details, settings, costs, and student enrollments"
        >
          <Settings class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Settings & Roster
        </button>
        <button
          v-if="hasAnyRole(['teacher', 'school_admin', 'super_admin', 'event_teacher', 'manager'])"
          @click="$emit('clone', event.id)"
          class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
          title="Clone as new template draft"
        >
          <Copy class="w-3.5 h-3.5" /> Template
        </button>
        <button
          v-if="hasAnyRole(['school_admin', 'super_admin', 'event_teacher', 'manager', 'teacher'])"
          @click="$emit('delete', event.id)"
          class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
          title="Delete Event"
        >
          <Trash class="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>

    <!-- Description -->
    <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950/60 p-4 rounded border border-slate-200 dark:border-slate-800">
      {{ event.description || 'No description provided.' }}
    </p>

    <!-- Class Mappings & Enrollment Actions -->
    <div class="space-y-2.5 pt-1" v-if="event.class_mappings?.length">
      <div
        v-for="m in event.class_mappings"
        :key="m.id"
        v-show="shouldShowMapping(m)"
        class="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 dark:bg-slate-950/40 rounded p-3.5 sm:p-4 gap-3 border border-slate-200 dark:border-slate-800"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
          <span class="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-bold">
            {{ m.level_name ? m.level_name + ' - ' + m.class_name : m.class_name || 'All Classes' }}
          </span>
        </div>
        <div class="flex flex-wrap items-center justify-between sm:justify-end gap-3">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
            {{ formatPrice(m.ticket_price) }}
          </span>

          <!-- Student: Enroll -->
          <button
            v-if="hasRole('student') && !isEnrolled(m.id)"
            @click="$emit('enroll', m.id)"
            class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition-colors"
          >
            Enroll Now
          </button>
          <span v-else-if="hasRole('student')" class="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded border border-emerald-200 dark:border-emerald-800">
            <CheckCircle class="w-3.5 h-3.5 text-emerald-600" /> Enrolled
          </span>

          <!-- Parent: Child enrollment selectors -->
          <div v-if="hasRole('parent')" class="flex flex-col items-end gap-1.5">
            <div v-for="child in getChildrenForMapping(m)" :key="child.id" class="flex items-center gap-2 text-xs font-semibold">
              <!-- Enrolled State -->
              <span v-if="getChildEnrollment(m.id, child.id)" class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" :class="getStateClass(getChildEnrollment(m.id, child.id).state)">
                <CheckCircle class="w-3.5 h-3.5 text-emerald-600" />
                {{ child.name }}: {{ getChildEnrollment(m.id, child.id).state.replace(/_/g, ' ') }}
              </span>

              <!-- Unenrolled State: Direct Enroll Button -->
              <button
                v-else
                :id="'enroll-child-' + m.id + '-' + child.id"
                @click="$emit('parent-enroll', { studentId: child.id, mapId: m.id })"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition-colors flex items-center gap-1.5"
              >
                Enroll {{ child.name }}
              </button>
            </div>

            <!-- Fallback if parent has no linked children yet -->
            <div v-if="!children.length" class="flex items-center gap-2">
              <input
                :id="'enroll-name-' + m.id"
                v-model="childNameInput[m.id]"
                type="text"
                placeholder="Child name..."
                class="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-blue-600 w-32"
              />
              <button
                :id="'enroll-btn-' + m.id"
                @click="handleEnrollClick(m)"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition-colors"
              >
                Enroll
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';
import { Clock, MapPin, CheckCircle, Copy, Trash, Settings } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  userRole: {
    type: [String, Array],
    required: false
  },
  enrollments: {
    type: Array,
    required: true
  },
  children: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['enroll', 'parent-enroll', 'clone', 'delete', 'open-settings']);
const childNameInput = reactive({});

const handleOpenSettings = () => {
  emit('open-settings', props.event.id);
  if (router) {
    router.push(`/events/${props.event.id}`);
  }
};

const handleEnrollClick = (m) => {
  const name = (childNameInput[m.id] || '').trim();
  if (!name) return;
  const matchedChild = props.children.find(c => c.name.toLowerCase() === name.toLowerCase()) || props.children[0];
  if (matchedChild) {
    emit('parent-enroll', { studentId: matchedChild.id, mapId: m.id });
    childNameInput[m.id] = '';
  }
};

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatPrice = (val) => {
  const num = parseFloat(val || 0);
  return num.toFixed(2) + ' JOD';
};

const hasRole = (role) => {
  return authStore.hasRole(role) || authStore.can(`enrollment:${role === 'parent' ? 'parent_approve' : 'request'}`);
};

const hasAnyRole = (rolesArray) => {
  return authStore.hasAnyRole(rolesArray) || rolesArray.some(role => authStore.can(`event:${role === 'teacher' ? 'edit' : 'review'}`));
};

const shouldShowMapping = (m) => {
  if (hasRole('student')) {
    // Only show mapping matching student class
    return props.children.some(child => child.class_id === m.class_id);
  }
  if (hasRole('parent')) {
    return props.children.some(child => child.class_id === m.class_id);
  }
  return true;
};

const isEnrolled = (mapId) => {
  return props.enrollments.some(en => en.event_class_map_id === mapId);
};

const getChildrenForMapping = (m) => {
  return props.children.filter(c => c.class_id === m.class_id);
};

const getChildEnrollment = (mapId, childId) => {
  return props.enrollments.find(en => en.event_class_map_id === mapId && en.student_id === childId);
};

const getUnenrolledChildren = (m) => {
  return props.children.filter(child => 
    child.class_id === m.class_id && 
    !props.enrollments.some(en => en.event_class_map_id === m.id && en.student_id === child.id)
  );
};

const getStateClass = (state) => {
  if (state === 'approved_by_teacher') return 'text-emerald-700 dark:text-emerald-400 font-bold';
  if (state.startsWith('rejected')) return 'text-rose-700 dark:text-rose-400 font-bold';
  return 'text-amber-700 dark:text-amber-400 font-bold';
};
</script>
