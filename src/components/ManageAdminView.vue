<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <header :class="{'-translate-y-full opacity-0': !showHeader, 'translate-y-0 opacity-100': showHeader}" class="fixed top-0 left-0 right-0 z-30 bg-gray-900 border-b border-gray-800 px-8 h-16 flex items-center gap-3 transition-transform duration-300 ease-in-out">
      <ShieldCheck class="w-5 h-5 text-amber-400" />
      <div>
        <h2 class="text-base font-bold text-white">Admin Panel</h2>
        <p class="text-xs theme-text-muted">Manage parent–student links and view all records</p>
      </div>
    </header>

    <div class="p-8 max-w-6xl mx-auto space-y-8">
      <!-- Alerts -->
      <transition name="fade">
        <div v-if="msg" class="flex items-center gap-2.5 p-3.5 rounded-xl text-sm font-semibold border"
          :class="msg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'">
          <CheckCircle v-if="msg.type === 'success'" class="w-4 h-4 flex-shrink-0" />
          <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
          {{ msg.text }}
        </div>
      </transition>

      <!-- ─── Section 1: Link Parent → Student ──────────────────────────── -->
      <section class="theme-card rounded-2xl p-6">
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800/50">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Link2 class="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Link Parent to Student</h3>
            <p class="text-xs theme-text-muted mt-0.5">Search & assign a guardian to a student account</p>
          </div>
        </div>

        <form @submit.prevent="handleLink" class="grid md:grid-cols-3 gap-4 items-end">
          <!-- Student Search Selector -->
          <div class="relative student-select-box">
            <label class="block text-xs font-semibold uppercase tracking-wider theme-text-muted mb-1.5">
              Student <span v-if="linkForm.student_id" class="text-emerald-400 font-normal lowercase">(selected)</span>
            </label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
              <input
                type="text"
                v-model="studentQuery"
                @focus="isStudentOpen = true"
                @input="isStudentOpen = true"
                placeholder="Search student by name/email…"
                class="w-full theme-card-subtle/70 border border-gray-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 theme-text-heading rounded-xl pl-10 pr-9 py-3 text-sm focus:outline-none transition-all"
              />
              <button 
                v-if="studentQuery || linkForm.student_id" 
                type="button" 
                @click="clearStudent"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                title="Clear selection"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Student Dropdown Popup -->
            <div 
              v-if="isStudentOpen" 
              class="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl divide-y divide-gray-800/60"
            >
              <div 
                v-for="s in linkFilteredStudents" 
                :key="s.id"
                @mousedown.prevent="selectStudent(s)"
                class="p-3 hover:bg-amber-500/10 hover:text-amber-300 cursor-pointer transition-colors flex items-center justify-between"
                :class="{'bg-amber-500/20 border-l-2 border-amber-400': String(s.id) === String(linkForm.student_id)}"
              >
                <div>
                  <div class="text-xs font-bold text-white">{{ s.name || 'Unnamed Student' }}</div>
                  <div class="text-[11px] theme-text-muted">{{ s.email }}</div>
                </div>
                <span v-if="s.class_name" class="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                  {{ s.class_name }}
                </span>
              </div>
              <div v-if="!linkFilteredStudents.length" class="p-3 text-xs text-center theme-text-muted">
                No matching students found
              </div>
            </div>
          </div>

          <!-- Parent Search Selector -->
          <div class="relative parent-select-box">
            <label class="block text-xs font-semibold uppercase tracking-wider theme-text-muted mb-1.5">
              Parent / Guardian <span v-if="linkForm.parent_id" class="text-emerald-400 font-normal lowercase">(selected)</span>
            </label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
              <input
                type="text"
                v-model="parentQuery"
                @focus="isParentOpen = true"
                @input="isParentOpen = true"
                placeholder="Search parent by name/email…"
                class="w-full theme-card-subtle/70 border border-gray-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 theme-text-heading rounded-xl pl-10 pr-9 py-3 text-sm focus:outline-none transition-all"
              />
              <button 
                v-if="parentQuery || linkForm.parent_id" 
                type="button" 
                @click="clearParent"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                title="Clear selection"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Parent Dropdown Popup -->
            <div 
              v-if="isParentOpen" 
              class="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl divide-y divide-gray-800/60"
            >
              <div 
                v-for="p in linkFilteredParents" 
                :key="p.id"
                @mousedown.prevent="selectParent(p)"
                class="p-3 hover:bg-amber-500/10 hover:text-amber-300 cursor-pointer transition-colors flex items-center justify-between"
                :class="{'bg-amber-500/20 border-l-2 border-amber-400': String(p.id) === String(linkForm.parent_id)}"
              >
                <div>
                  <div class="text-xs font-bold text-white">{{ p.name || p.email }}</div>
                  <div class="text-[11px] theme-text-muted">{{ p.email }}</div>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 font-mono">
                  ID: {{ p.id }}
                </span>
              </div>
              <div v-if="!linkFilteredParents.length" class="p-3 text-xs text-center theme-text-muted">
                No matching parents found
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="linking || !linkForm.student_id || !linkForm.parent_id"
            class="flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm text-white transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); box-shadow: 0 4px 16px rgba(245,158,11,0.25);">
            <Loader2 v-if="linking" class="w-4 h-4 animate-spin" />
            <Link2 v-else class="w-4 h-4" />
            {{ linking ? 'Linking…' : 'Link Account' }}
          </button>
        </form>
      </section>

      <!-- ─── Section 2: Two Tables Side by Side ────────────────────────── -->
      <div class="grid md:grid-cols-2 gap-6">

        <!-- Students Table -->
        <section class="theme-card rounded-2xl overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <GraduationCap class="w-4 h-4 text-sky-400" />
              <h3 class="text-sm font-bold text-white">Students</h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {{ students.length }}
              </span>
            </div>
            <input v-model="studentSearch" type="text" placeholder="Search…"
              class="theme-card-subtle border border-gray-800 rounded-lg px-3 py-1.5 text-xs theme-text-heading placeholder-slate-600 focus:outline-none focus:border-sky-500/50 w-32 transition-all" />
          </div>
          <div class="overflow-auto max-h-80">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-gray-800/50">
                  <th class="text-left px-4 py-2.5 theme-text-muted font-semibold uppercase tracking-wider">Name</th>
                  <th class="text-left px-4 py-2.5 theme-text-muted font-semibold uppercase tracking-wider">Class</th>
                  <th class="text-left px-4 py-2.5 theme-text-muted font-semibold uppercase tracking-wider">Parent</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/30">
                <tr v-for="s in filteredStudents" :key="s.id"
                  class="hover:bg-slate-800/30 transition-colors">
                  <td class="px-4 py-3">
                    <div class="font-semibold theme-text-heading truncate max-w-28">{{ s.name || '—' }}</div>
                    <div class="theme-text-muted truncate max-w-28">{{ s.email }}</div>
                  </td>
                  <td class="px-4 py-3 theme-text-muted">{{ s.class_name || '—' }}</td>
                  <td class="px-4 py-3">
                    <span v-if="s.parents && s.parents.length" class="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/15 font-semibold">
                      Linked
                    </span>
                    <span v-else class="theme-text-muted">—</span>
                  </td>
                </tr>
                <tr v-if="!filteredStudents.length">
                  <td colspan="3" class="px-4 py-8 text-center theme-text-muted">No students found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Parents Table -->
        <section class="theme-card rounded-2xl overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <Users class="w-4 h-4 text-violet-400" />
              <h3 class="text-sm font-bold text-white">Parents</h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {{ parents.length }}
              </span>
            </div>
            <input v-model="parentSearch" type="text" placeholder="Search…"
              class="theme-card-subtle border border-gray-800 rounded-lg px-3 py-1.5 text-xs theme-text-heading placeholder-slate-600 focus:outline-none focus:border-violet-500/50 w-32 transition-all" />
          </div>
          <div class="overflow-auto max-h-80">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-gray-800/50">
                  <th class="text-left px-4 py-2.5 theme-text-muted font-semibold uppercase tracking-wider">Parent</th>
                  <th class="text-left px-4 py-2.5 theme-text-muted font-semibold uppercase tracking-wider">Email</th>
                  <th class="text-left px-4 py-2.5 theme-text-muted font-semibold uppercase tracking-wider">ID</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/30">
                <tr v-for="p in filteredParents" :key="p.id"
                  class="hover:bg-slate-800/30 transition-colors">
                  <td class="px-4 py-3">
                    <div class="font-semibold theme-text-heading">{{ p.name || 'No name' }}</div>
                  </td>
                  <td class="px-4 py-3 theme-text-muted truncate max-w-32">{{ p.email }}</td>
                  <td class="px-4 py-3 theme-text-muted font-mono">{{ p.id }}</td>
                </tr>
                <tr v-if="!filteredParents.length">
                  <td colspan="3" class="px-4 py-8 text-center theme-text-muted">No parents found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- ─── Section 3: Existing Links ────────────────────────────────── -->
      <section class="theme-card rounded-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <Link2 class="w-4 h-4 text-emerald-400" />
            <h3 class="text-sm font-bold text-white">Active Parent–Student Links</h3>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {{ filteredLinkedStudents.length }} / {{ linkedStudents.length }}
            </span>
          </div>

          <!-- Links Search Input Bar -->
          <div class="relative w-full sm:w-64">
            <input
              type="text"
              v-model="linksSearch"
              placeholder="Search student, parent, or class..."
              class="w-full theme-card border border-gray-700 shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl pl-9 pr-8 py-1.5 text-xs focus:outline-none transition-colors"
            />
            <Search class="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <button
              v-if="linksSearch"
              @click="linksSearch = ''"
              class="absolute right-2.5 top-2 text-gray-400 hover:text-white text-xs font-bold"
              title="Clear search"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="overflow-auto max-h-64">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-gray-800/50">
                <th class="text-left px-5 py-2.5 theme-text-muted font-semibold uppercase tracking-wider">Student</th>
                <th class="text-left px-5 py-2.5 theme-text-muted font-semibold uppercase tracking-wider">Class</th>
                <th class="text-left px-5 py-2.5 theme-text-muted font-semibold uppercase tracking-wider">Linked Parents</th>
                <th class="text-left px-5 py-2.5 theme-text-muted font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/30">
              <tr v-for="s in filteredLinkedStudents" :key="s.id" class="hover:bg-slate-800/20 transition-colors">
                <td class="px-5 py-3">
                  <div class="font-semibold theme-text-heading">{{ s.name }}</div>
                  <div class="theme-text-muted">{{ s.email }}</div>
                </td>
                <td class="px-5 py-3 theme-text-muted">{{ s.class_name || '—' }}</td>
                <td class="px-5 py-3">
                  <div class="space-y-1">
                    <div v-for="p in s.parents" :key="p.id" class="theme-text-heading font-medium">
                      {{ p.name || 'No name' }} <span class="theme-text-muted">({{ p.email }})</span>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3">
                  <span class="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle class="w-3 h-3" /> Linked
                  </span>
                </td>
              </tr>
              <tr v-if="!filteredLinkedStudents.length">
                <td colspan="4" class="px-5 py-8 text-center theme-text-muted">
                  {{ linksSearch ? 'No active parent–student links match your search query.' : 'No active links yet' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
const showHeader = ref(true);
import {
  ShieldCheck, Link2, GraduationCap, Users, ChevronDown,
  CheckCircle, AlertCircle, Loader2, Search, X
} from 'lucide-vue-next';
import { apiLoadStudents, apiLoadParents, apiLinkParentStudent } from '../api';

const students = ref([]);
const parents = ref([]);
const linking = ref(false);
const msg = ref(null);
const studentSearch = ref('');
const parentSearch = ref('');
const linksSearch = ref('');

const studentQuery = ref('');
const parentQuery = ref('');
const isStudentOpen = ref(false);
const isParentOpen = ref(false);

const linkForm = ref({ student_id: '', parent_id: '' });

const linkFilteredStudents = computed(() => {
  const q = studentQuery.value.trim().toLowerCase();
  if (!q) return students.value;
  return students.value.filter(s =>
    (s.name && s.name.toLowerCase().includes(q)) ||
    (s.email && s.email.toLowerCase().includes(q)) ||
    (s.class_name && s.class_name.toLowerCase().includes(q))
  );
});

const linkFilteredParents = computed(() => {
  const q = parentQuery.value.trim().toLowerCase();
  if (!q) return parents.value;
  return parents.value.filter(p =>
    (p.name && p.name.toLowerCase().includes(q)) ||
    (p.email && p.email.toLowerCase().includes(q))
  );
});

const selectStudent = (s) => {
  linkForm.value.student_id = s.id;
  studentQuery.value = s.name ? `${s.name} (${s.email})` : s.email;
  isStudentOpen.value = false;
};

const clearStudent = () => {
  linkForm.value.student_id = '';
  studentQuery.value = '';
  isStudentOpen.value = false;
};

const selectParent = (p) => {
  linkForm.value.parent_id = p.id;
  parentQuery.value = p.name ? `${p.name} (${p.email})` : p.email;
  isParentOpen.value = false;
};

const clearParent = () => {
  linkForm.value.parent_id = '';
  parentQuery.value = '';
  isParentOpen.value = false;
};

const filteredStudents = computed(() => {
  const q = studentSearch.value.toLowerCase();
  return students.value.filter(s =>
    !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
  );
});

const filteredParents = computed(() => {
  const q = parentSearch.value.toLowerCase();
  return parents.value.filter(p =>
    !q || p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
  );
});

const linkedStudents = computed(() =>
  students.value.filter(s => s.parents && s.parents.length > 0)
);

const filteredLinkedStudents = computed(() => {
  const q = linksSearch.value.trim().toLowerCase();
  if (!q) return linkedStudents.value;
  return linkedStudents.value.filter(s => {
    const matchStudentName = s.name?.toLowerCase().includes(q);
    const matchStudentEmail = s.email?.toLowerCase().includes(q);
    const matchClassName = s.class_name?.toLowerCase().includes(q);
    const matchParent = (s.parents || []).some(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
    return matchStudentName || matchStudentEmail || matchClassName || matchParent;
  });
});

const showMsg = (type, text) => {
  msg.value = { type, text };
  setTimeout(() => { msg.value = null; }, 4000);
};

const handleClickOutside = (e) => {
  if (!e.target.closest('.student-select-box')) {
    isStudentOpen.value = false;
  }
  if (!e.target.closest('.parent-select-box')) {
    isParentOpen.value = false;
  }
};

onMounted(async () => {
  try {
    const [s, p] = await Promise.all([apiLoadStudents(), apiLoadParents()]);
    students.value = Array.isArray(s) ? s : [];
    parents.value = Array.isArray(p) ? p : [];
  } catch (err) {
    showMsg('error', 'Failed to load data: ' + err.message);
  }
  
  window.addEventListener('click', handleClickOutside);

  // Scroll hide/show logic using window scroll
  let lastScrollY = window.scrollY;
  const onScroll = () => {
    const currentY = window.scrollY;
    if (currentY > lastScrollY && currentY > 50) {
      showHeader.value = false;
    } else {
      showHeader.value = true;
    }
    lastScrollY = currentY;
  };
  window.addEventListener('scroll', onScroll);
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('click', handleClickOutside);
  });
});

const handleLink = async () => {
  linking.value = true;
  try {
    await apiLinkParentStudent({
      student_id: parseInt(linkForm.value.student_id),
      parent_id: linkForm.value.parent_id
    });
    // Refresh students list to reflect new parent_id
    students.value = await apiLoadStudents();
    linkForm.value = { student_id: '', parent_id: '' };
    studentQuery.value = '';
    parentQuery.value = '';
    showMsg('success', 'Parent linked to student successfully!');
  } catch (err) {
    showMsg('error', err.message || 'Failed to create link.');
  } finally {
    linking.value = false;
  }
};
</script>
