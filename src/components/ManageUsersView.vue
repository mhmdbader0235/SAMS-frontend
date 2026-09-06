<template>
  <!-- Hard block for anyone without manage-users access -- this page (Students &
       Families / "/manage/users") is school_admin/super_admin only, plus
       whoever an admin has explicitly granted user:create/user:invite/
       teacher:create/student:create to via Manage Permissions (see
       authStore.canAccessManageUsers in store.js, the single shared
       definition). Presentation only: every mutation this page can trigger
       is independently rejected by the backend regardless of what renders
       here (TenantService._has_intersection checks in tenant/service.py, and
       the user:create check on create_manager specifically -- not
       create_school_admin, which stays strictly admin-only, in
       students/router.py). isBlockedFromAdminHub stays false while
       authStore.user hasn't loaded yet, so a hard reload lands here first and
       only flips to the denied view once role data actually resolves -- see
       the matching watch() in <script setup> below, which redirects rather
       than leaving an allowed viewer staring at a
       false "Access Denied" during that same load. -->
  <div v-if="isBlockedFromAdminHub" class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-md text-center space-y-3">
      <div class="w-12 h-12 mx-auto rounded bg-rose-50 border border-rose-200 flex items-center justify-center">
        <ShieldAlert class="w-6 h-6 text-rose-600" />
      </div>
      <h2 class="text-base font-bold text-slate-900">Access Denied</h2>
      <p class="text-sm text-slate-500">You do not have access to Students & Families management. Redirecting…</p>
    </div>
  </div>
  <div v-else class="min-h-screen">
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Title Banner -->
      <div class="flex items-center justify-between theme-card rounded-2xl p-6 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ClipboardList class="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 class="text-xl font-bold theme-text-heading tracking-tight">Management Forms</h2>
            <p class="text-xs text-gray-500 font-medium mt-0.5">Configure academic structures, users, and event planning</p>
          </div>
        </div>
        <router-link
          to="/manage/permissions"
          class="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
        >
          <KeyRound class="w-4 h-4" />
          <span>User Roles & Permissions</span>
        </router-link>
      </div>
    <!-- Alert Messages -->
    <transition name="fade">
      <div v-if="successMsg" class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 font-medium flex items-center gap-2">
        <CheckCircle class="w-4 h-4 shrink-0" />
        {{ successMsg }}
      </div>
    </transition>
    <transition name="fade">
      <div v-if="errorMsg" class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400 font-medium flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        {{ errorMsg }}
      </div>
    </transition>

    <!-- Form Panels -->
    <div class="space-y-6">
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Generate Invitation Token -->
        <div v-if="user?.role === 'school_admin' || user?.role === 'super_admin'" class="theme-card rounded-2xl shadow-sm p-6 space-y-4 md:col-span-2 border border-emerald-500/30 bg-emerald-500/5">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
              <KeyRound class="w-5 h-5 text-emerald-400" />
              Generate Single-Use Invitation Code
            </h3>
            <span class="text-xs text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">Admin Invitation Generator</span>
          </div>
          <p class="text-xs text-gray-400">Generate a unique invitation code for a specific user. The code locks their role, email, and school domain during registration.</p>

          <form @submit.prevent="handleGenerateInvite" class="grid sm:grid-cols-3 gap-4 items-end">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Target Email (Optional)</label>
              <input type="email" v-model="inviteForm.target_email" placeholder="user@school.com (Optional)" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Assign Role</label>
              <select v-model="inviteForm.role" required class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors">
                <option value="teacher">Teacher</option>
                <option value="manager">Manager</option>
                <option value="school_admin">School Admin</option>
                <option value="parent">Parent</option>
                <option value="student">Student</option>
                <option value="event_teacher">Event Lead Teacher</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Valid (Days)</label>
                <input type="number" min="1" max="30" v-model="inviteForm.valid_days" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors" />
              </div>
              <button type="submit" class="btn-primary theme-text-heading font-semibold shadow-xs font-medium px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95 flex items-center gap-1.5 shrink-0">
                <Plus class="w-4 h-4" /> Generate Code
              </button>
            </div>
          </form>

          <!-- Display Generated Code Result -->
          <div v-if="generatedInvite" class="mt-4 p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Generated Invitation Code</p>
              <p class="text-2xl font-mono font-extrabold text-white tracking-widest mt-0.5">{{ generatedInvite.code }}</p>
              <p class="text-xs text-gray-300 mt-1">
                Role: <span class="text-emerald-400 font-bold uppercase">{{ generatedInvite.role }}</span> | 
                Tenant: <span class="text-emerald-400 font-bold uppercase">{{ generatedInvite.tenant_id }}</span>
                <span v-if="generatedInvite.target_email"> | Email: <span class="text-emerald-400 font-bold">{{ generatedInvite.target_email }}</span></span>
              </p>
            </div>
            <button
              type="button"
              @click="copyInviteCode(generatedInvite.code)"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Copy class="w-4 h-4" /> Copy Code
            </button>
          </div>
        </div>

        <!-- Create Tenant (Super Admin only) -->
        <div v-if="user?.role === 'super_admin'" class="theme-card rounded-2xl shadow-sm p-6 space-y-4 md:col-span-2 border border-emerald-500/30 bg-emerald-500/5">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
              <Building2 class="w-5 h-5 text-emerald-400" />
              Create Tenant
            </h3>
            <span class="text-xs text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">Super Admin Only</span>
          </div>
          <p class="text-xs text-gray-400">Provision a new tenant (school) with its own isolated database schema.</p>

          <form @submit.prevent="handleCreateTenant" class="grid sm:grid-cols-3 gap-4 items-end">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tenant ID</label>
              <input type="text" v-model="tenantForm.tenant_id" required placeholder="e.g. tenant_c" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tenant Name</label>
              <input type="text" v-model="tenantForm.name" required placeholder="e.g. Greenwood School" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>
            <button type="submit" class="btn-primary theme-text-heading font-semibold shadow-xs font-medium px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95 flex items-center gap-1.5 shrink-0">
              <Plus class="w-4 h-4" /> Create Tenant
            </button>
          </form>
        </div>

        <!-- Create Student -->
        <div v-if="authStore.can('student:create')" class="theme-card rounded-2xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
            <UserPlus class="w-5 h-5 text-emerald-400" />
            Create Student Profile
          </h3>
          <form @submit.prevent="handleCreateStudent" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
              <input type="text" v-model="studentForm.name" required placeholder="John Doe" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email</label>
                <input type="email" v-model="studentForm.email" required placeholder="john@school.com" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Password</label>
                <input type="password" v-model="studentForm.password" required placeholder="••••••••" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div class="col-span-2">
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Class</label>
                <select v-model="studentForm.class_id" required class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors">
                  <option value="" disabled>Select Class...</option>
                  <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }} ({{ c.level_name }})</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Gender</label>
                <input type="text" v-model="studentForm.gender" placeholder="e.g. M/F" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Birth Date</label>
              <input type="date" v-model="studentForm.birth_data" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors text-gray-500" />
            </div>
            <button type="submit" class="btn-primary theme-text-heading font-semibold shadow-xs font-medium px-4 py-2 rounded-lg text-sm transition-all active:scale-95">Register Student</button>
          </form>
        </div>

        <!-- Create Teacher -->
        <div v-if="authStore.can('teacher:create')" class="theme-card rounded-2xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
            <UserPlus class="w-5 h-5 text-emerald-400" />
            Create Teacher Profile
          </h3>
          <form @submit.prevent="handleCreateTeacher" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
              <input type="text" v-model="teacherForm.name" required placeholder="Jane Smith" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email</label>
                <input type="email" v-model="teacherForm.email" required placeholder="jane@school.com" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Password</label>
                <input type="password" v-model="teacherForm.password" required placeholder="••••••••" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
              </div>
            </div>
            <button type="submit" class="btn-primary theme-text-heading font-semibold shadow-xs font-medium px-4 py-2 rounded-lg text-sm transition-all active:scale-95">Register Teacher</button>
          </form>
        </div>

        <!-- Create Manager (School Admin only -- matches the backend check) -->
        <div v-if="user?.role === 'school_admin' || user?.role === 'super_admin'" class="theme-card rounded-2xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
            <UserPlus class="w-5 h-5 text-emerald-400" />
            Create Manager Profile
          </h3>
          <form @submit.prevent="handleCreateManager" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email</label>
              <input type="email" v-model="managerForm.email" required placeholder="manager@school.com" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Password</label>
              <input type="password" v-model="managerForm.password" required placeholder="••••••••" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>
            <button type="submit" class="btn-primary theme-text-heading font-semibold shadow-xs font-medium px-4 py-2 rounded-lg text-sm transition-all active:scale-95">Register Manager</button>
          </form>
        </div>

        <!-- Create School Admin -->
        <div v-if="user?.role === 'school_admin' || user?.role === 'super_admin'" class="theme-card rounded-2xl shadow-sm p-6 space-y-4 border border-emerald-500/30 bg-emerald-500/5">
          <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
            <UserPlus class="w-5 h-5 text-emerald-400" />
            Create School Admin Profile
          </h3>
          <form @submit.prevent="handleCreateSchoolAdmin" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email</label>
              <input type="email" v-model="schoolAdminForm.email" required placeholder="admin@school.com" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Password</label>
              <input type="password" v-model="schoolAdminForm.password" required placeholder="••••••••" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>
            <button type="submit" class="btn-primary theme-text-heading font-semibold shadow-xs font-medium px-4 py-2 rounded-lg text-sm transition-all active:scale-95">Register School Admin</button>
          </form>
        </div>

        <!-- Link Student to Parent -->
        <div class="theme-card rounded-2xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
            <Users class="w-5 h-5 text-emerald-400" />
            Link Student to Parent
          </h3>
          <form @submit.prevent="handleLinkParent" class="space-y-5">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Select Student</label>
              <div class="space-y-2">
                <div class="relative">
                  <Search class="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input type="text" v-model="studentSearch" placeholder="Search student by name or email..." class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
                </div>
                <div class="max-h-44 overflow-y-auto theme-card border border-theme p-1.5 space-y-1 rounded-xl">
                  <div
                    v-for="s in filteredStudents"
                    :key="s.id"
                    @click="linkForm.student_id = s.id"
                    class="p-2.5 cursor-pointer text-sm flex items-center justify-between border transition-all rounded-lg"
                    :class="linkForm.student_id === s.id
                      ? 'bg-emerald-700 text-white font-bold border-emerald-600 shadow-sm'
                      : 'theme-card-subtle hover:bg-emerald-500/10 theme-text-heading border-transparent'"
                  >
                    <div class="flex flex-col">
                      <span class="font-semibold">{{ s.name }}</span>
                      <span class="text-xs font-semibold mt-0.5" :class="linkForm.student_id === s.id ? 'text-white' : 'text-emerald-400'">{{ s.email }}</span>
                    </div>
                    <span v-if="linkForm.student_id === s.id" class="text-xs font-bold text-white bg-emerald-800 px-2 py-0.5 rounded">Selected ✓</span>
                  </div>
                  <div v-if="!filteredStudents.length" class="p-3 text-xs text-gray-500 italic text-center">
                    No students found matching search.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Select Parent / Guardian</label>
              <div class="space-y-2">
                <div class="relative">
                  <Search class="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input type="text" v-model="parentSearch" placeholder="Search parent by name or email..." class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
                </div>
                <div class="max-h-44 overflow-y-auto theme-card border border-theme p-1.5 space-y-1 rounded-xl">
                  <div
                    v-for="p in filteredParents"
                    :key="p.id"
                    @click="linkForm.parent_id = p.id"
                    class="p-2.5 cursor-pointer text-sm flex items-center justify-between border transition-all rounded-lg"
                    :class="linkForm.parent_id === p.id
                      ? 'bg-emerald-700 text-white font-bold border-emerald-600 shadow-sm'
                      : 'theme-card-subtle hover:bg-emerald-500/10 theme-text-heading border-transparent'"
                  >
                    <div class="flex flex-col">
                      <span class="font-semibold">{{ p.name }}</span>
                      <span class="text-xs font-semibold mt-0.5" :class="linkForm.parent_id === p.id ? 'text-white' : 'text-emerald-400'">{{ p.email }}</span>
                    </div>
                    <span v-if="linkForm.parent_id === p.id" class="text-xs font-bold text-white bg-emerald-800 px-2 py-0.5 rounded">Selected ✓</span>
                  </div>
                  <div v-if="!filteredParents.length" class="p-3 text-xs text-gray-500 italic text-center">
                    No parents found matching search.
                  </div>
                </div>
              </div>
            </div>
            <button
              type="submit"
              :disabled="!linkForm.student_id || !linkForm.parent_id"
              class="btn-primary w-full mt-2"
            >
              Link Profiles
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useSchoolStore } from '../store';
import { fromDateTimeLocal } from '../format';
import EventWizard from './wizard/EventWizard.vue';
import { 
  apiLoadLevels, 
  apiCreateLevel, 
  apiLoadTeachers, 
  apiCreateTeacher,
  apiLoadParents, 
  apiLoadStudents, 
  apiCreateStudent, 
  apiLinkParentStudent, 
  apiLoadClasses, 
  apiCreateClass,
  apiUpdateClass,
  apiDeleteClass,
  apiGetClassStudents,
  apiAssignStudentToClass,
  apiRemoveStudentFromClass,
  apiCreateEvent,
  apiCreateManager,
  apiCreateSchoolAdmin,
  apiCreateInvitation,
  apiCreateTenant
} from '../api';
import { 
  ClipboardList, 
  Layers, 
  BookOpen, 
  UserPlus, 
  Users, 
  CalendarDays, 
  Plus, 
  Trash,
  CheckCircle,
  AlertCircle,
  Search,
  Pencil,
  KeyRound,
  Copy,
  X,
  Building2,
  ShieldAlert
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const schoolStore = useSchoolStore();
const user = computed(() => authStore.user);

// Mirrors authStore.canAccessManageUsers (the single shared definition --
// see store.js). router.js's beforeEach already blocks the fast path (SPA
// navigation, user already loaded); this covers the hard-reload case, where
// authStore.user is still null when the component first mounts and only
// resolves after fetchMe() completes.
const isBlockedFromAdminHub = computed(() =>
  !!authStore.user && !authStore.canAccessManageUsers
);
watch(isBlockedFromAdminHub, (blocked) => {
  if (blocked) router.replace('/');
}, { immediate: true });

const activeTab = ref('structure');
const tabs = computed(() => [
  { id: 'structure', name: 'School Structure', icon: Layers },
  { id: 'users', name: 'Students & Parents', icon: Users },
  { id: 'events', name: 'Plan Event', icon: CalendarDays }
]);

const successMsg = ref(null);
const errorMsg = ref(null);

const setSuccess = (msg) => {
  successMsg.value = msg;
  setTimeout(() => { successMsg.value = null; }, 4000);
};

const setError = (msg) => {
  errorMsg.value = msg;
  setTimeout(() => { errorMsg.value = null; }, 4000);
};

// Lists loaded dynamically
const levels = ref([]);
const teachers = ref([]);
const parents = ref([]);
const students = ref([]);
const classes = ref([]);

// Form states
const levelForm = ref({ name: '' });
const classForm = ref({ name: '', level_id: '', head_teacher_id: '' });
const editingClass = ref(null);
const editClassForm = ref({ id: null, name: '', level_id: '', head_teacher_id: '' });
const editClassStudents = ref([]);
const studentToAdd = ref('');
const studentSearchToAdd = ref('');
const studentForm = ref({ name: '', email: '', password: '', class_id: '', gender: '', birth_data: '' });
const teacherForm = ref({ name: '', email: '', password: '' });
const managerForm = ref({ email: '', password: '' });
const schoolAdminForm = ref({ email: '', password: '' });
const linkForm = ref({ student_id: '', parent_id: '' });
const studentSearch = ref('');
const parentSearch = ref('');

const inviteForm = ref({
  target_email: '',
  role: 'teacher',
  valid_days: 7,
});
const generatedInvite = ref(null);

const tenantForm = ref({ tenant_id: '', name: '' });

const handleCreateTenant = async () => {
  try {
    await apiCreateTenant({
      tenant_id: tenantForm.value.tenant_id.trim(),
      name: tenantForm.value.name.trim(),
    });
    tenantForm.value = { tenant_id: '', name: '' };
    setSuccess('Tenant created successfully!');
  } catch (err) {
    setError(err.message);
  }
};

const handleGenerateInvite = async () => {
  try {
    const adminTenant = user.value?.tenant_id || authStore.tenant_id;
    const res = await apiCreateInvitation({
      tenant_id: adminTenant,
      role: inviteForm.value.role,
      target_email: inviteForm.value.target_email || null,
      valid_days: parseInt(inviteForm.value.valid_days || 7),
    });
    generatedInvite.value = res;
    setSuccess('Invitation code generated successfully!');
  } catch (err) {
    setError(err.message);
  }
};

const copyInviteCode = (code) => {
  navigator.clipboard.writeText(code);
  setSuccess(`Copied invite code "${code}" to clipboard!`);
};

const filteredStudentsToAdd = computed(() => {
  let available = students.value.filter(stu => stu.class_id !== editClassForm.value.id);
  if (!studentSearchToAdd.value) return available;
  const q = studentSearchToAdd.value.toLowerCase();
  return available.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.email.toLowerCase().includes(q)
  );
});

