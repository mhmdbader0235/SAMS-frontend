<template>
  <div v-if="!dismissed && hasAnyPending" class="theme-card rounded p-5 border border-blue-200 bg-blue-50/40 shadow-xs space-y-3.5">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-2">
        <ListChecks class="w-4 h-4" /> Finish Setting Up {{ schoolStore.displayName }}
      </h3>
      <button @click="dismissed = true" class="p-1 rounded text-blue-400 hover:text-blue-700 hover:bg-blue-100 transition-colors" title="Dismiss">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
    <div class="grid sm:grid-cols-3 gap-3">
      <router-link
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        class="flex items-start gap-2.5 p-3 rounded border bg-white transition-colors"
        :class="item.done ? 'border-emerald-200' : 'border-slate-200 hover:border-blue-300'"
      >
        <CheckCircle v-if="item.done" class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <Circle v-else class="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
        <div class="min-w-0">
          <div class="text-xs font-bold" :class="item.done ? 'text-slate-500 line-through' : 'text-slate-900'">{{ item.title }}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">{{ item.hint }}</div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ListChecks, CheckCircle, Circle, X } from 'lucide-vue-next';
import { useStructureStore, useSchoolStore } from '../store';

const structureStore = useStructureStore();
const schoolStore = useSchoolStore();
const dismissed = ref(false);

onMounted(() => {
  structureStore.ensureLiveStructureLoaded();
});

const teachersInvited = computed(() => structureStore.teachersList.length > 0);
const studentsPlaced = computed(() => structureStore.allStudentsList.length > 0 && structureStore.unassignedStudentsCount === 0);
const homeroomsAssigned = computed(() => structureStore.liveClasses.some(c => !!c.head_teacher_id));

const items = computed(() => [
  {
    key: 'teachers',
    title: 'Invite teachers & staff',
    hint: teachersInvited.value ? `${structureStore.teachersList.length} on the roster` : 'Send invitations from Roles & Permissions',
    to: '/manage/users',
    done: teachersInvited.value
  },
  {
    key: 'students',
    title: 'Place students into classes',
    hint: structureStore.allStudentsList.length === 0
      ? 'No students registered yet'
      : `${structureStore.unassignedStudentsCount} unassigned`,
    to: '/manage/placement',
    done: studentsPlaced.value
  },
  {
    key: 'homerooms',
    title: 'Assign homeroom teachers',
    hint: homeroomsAssigned.value ? 'Assigned' : 'Set a head teacher per class section',
    to: '/manage/structure',
    done: homeroomsAssigned.value
  }
]);

const hasAnyPending = computed(() => items.value.some(i => !i.done));
</script>
