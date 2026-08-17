<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Title Banner -->
    <div class="flex items-center justify-between theme-card rounded-2xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Users class="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 class="text-xl font-bold theme-text-heading tracking-tight">My Class Roster</h2>
          <p class="text-xs text-gray-500 font-medium mt-0.5">View and manage your assigned students & parent contacts</p>
        </div>
      </div>
      <button
        @click="showCreateEventModal = true"
        class="btn-primary px-4 py-2 rounded-xl text-xs font-bold font-heading flex items-center gap-1.5 shadow-sm"
      >
        <Plus class="w-4 h-4" />
        Create Class Event Proposal
      </button>
    </div>

    <!-- Create Event Draft Modal -->
    <transition name="fade">
      <div v-if="showCreateEventModal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="theme-card border border-theme rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl relative">
          <div class="flex items-center justify-between border-b border-theme pb-4">
            <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
              <CalendarDays class="w-5 h-5 text-emerald-400" />
              Create Event Draft
            </h3>
            <button @click="showCreateEventModal = false" class="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>
          <EventWizard @completed="showCreateEventModal = false" />
        </div>
      </div>
    </transition>

    <div v-if="!myClassStudents.length" class="theme-card border-dashed rounded-2xl p-12 text-center shadow-sm">
      <Users class="w-10 h-10 text-gray-500 mx-auto mb-3" />
      <p class="theme-text-heading font-bold text-base">No students assigned</p>
      <p class="text-gray-500 text-sm mt-1">You are not the head of any class, or your class currently has no enrolled students.</p>
    </div>

    <div v-else class="theme-card rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm text-gray-300">
          <thead>
            <tr class="border-b border-gray-800 theme-card-subtle text-gray-500 font-bold text-xs uppercase tracking-wider">
              <th class="px-6 py-4">Student</th>
              <th class="px-6 py-4">Gender</th>
              <th class="px-6 py-4">Birth Date</th>
              <th class="px-6 py-4">Parent Contacts</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="student in myClassStudents" :key="student.id" class="hover:theme-card-subtle transition-colors">
              <!-- Student -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-blue-100 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                    {{ (student.name || '?')[0].toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-bold theme-text-heading">{{ student.name }}</div>
                    <div class="text-xs text-gray-500">{{ student.email }}</div>
                  </div>
                </div>
              </td>
              <!-- Gender -->
              <td class="px-6 py-4 text-gray-500 font-medium">
                {{ student.gender || 'Not specified' }}
              </td>
              <!-- Birth Date -->
              <td class="px-6 py-4 text-gray-500 font-medium">
                {{ student.birth_data || 'Not specified' }}
              </td>
              <!-- Parent Contacts -->
              <td class="px-6 py-4">
                <div v-if="student.parents && student.parents.length" class="flex flex-col gap-2">
                  <div v-for="parent in student.parents" :key="parent.id" class="theme-card-subtle rounded-xl rounded-xl p-3 max-w-xs shadow-2xs">
                    <div class="text-xs font-bold theme-text-heading">{{ parent.name }}</div>
                    <div class="mt-1 space-y-0.5 text-[11px] text-gray-500">
                      <div><span class="text-gray-500 font-medium">Email:</span> {{ parent.email }}</div>
                      <div><span class="text-gray-500 font-medium">Phone:</span> {{ parent.phone || 'N/A' }}</div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-xs text-gray-500 italic">
                  No linked parents
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '../store';
import { apiLoadClasses, apiLoadStudents } from '../api';
import { Users, CalendarDays, Plus, X } from 'lucide-vue-next';
import EventWizard from './wizard/EventWizard.vue';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const myClassStudents = ref([]);
const hasLoaded = ref(false);
const showCreateEventModal = ref(false);

const loadMyClass = async () => {
  if (user.value?.role === 'teacher' && !hasLoaded.value) {
    try {
      const classes = await apiLoadClasses();
      const myClass = classes.find(c => c.head_teacher_id === parseInt(user.value.user_id));
      if (myClass) {
        const allStudents = await apiLoadStudents();
        myClassStudents.value = allStudents.filter(s => s.class_id === myClass.id);
        hasLoaded.value = true;
      }
    } catch (err) {
      console.error('Failed to load my class:', err);
    }
  }
};

onMounted(() => {
  loadMyClass();
});

watch(user, () => {
  loadMyClass();
}, { immediate: true });
</script>