const filteredStudents = computed(() => {
  const list = Array.isArray(students.value) ? students.value : [];
  if (!studentSearch.value) return list.slice(0, 50);
  const q = studentSearch.value.toLowerCase();
  return list.filter(s => 
    s && ( (s.name && s.name.toLowerCase().includes(q)) || (s.email && s.email.toLowerCase().includes(q)) )
  ).slice(0, 50);
});

const filteredParents = computed(() => {
  const list = Array.isArray(parents.value) ? parents.value : [];
  if (!parentSearch.value) return list.slice(0, 50);
  const q = parentSearch.value.toLowerCase();
  return list.filter(p => 
    p && ( (p.name && p.name.toLowerCase().includes(q)) || (p.email && p.email.toLowerCase().includes(q)) )
  ).slice(0, 50);
});

const eventForm = ref({
  title: '',
  description: '',
  address: '',
  school_subsidy: '',
  date: '',
  class_mappings: []
});

const loadAllData = async () => {
  try {
    const l = await apiLoadLevels();
    levels.value = Array.isArray(l) ? l : [];
  } catch (err) { console.warn('Failed to load levels:', err); levels.value = []; }

  try {
    const t = await apiLoadTeachers();
    teachers.value = Array.isArray(t) ? t : [];
  } catch (err) { console.warn('Failed to load teachers:', err); teachers.value = []; }

  try {
    const p = await apiLoadParents();
    parents.value = Array.isArray(p) ? p : [];
  } catch (err) { console.warn('Failed to load parents:', err); parents.value = []; }

  try {
    const s = await apiLoadStudents();
    students.value = Array.isArray(s) ? s : [];
  } catch (err) { console.warn('Failed to load students:', err); students.value = []; }

  try {
    const c = await apiLoadClasses();
    classes.value = Array.isArray(c) ? c : [];
  } catch (err) { console.warn('Failed to load classes:', err); classes.value = []; }
};

