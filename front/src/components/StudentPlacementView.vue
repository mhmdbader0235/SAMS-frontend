<template>
  <div class="space-y-4">

    <!-- Alerts Banner -->
    <transition name="fade">
      <div v-if="successMsg" class="p-3.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-semibold flex items-center gap-2.5 shadow-xs">
        <CheckCircle class="w-4 h-4 shrink-0 text-emerald-600" />
        <span>{{ successMsg }}</span>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="errorMsg" class="p-3.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 font-semibold flex items-center gap-2.5 shadow-xs">
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
        <span>{{ errorMsg }}</span>
      </div>
    </transition>

    <div class="space-y-6 animation-fade-in">

      <!-- Enrollment KPI Dashboard -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="theme-card p-4 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3.5">
          <div class="w-10 h-10 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <GraduationCap class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xl font-black text-slate-900">{{ structureStore.allStudentsList.length }}</div>
            <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Total Registered Students</div>
          </div>
        </div>

        <div class="theme-card p-4 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3.5">
          <div class="w-10 h-10 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckSquare class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xl font-black text-slate-900">{{ structureStore.assignedStudentsCount }}</div>
            <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Placed in Classes</div>
          </div>
        </div>

        <div class="theme-card p-4 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3.5" :class="{'ring-1 ring-amber-400 bg-amber-50/40': structureStore.unassignedStudentsCount > 0}">
          <div class="w-10 h-10 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertCircle class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xl font-black text-slate-900">{{ structureStore.unassignedStudentsCount }}</div>
            <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Unassigned Students</div>
          </div>
        </div>
      </div>

      <!-- Filters & Multi-Enrollment Search Controls -->
      <div class="theme-card p-4 rounded border border-slate-200 bg-white shadow-xs space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          <!-- Search & Status Pills -->
          <div class="flex flex-wrap items-center gap-3 flex-1">
            <div class="relative w-full sm:w-72">
              <input
                type="text"
                v-model="enrollSearchQuery"
                placeholder="Search by student, email, parent..."
                class="w-full bg-white border border-slate-300 rounded pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
              />
              <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <!-- Filter Status Badges -->
            <div class="flex items-center p-1 bg-slate-100 rounded border border-slate-200 text-xs font-semibold">
              <button
                @click="enrollStatusFilter = 'all'"
                class="px-3 py-1.5 rounded transition-all font-bold"
                :class="enrollStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
              >
                All ({{ structureStore.allStudentsList.length }})
              </button>
              <button
                @click="enrollStatusFilter = 'unassigned'"
                class="px-3 py-1.5 rounded transition-all flex items-center gap-1.5 font-bold"
                :class="enrollStatusFilter === 'unassigned' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-amber-700 hover:text-amber-900'"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500" v-if="enrollStatusFilter !== 'unassigned'"></span>
                Unassigned ({{ structureStore.unassignedStudentsCount }})
              </button>
              <button
                @click="enrollStatusFilter = 'assigned'"
                class="px-3 py-1.5 rounded transition-all font-bold"
                :class="enrollStatusFilter === 'assigned' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'text-emerald-700 hover:text-emerald-900'"
              >
                Enrolled ({{ structureStore.assignedStudentsCount }})
              </button>
            </div>

            <!-- Grade Level Filter -->
            <select
              v-model="enrollLevelFilter"
              class="bg-white border border-slate-300 text-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600 shadow-xs"
            >
              <option value="all">All Grade Levels</option>
              <option v-for="lvl in structureStore.sortedLevelsByOrdinal" :key="lvl.level_id" :value="lvl.level_id">
                {{ lvl.name }}
              </option>
            </select>
          </div>

          <!-- Select All / Unassigned Helper & CSV Export -->
          <div class="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              @click="toggleSelectAllUnassigned"
              class="px-3 py-2 rounded text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-xs"
            >
              {{ areAllUnassignedSelected ? 'Deselect Unassigned' : 'Select All Unassigned' }}
            </button>

            <!-- Export Filtered Students to CSV -->
            <button
              @click="exportFilteredStudentsCSV"
              class="px-3.5 py-2 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
              :title="`Export ${filteredStudentsList.length} filtered students to CSV`"
            >
              <Download class="w-3.5 h-3.5" />
              <span>Export CSV ({{ filteredStudentsList.length }})</span>
            </button>

            <span class="text-xs text-slate-500 font-medium">{{ filteredStudentsList.length }} students listed</span>
          </div>
        </div>

        <!-- Floating Multi-Student Bulk Action Bar -->
        <transition name="fade">
          <div v-if="selectedStudentIds.length > 0" class="p-4 bg-indigo-50 border border-indigo-200 rounded flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {{ selectedStudentIds.length }}
              </div>
              <div>
                <div class="font-bold text-slate-900 text-xs">{{ selectedStudentIds.length }} Students Selected</div>
                <div class="text-[11px] text-slate-600">Choose a class section below to place all selected students in 1 click.</div>
              </div>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <select
                v-model="targetBulkClassId"
                class="bg-white border border-slate-300 text-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 flex-1 sm:w-60 font-medium shadow-xs"
              >
                <option :value="null">-- Choose Target Class Section --</option>
                <optgroup v-for="lvl in structureStore.sortedLevelsByOrdinal" :key="lvl.level_id" :label="lvl.name">
                  <option v-for="c in structureStore.getClassesForLevel(lvl.level_id)" :key="c.id" :value="c.id">
                    {{ c.name }} ({{ c.student_count || 0 }} seats occupied)
                  </option>
                </optgroup>
              </select>

              <button
                @click="executeBulkEnroll"
                :disabled="!targetBulkClassId || isBulkSubmitting"
                class="btn-primary text-xs px-4 py-2 rounded font-bold text-white transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <Loader2 v-if="isBulkSubmitting" class="w-3.5 h-3.5 animate-spin" />
                <UserCheck v-else class="w-3.5 h-3.5" />
                Enroll Selected ({{ selectedStudentIds.length }})
              </button>

              <button
                @click="selectedStudentIds = []"
                class="p-2 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-200 transition-colors"
                title="Clear Selection"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- Students Placement Directory Table -->
      <div class="theme-card rounded border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200 font-bold">
                <th class="p-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    :checked="isAllVisibleSelected"
                    @change="toggleSelectAllVisible"
                    class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th class="p-3.5 font-bold">Student Name & Info</th>
                <th class="p-3.5 font-bold">Linked Parent / Contact</th>
                <th class="p-3.5 font-bold">Current Class Status</th>
                <th class="p-3.5 font-bold w-72">Class Section Assignment</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-if="filteredStudentsList.length === 0">
                <td colspan="5" class="py-12 text-center text-slate-500 text-xs italic">
                  No students found matching current filters.
                </td>
              </tr>

              <tr
                v-for="st in filteredStudentsList"
                :key="st.id"
                class="transition-colors hover:bg-slate-50/80"
                :class="{'bg-indigo-50/40': selectedStudentIds.includes(st.id)}"
              >
                <!-- Checkbox -->
                <td class="p-3.5 text-center">
                  <input
                    type="checkbox"
                    :value="st.id"
                    v-model="selectedStudentIds"
                    class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </td>

                <!-- Student Info -->
                <td class="p-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                      :class="st.class_id ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-amber-50 text-amber-700 border border-amber-300'">
                      {{ st.name ? st.name.charAt(0).toUpperCase() : 'S' }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 text-xs">{{ st.name }}</div>
                      <div class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>{{ st.email }}</span>
                        <span v-if="st.gender" class="text-slate-600 uppercase text-[9px] px-1.5 py-0.2 rounded bg-slate-100 font-bold border border-slate-200">{{ st.gender }}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Parent Info -->
                <td class="p-3.5">
                  <div v-if="st.parent_names" class="text-xs">
                    <span class="font-semibold text-slate-800 block">{{ st.parent_names }}</span>
                    <span class="text-[11px] text-slate-500">{{ st.parent_emails || 'No email' }}</span>
                  </div>
                  <span v-else class="text-[11px] text-slate-400 italic">No parent linked</span>
                </td>

                <!-- Current Class Badge -->
                <td class="p-3.5">
                  <div v-if="st.class_id" class="flex items-center gap-1.5">
                    <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle class="w-3 h-3" /> {{ st.class_name || 'Enrolled' }}
                    </span>
                  </div>
                  <div v-else>
                    <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 flex items-center gap-1">
                      <AlertCircle class="w-3 h-3" /> Unassigned
                    </span>
                  </div>
                </td>

                <!-- Direct Instant Class Selector -->
                <td class="p-3.5">
                  <div class="flex items-center gap-2">
                    <select
                      :value="st.class_id || ''"
                      @change="handleSingleStudentPlacement(st, $event.target.value)"
                      class="w-full bg-white border border-slate-300 text-slate-800 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
                      :class="{'border-amber-400 bg-amber-50/20': !st.class_id}"
                    >
                      <option value="">-- No Class (Unassigned) --</option>
                      <optgroup v-for="lvl in structureStore.sortedLevelsByOrdinal" :key="lvl.level_id" :label="lvl.name">
                        <option v-for="c in structureStore.getClassesForLevel(lvl.level_id)" :key="c.id" :value="c.id">
                          {{ c.name }} ({{ c.student_count || 0 }} seats occupied)
                        </option>
                      </optgroup>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  GraduationCap, CheckSquare, AlertCircle, Search, Download, UserCheck,
  Loader2, X, CheckCircle
} from 'lucide-vue-next';
import { apiReassignStudentClass, apiBulkAssignStudents } from '../api';
import { useStructureStore } from '../store';