onMounted(() => {
  loadAllData();
});

// Create actions
const handleCreateLevel = async () => {
  try {
    await apiCreateLevel({ name: levelForm.value.name });
    levelForm.value.name = '';
    setSuccess('Level created successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleCreateClass = async () => {
  try {
    await apiCreateClass({
      name: classForm.value.name,
      level_id: classForm.value.level_id,
      head_teacher_id: classForm.value.head_teacher_id
    });
    classForm.value.name = '';
    classForm.value.level_id = '';
    classForm.value.head_teacher_id = '';
    setSuccess('Class created successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const loadClassStudents = async (classId) => {
  try {
    editClassStudents.value = await apiGetClassStudents(classId);
  } catch (err) {
    console.error('Failed to load class students:', err);
    setError(err.message || 'Could not load the class roster.');
  }
};

const openEditClassModal = async (cls) => {
  editingClass.value = cls;
  editClassForm.value = {
    id: cls.id,
    name: cls.name,
    level_id: cls.level_id,
    head_teacher_id: cls.head_teacher_id
  };
  studentToAdd.value = '';
  await loadClassStudents(cls.id);
};

const closeEditClassModal = () => {
  editingClass.value = null;
  editClassStudents.value = [];
};

const handleUpdateClass = async () => {
  try {
    await apiUpdateClass(editClassForm.value.id, {
      name: editClassForm.value.name,
      level_id: editClassForm.value.level_id,
      head_teacher_id: editClassForm.value.head_teacher_id
    });
    setSuccess('Class details updated successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleDeleteClass = async () => {
  if (!confirm('Are you sure you want to delete this class? This cannot be undone.')) return;
  try {
    await apiDeleteClass(editClassForm.value.id);
    setSuccess('Class deleted successfully!');
    closeEditClassModal();
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleAddStudentToClass = async () => {
  if (!studentToAdd.value) return;
  try {
    await apiAssignStudentToClass(editClassForm.value.id, studentToAdd.value);
    setSuccess('Student added to class.');
    studentToAdd.value = '';
    await loadClassStudents(editClassForm.value.id);
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleRemoveStudentFromClass = async (studentId) => {
  if (!confirm('Remove this student from the class?')) return;
  try {
    await apiRemoveStudentFromClass(editClassForm.value.id, studentId);
    setSuccess('Student removed from class.');
    await loadClassStudents(editClassForm.value.id);
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleCreateStudent = async () => {
  try {
    await apiCreateStudent({
      email: studentForm.value.email,
      password: studentForm.value.password,
      name: studentForm.value.name,
      class_id: studentForm.value.class_id,
      gender: studentForm.value.gender || null,
      birth_data: studentForm.value.birth_data || null
    });
    studentForm.value = { name: '', email: '', password: '', class_id: '', gender: '', birth_data: '' };
    setSuccess('Student profile created successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleCreateTeacher = async () => {
  try {
    await apiCreateTeacher({
      email: teacherForm.value.email,
      password: teacherForm.value.password,
      name: teacherForm.value.name
    });
    teacherForm.value = { name: '', email: '', password: '' };
    setSuccess('Teacher profile created successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleCreateManager = async () => {
  try {
    await apiCreateManager({
      email: managerForm.value.email,
      password: managerForm.value.password
    });
    managerForm.value = { email: '', password: '' };
    setSuccess('Manager user created successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleCreateSchoolAdmin = async () => {
  try {
    await apiCreateSchoolAdmin({
      email: schoolAdminForm.value.email,
      password: schoolAdminForm.value.password
    });
    schoolAdminForm.value = { email: '', password: '' };
    setSuccess('School admin user created successfully!');
    loadAllData();
  } catch (err) {
    setError(err.message);
  }
};

const handleLinkParent = async () => {
  try {
    await apiLinkParentStudent({
      student_id: linkForm.value.student_id,
      parent_id: linkForm.value.parent_id
    });
    linkForm.value.student_id = '';
    linkForm.value.parent_id = '';
    setSuccess('Student linked to Parent successfully!');
  } catch (err) {
    setError(err.message);
  }
};

// Event class maps
const addClassMapping = () => {
  eventForm.value.class_mappings.push({
    class_id: '',
    ticket_price: '',
    budgets: []
  });
};

const removeClassMapping = (idx) => {
  eventForm.value.class_mappings.splice(idx, 1);
};

const handleCreateEvent = async () => {
  try {
    if (eventForm.value.class_mappings.length === 0) {
      setError('Please add at least one Class Target for the event.');
      return;
    }
    const mappings = eventForm.value.class_mappings.map(m => ({
      class_id: parseInt(m.class_id),
      ticket_price: parseFloat(m.ticket_price || 0.0),
      budgets: m.budgets.filter(b => b.description.trim() !== '').map(b => ({
        description: b.description.trim(),
        price: parseFloat(b.price || 0.0)
      }))
    }));

    await apiCreateEvent({
      title: eventForm.value.title,
      description: eventForm.value.description,
      address: eventForm.value.address,
      school_subsidy: parseFloat(eventForm.value.school_subsidy || 0.0),
      date: fromDateTimeLocal(eventForm.value.date, schoolStore.timezone),
      class_mappings: mappings
    });

    eventForm.value = { title: '', description: '', address: '', school_subsidy: '', date: '', class_mappings: [] };
    setSuccess('Event published and targets notified successfully!');
  } catch (err) {
    setError(err.message);
  }
};
</script>