const structureStore = useStructureStore();
structureStore.ensureLiveStructureLoaded();

const successMsg = ref(null);
const errorMsg = ref(null);
const setSuccess = (msg) => {
  successMsg.value = msg;
  setTimeout(() => { successMsg.value = null; }, 5000);
};
const setError = (msg) => {
  errorMsg.value = msg;
  setTimeout(() => { errorMsg.value = null; }, 5000);
};

const enrollSearchQuery = ref('');
const enrollStatusFilter = ref('all');
const enrollLevelFilter = ref('all');
const selectedStudentIds = ref([]);
const targetBulkClassId = ref(null);
const isBulkSubmitting = ref(false);

const filteredStudentsList = computed(() => {
  let list = structureStore.allStudentsList;

  if (enrollStatusFilter.value === 'unassigned') {
    list = list.filter(s => !s.class_id);
  } else if (enrollStatusFilter.value === 'assigned') {
    list = list.filter(s => !!s.class_id);
  }

  if (enrollLevelFilter.value !== 'all') {
    const targetLevelId = parseInt(enrollLevelFilter.value);
    const classesInLevel = new Set(structureStore.liveClasses.filter(c => c.level_id === targetLevelId).map(c => c.id));
    list = list.filter(s => s.class_id && classesInLevel.has(s.class_id));
  }

  if (enrollSearchQuery.value.trim()) {
    const q = enrollSearchQuery.value.toLowerCase();
    list = list.filter(s => {
      const matchName = (s.name || '').toLowerCase().includes(q);
      const matchEmail = (s.email || '').toLowerCase().includes(q);
      const matchParent = (s.parent_names || '').toLowerCase().includes(q);
      const matchClass = (s.class_name || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchParent || matchClass;
    });
  }

  return list;
});

const isAllVisibleSelected = computed(() => {
  if (filteredStudentsList.value.length === 0) return false;
  return filteredStudentsList.value.every(s => selectedStudentIds.value.includes(s.id));
});

const toggleSelectAllVisible = () => {
  if (isAllVisibleSelected.value) {
    const visibleIds = new Set(filteredStudentsList.value.map(s => s.id));
    selectedStudentIds.value = selectedStudentIds.value.filter(id => !visibleIds.has(id));
  } else {
    const visibleIds = filteredStudentsList.value.map(s => s.id);
    selectedStudentIds.value = Array.from(new Set([...selectedStudentIds.value, ...visibleIds]));
  }
};

const areAllUnassignedSelected = computed(() => {
  const unassigned = structureStore.allStudentsList.filter(s => !s.class_id);
  if (unassigned.length === 0) return false;
  return unassigned.every(s => selectedStudentIds.value.includes(s.id));
});

const toggleSelectAllUnassigned = () => {
  const unassignedIds = structureStore.allStudentsList.filter(s => !s.class_id).map(s => s.id);
  if (areAllUnassignedSelected.value) {
    const unSet = new Set(unassignedIds);
    selectedStudentIds.value = selectedStudentIds.value.filter(id => !unSet.has(id));
  } else {
    selectedStudentIds.value = Array.from(new Set([...selectedStudentIds.value, ...unassignedIds]));
  }
};

const exportFilteredStudentsCSV = () => {
  const list = filteredStudentsList.value;
  if (!list || list.length === 0) {
    setError('No students available to export with current filters.');
    return;
  }

  const headers = [
    'Student ID', 'Student Name', 'Email', 'Gender', 'Birth Date',
    'Enrollment Status', 'Class Section', 'Parent Names', 'Parent Emails', 'Created At'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = list.map(s => [
    escapeCSV(s.id),
    escapeCSV(s.name || ''),
    escapeCSV(s.email || ''),
    escapeCSV(s.gender || ''),
    escapeCSV(s.birth_data || ''),
    escapeCSV(s.class_id ? 'Enrolled' : 'Unassigned'),
    escapeCSV(s.class_name || 'Unassigned'),
    escapeCSV(s.parent_names || (s.parents ? s.parents.map(p => p.name).join(', ') : '')),
    escapeCSV(s.parent_emails || (s.parents ? s.parents.map(p => p.email).join(', ') : '')),
    escapeCSV(s.created_at ? new Date(s.created_at).toLocaleDateString() : '')
  ].join(','));

  const BOM = String.fromCharCode(0xFEFF);
  const csvContent = BOM + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filterLabel = enrollStatusFilter.value || 'all';
  link.setAttribute('href', url);
  link.setAttribute('download', `Students_Roster_${filterLabel}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  setSuccess(`Exported ${list.length} students to CSV successfully.`);
};

// Direct Single Student Placement (Unrestricted)
const handleSingleStudentPlacement = async (student, targetClassVal) => {
  const previousClassId = student.class_id;
  const previousClassName = student.class_name;
  const newClassId = targetClassVal ? parseInt(targetClassVal) : null;
  const targetClassObj = structureStore.liveClasses.find(c => c.id === newClassId);

  student.class_id = newClassId;
  student.class_name = targetClassObj ? targetClassObj.name : null;

  try {
    await apiReassignStudentClass(student.id, newClassId);
    setSuccess(`Student ${student.name} placed in ${targetClassObj ? targetClassObj.name : 'Unassigned'} successfully.`);
    await structureStore.reloadLiveStructure();
  } catch (err) {
    student.class_id = previousClassId;
    student.class_name = previousClassName;
    setError(err.message || 'Failed to place student');
  }
};

// Bulk Placement Handler
const executeBulkEnroll = async () => {
  if (!targetBulkClassId.value || selectedStudentIds.value.length === 0) return;
  const targetClassObj = structureStore.liveClasses.find(c => c.id === targetBulkClassId.value);
  isBulkSubmitting.value = true;

  try {
    await apiBulkAssignStudents(selectedStudentIds.value, targetBulkClassId.value);
    setSuccess(`Successfully enrolled ${selectedStudentIds.value.length} students into ${targetClassObj ? targetClassObj.name : 'selected class'}!`);
    selectedStudentIds.value = [];
    targetBulkClassId.value = null;
    await structureStore.reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to bulk enroll students');
  } finally {
    isBulkSubmitting.value = false;
  }
};
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
