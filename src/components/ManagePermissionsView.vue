<template>
  <div class="space-y-8 animate-fade-in pb-12">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6" style="border-color: var(--color-border);">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-xs">
            <ShieldCheck class="w-3.5 h-3.5" />
            School Administrator Security Portal
          </span>
          <span class="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-gray-700 font-mono">
            Tenant: {{ activeTenant.toUpperCase() }}
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight" style="color: var(--color-text-heading, #F1F1F9);">
          Dynamic User Permissions Matrix
        </h1>
        <p class="text-sm mt-1 text-slate-400">
          Assign multiple composite roles (e.g. Teacher + Parent) and fine-tune granular capabilities per user safely.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="loadData"
          :disabled="loading"
          class="px-4 py-2.5 rounded-xl border border-gray-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
        >
          <RefreshCw class="w-4 h-4 text-emerald-400" :class="{ 'animate-spin': loading }" />
          <span>Refresh Users</span>
        </button>
      </div>
    </div>

    <!-- Error Banner (if any) -->
    <div v-if="errorMessage" class="p-4 rounded-2xl border border-rose-500/40 bg-rose-950/30 flex items-center justify-between gap-3 shadow-sm">
      <div class="flex items-center gap-2 text-xs text-rose-300 font-medium">
        <X class="w-4 h-4 text-rose-400 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>
      <button @click="loadData" class="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shrink-0">
        Retry
      </button>
    </div>

    <!-- Delete Feedback Banner (transient) -->
    <transition name="fade">
      <div v-if="deleteMessage" class="p-4 rounded-2xl border border-slate-700 bg-slate-800/80 flex items-center gap-2 shadow-sm text-xs text-slate-200 font-medium">
        <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{{ deleteMessage }}</span>
      </div>
    </transition>

    <!-- Alert / Banner Info -->
    <div class="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex items-start gap-3 shadow-sm">
      <Sparkles class="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      <div class="text-xs space-y-1 text-slate-300">
        <p class="font-bold text-emerald-300">Multi-Role Membership Supported</p>
        <p class="text-slate-400 leading-relaxed">
          Users can hold multiple composite roles simultaneously. For example, a <strong>Teacher</strong> who also has children in the school can be assigned the <strong>Parent</strong> role to enroll and pay for trips with their same account without switching logins.
        </p>
      </div>
    </div>


    <!-- Pending SSO Users Alert Banner (Shown if there are pending users) -->
    <div v-if="pendingUsersCount > 0" class="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-4 animate-fade-in shadow-md">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <Clock class="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <p class="font-bold text-amber-300 text-sm flex items-center gap-2">
            <span>{{ pendingUsersCount }} User{{ pendingUsersCount > 1 ? 's' : '' }} Awaiting Role Assignment</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">Action Required</span>
          </p>
          <p class="text-xs text-amber-200/70 mt-0.5">
            New users who logged in via Google SSO or invited without assigned roles. Click <strong>Assign Role</strong> below to grant platform access.
          </p>
        </div>
      </div>
      <button 
        @click="selectedRoleFilter = 'pending'"
        class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 shrink-0"
      >
        View Pending Users
      </button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border bg-slate-900/60 shadow-sm" style="border-color: var(--color-border);">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by email or ID..."
          class="w-full bg-slate-950/80 border border-gray-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500 transition-colors"
        />
      </div>

      <!-- Role Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
        <button
          v-for="rf in roleFilters"
          :key="rf.id"
          @click="selectedRoleFilter = rf.id"
          class="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer"
          :class="selectedRoleFilter === rf.id 
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-gray-700/60'"
        >
          {{ rf.label }}
        </button>
      </div>
    </div>

    <!-- Users Table / Grid -->
    <div class="rounded-2xl border overflow-hidden shadow-lg bg-slate-900/70" style="border-color: var(--color-border);">
      <div v-if="loading && users.length === 0" class="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
        <p class="text-xs font-semibold">Loading tenant users & permissions matrix...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="p-12 text-center text-slate-500 space-y-2">
        <Users class="w-10 h-10 mx-auto text-slate-600 mb-2" />
        <p class="font-bold text-slate-400">No users found matching your search</p>
        <p class="text-xs">Try adjusting your search query or role filter.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-gray-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="py-3.5 px-6">User / Account</th>
              <th class="py-3.5 px-4">Primary Role</th>
              <th class="py-3.5 px-4">Assigned Roles</th>
              <th class="py-3.5 px-4">Custom Permissions</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800/60">
            <tr
              v-for="u in filteredUsers"
              :key="u.id"
              class="hover:bg-slate-800/40 transition-colors group"
            >
              <!-- User Info -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs text-white shrink-0 shadow-md"
                    :class="getRoleColor(u.role)"
                  >
                    {{ u.email ? u.email.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {{ u.email }}
                    </div>
                    <div class="text-[10px] font-mono text-slate-500">
                      ID: #{{ u.id }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Primary Role -->
              <td class="py-4 px-4">
                <span 
                  class="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 border shadow-xs"
                  :class="getRoleBadgeClass(u.role)"
                >
                  {{ u.role.replace('_', ' ') }}
                </span>
              </td>

              <!-- Assigned Roles (Composite List) -->
              <td class="py-4 px-4">
                <div class="flex flex-wrap gap-1.5 max-w-xs">
                  <span
                    v-for="r in (u.roles && u.roles.length > 0 ? u.roles : [u.role])"
                    :key="r"
                    class="px-2 py-0.5 rounded text-[10px] font-semibold border bg-slate-800 text-slate-300 border-gray-700/80 capitalize flex items-center gap-1"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="getRoleDotColor(r)"></span>
                    {{ r.replace('_', ' ') }}
                  </span>
                </div>
              </td>

              <!-- Custom Permissions Count -->
              <td class="py-4 px-4">
                <div v-if="u.permissions && u.permissions.length > 0" class="flex items-center gap-1.5">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    +{{ u.permissions.length }} custom
                  </span>
                </div>
                <div v-else class="text-slate-500 text-[11px] italic">
                  Default Role Policy
                </div>
              </td>

              <!-- Action Buttons -->
              <td class="py-4 px-4 text-right">
                <div class="inline-flex items-center gap-2">
                  <button
                    v-if="u.role === 'pending' || (u.roles && u.roles.includes('pending'))"
                    @click="openEditModal(u)"
                    class="px-3.5 py-1.5 rounded-xl border border-amber-500/50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-md inline-flex items-center gap-1.5 animate-pulse"
                  >
                    <Sparkles class="w-3.5 h-3.5" />
                    <span>Assign Role</span>
                  </button>
                  <button
                    v-else
                    @click="openEditModal(u)"
                    class="px-3.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <KeyRound class="w-3.5 h-3.5" />
                    <span>Configure</span>
                  </button>
                  <button
                    v-if="canDeleteUser(u)"
                    @click="handleDeleteUser(u)"
                    :disabled="deletingUserId === u.id"
                    title="Permanently delete this user"
                    class="p-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all active:scale-95 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Permissions Modal / Drawer -->
    <div v-if="editingUser" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div class="bg-slate-900 border border-gray-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <!-- Modal Header -->
        <div class="p-6 border-b border-gray-800 flex items-center justify-between bg-slate-950/60">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/30">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-100">
                Configure Permissions for {{ editingUser.email }}
              </h2>
              <p class="text-xs text-slate-400">
                User ID: #{{ editingUser.id }} &bull; Target Tenant: <span class="font-bold text-emerald-400">{{ activeTenant.toUpperCase() }}</span>
              </p>
            </div>
          </div>
          <button @click="closeEditModal" class="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          <!-- Primary Role Selector -->
          <div class="space-y-2">
            <label class="block font-bold text-slate-300 uppercase tracking-wider text-[10px]">
              Primary Role
            </label>
            <select
              v-model="editForm.role"
              class="w-full bg-slate-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option v-for="r in availableRoles" :key="r.id" :value="r.id">
                {{ r.label }} ({{ r.id }})
              </option>
            </select>
          </div>

          <!-- Composite Roles Multi-Select (Checkboxes / Chips) -->
          <div class="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-gray-800">
            <div class="flex items-center justify-between">
              <label class="block font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Users class="w-3.5 h-3.5" />
                Assigned Composite Roles (Multi-Role Memberships)
              </label>
              <span class="text-[10px] text-slate-400">Select all that apply</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                v-for="r in availableRoles"
                :key="r.id"
                class="flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none"
                :class="editForm.roles.includes(r.id) 
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200 shadow-xs' 
                  : 'bg-slate-900/80 border-gray-800 text-slate-400 hover:border-gray-700 hover:text-slate-300'"
              >
                <input
                  type="checkbox"
                  :value="r.id"
                  v-model="editForm.roles"
                  class="rounded border-gray-700 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                />
                <div>
                  <div class="font-bold text-xs capitalize flex items-center gap-1.5">
                    {{ r.label }}
                    <span v-if="editForm.role === r.id" class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Primary</span>
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">{{ r.description }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Granular Permissions Grid Grouped by Category -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-gray-800 pb-2">
              <label class="block font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <KeyRound class="w-3.5 h-3.5 text-amber-400" />
                Granular Permissions & Feature Capabilities
              </label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="clearAllPermissions"
                  class="text-[10px] font-bold text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear Custom
                </button>
              </div>
            </div>

            <!-- Categories Accordion -->
            <div class="space-y-3">
              <div
                v-for="(perms, categoryName) in permissionCategories"
                :key="categoryName"
                class="rounded-xl border border-gray-800/80 bg-slate-950/40 overflow-hidden"
              >
                <div class="p-3 bg-slate-900/60 flex items-center justify-between">
                  <span class="font-bold text-slate-200 text-xs flex items-center gap-2">
                    <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
                    {{ categoryName }}
                  </span>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="toggleCategoryPermissions(perms)"
                      class="text-[10px] font-semibold text-emerald-400 hover:underline"
                    >
                      Toggle All
                    </button>
                  </div>
                </div>

                <div class="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    v-for="perm in perms"
                    :key="perm"
                    class="flex items-center gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer select-none"
                    :class="isPermissionGranted(perm)
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                      : 'bg-slate-900/40 border-gray-800/80 text-slate-400 hover:border-gray-700'"
                  >
                    <input
                      type="checkbox"
                      :value="perm"
                      v-model="editForm.permissions"
                      class="rounded border-gray-700 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span class="font-mono text-[11px]">{{ perm }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-gray-800 bg-slate-950/80 flex items-center justify-between">
          <div class="text-[11px] text-slate-400">
            Total active roles: <span class="font-bold text-emerald-400">{{ editForm.roles.length }}</span> &bull; 
            Custom permissions: <span class="font-bold text-amber-400">{{ editForm.permissions.length }}</span>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="closeEditModal"
              class="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              @click="savePermissions"
              :disabled="saving"
              class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Save class="w-4 h-4" :class="{ 'animate-spin': saving }" />
              <span>{{ saving ? 'Saving...' : 'Save Permissions' }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../store';

import { apiLoadUsersPermissions, apiUpdateUserPermissions, apiGetRolesCatalog, apiDeleteUser } from '../api';
import {
  ShieldCheck, Search, Users, RefreshCw, KeyRound,
  X, CheckCircle2, Save, Sparkles, Clock, Trash2
} from 'lucide-vue-next';

const authStore = useAuthStore();
const activeTenant = computed(() => authStore.user?.tenant_id || localStorage.getItem('sd_active_tenant') || 'tenant_a');

const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const selectedRoleFilter = ref('all');

const roleFilters = [
  { id: 'all', label: 'All Users' },
  { id: 'pending', label: 'Pending Approvals' },
  { id: 'school_admin', label: 'School Admins' },
  { id: 'super_admin', label: 'Super Admins' },
  { id: 'manager', label: 'Managers' },
  { id: 'teacher', label: 'Teachers' },
  { id: 'parent', label: 'Parents' },
  { id: 'student', label: 'Students' },
];

const pendingUsersCount = computed(() => {
  return users.value.filter(u => u.role === 'pending' || (u.roles && u.roles.includes('pending'))).length;
});

const allRoles = ref([
  { id: 'super_admin', label: 'Super Administrator', description: 'Full platform administration across all tenant schemas.' },
  { id: 'school_admin', label: 'School Administrator', description: 'Full school-level management & staffing.' },
  { id: 'manager', label: 'Operations Manager', description: 'Event review, pricing, publishing & budget approvals.' },
  { id: 'teacher', label: 'Teacher / Class Lead', description: 'Draft event creation, resource requests & student approvals.' },
  { id: 'parent', label: 'Parent / Guardian', description: 'Child trip view, enrollment approval & payment.' },
  { id: 'student', label: 'Student', description: 'Browse class events & submit enrollment requests.' },
  { id: 'event_teacher', label: 'Event Lead Teacher', description: 'Designated lead for event execution.' },
  { id: 'pending', label: 'Pending / Unassigned', description: 'Awaiting role verification and access approval.' },
]);

// The backend rejects granting super_admin unless the caller already is one
// (TenantService.update_tenant_user_permissions) — hide the option here too
// so a school_admin never sees a choice that will just come back 403.
const availableRoles = computed(() => {
  if (authStore.hasRole('super_admin')) return allRoles.value;
  return allRoles.value.filter(r => r.id !== 'super_admin');
});

const permissionCategories = ref({
  "Events Planning & Approvals": [
    "event:create", "event:edit", "event:patch", "event:delete", "event:clone",
    "event:propose", "event:submit", "event:review", "event:publish", "event:view_draft",
    "event:audience_edit", "event:audience_predict"
  ],
  "Resources & Pricing": [
    "resource:create", "resource:view", "resource:read", "resource:edit",
    "resource:update", "resource:delete", "resource:price", "resource:set_cost",
    "resource_type:create", "resource_type:read"
  ],
  "Enrollments & Roster": [
    "enrollment:request", "enrollment:parent_approve", "enrollment:teacher_approve",
    "enrollment:cancel", "enrollment:view_roster", "enrollment:read"
  ],
  "Billing & Invoices": [
    "billing:invoice", "billing:pay", "billing:refund", "billing:audit",
    "billing:view_payment", "subsidy:manage"
  ],
  "Health & Safety": [
    "health:view", "health:manage", "health:manage_child", "safety:manage"
  ],
  "Academic & Directory": [
    "school:write", "school:read", "level:create", "level:manage", "level:read",
    "class:create", "class:edit", "class:update", "class:read", "class:assign_teacher",
    "user:create", "user:invite", "user:delete", "user:link", "user:view", "user:read",
    "teacher:create", "teacher:read", "teacher:write", "parent:read", "student:create",
    "student:read", "student:view_linked"
  ],
  "Announcements & Feedback": [
    "announcement:manage", "notification:send", "notification:read", "notification:mark_read",
    "feedback:view", "feedback:create"
  ]
});

const editingUser = ref(null);
const editForm = ref({
  role: 'student',
  roles: [],
  permissions: []
});

const isUnassignedRole = (r) => !r || r === 'pending' || r === 'none' || r === 'unassigned';

// Keep the "Primary Role" dropdown honest as composite-role checkboxes change,
// so the UI never shows "Pending" while a real role is checked below it (or
// vice versa) right before save.
watch(() => editForm.value.roles.slice(), (newRoles) => {
  const realRoles = newRoles.filter(r => !isUnassignedRole(r));
  if (isUnassignedRole(editForm.value.role) || !newRoles.includes(editForm.value.role)) {
    editForm.value.role = realRoles.length > 0 ? realRoles[0] : 'pending';
  }
});

const errorMessage = ref('');

const loadData = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const [usersData, catalog] = await Promise.all([
      apiLoadUsersPermissions(),
      apiGetRolesCatalog().catch(() => null)
    ]);
    users.value = usersData || [];
    if (catalog?.composite_roles) {
      allRoles.value = catalog.composite_roles;
    }
    if (catalog?.categories) {
      permissionCategories.value = catalog.categories;
    }
  } catch (err) {
    console.error('Failed to load users permissions:', err);
    errorMessage.value = err.message || 'Failed to retrieve tenant users. Ensure you have School Admin access.';
  } finally {
    loading.value = false;
  }
};

watch(activeTenant, (newTenant, oldTenant) => {
  if (newTenant && newTenant !== oldTenant) {
    loadData();
  }
});

// Deletion — school_admin may delete any tenant user except a super_admin;
// super_admin may delete anyone. Both are blocked from deleting themselves.
// The backend (TenantService.delete_tenant_user) enforces this regardless —
// these are UX guards so the button never dangles on a request that will
// just come back 403.
const deleteMessage = ref('');
const deletingUserId = ref(null);

const isUserRoleSet = (u) => new Set([u.role, ...(u.roles || [])].map(r => String(r || '').toLowerCase()));

const canDeleteUser = (u) => {
  if (!authStore.user) return false;
  if (String(u.id) === String(authStore.user.user_id)) return false;
  const targetRoles = isUserRoleSet(u);
  const isSuperAdmin = authStore.hasRole('super_admin');
  if (!isSuperAdmin && targetRoles.has('super_admin')) return false;
  return isSuperAdmin || authStore.hasAnyRole(['school_admin', 'admin']);
};

const flashDeleteMessage = (msg) => {
  deleteMessage.value = msg;
  setTimeout(() => { deleteMessage.value = ''; }, 5000);
};

const handleDeleteUser = async (u) => {
  if (!confirm(`Permanently delete ${u.email}? This removes their account and data from the database and cannot be undone.`)) return;
  deletingUserId.value = u.id;
  try {
    await apiDeleteUser(u.id);
    users.value = users.value.filter(x => x.id !== u.id);
    flashDeleteMessage(`Deleted ${u.email}.`);
  } catch (err) {
    flashDeleteMessage(err.message || 'Failed to delete user');
  } finally {
    deletingUserId.value = null;
  }
};

watch(() => authStore.user, (newVal) => {
  if (newVal) {
    loadData();
  }
}, { deep: true });


const filteredUsers = computed(() => {
  return users.value.filter(u => {
    // Role filter
    if (selectedRoleFilter.value !== 'all') {
      const allUserRoles = [u.role, ...(u.roles || [])].map(r => String(r || '').toLowerCase());
      const filter = selectedRoleFilter.value.toLowerCase();
      if (filter === 'school_admin' || filter === 'admin') {
        const isAdmin = allUserRoles.some(r => ['school_admin', 'super_admin', 'admin', 'administrator'].includes(r));
        if (!isAdmin) return false;
      } else if (filter === 'teacher') {
        const isTeacher = allUserRoles.some(r => ['teacher', 'event_teacher'].includes(r));
        if (!isTeacher) return false;
      } else {
        if (!allUserRoles.includes(filter)) {
          return false;
        }
      }
    }
    // Search query filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const matchEmail = u.email && u.email.toLowerCase().includes(q);
      const matchId = String(u.id).toLowerCase().includes(q);
      const matchRole = u.role && u.role.toLowerCase().includes(q);
      return matchEmail || matchId || matchRole;
    }
    return true;
  });
});

const openEditModal = (user) => {
  editingUser.value = user;
  const initialRoles = user.roles && user.roles.length > 0 ? [...user.roles] : [user.role];
  if (!initialRoles.includes(user.role)) {
    initialRoles.push(user.role);
  }
  editForm.value = {
    role: user.role,
    roles: initialRoles,
    permissions: user.permissions ? [...user.permissions] : []
  };
};

const closeEditModal = () => {
  editingUser.value = null;
};

const isPermissionGranted = (perm) => {
  return editForm.value.permissions.includes(perm);
};

const clearAllPermissions = () => {
  editForm.value.permissions = [];
};

const toggleCategoryPermissions = (perms) => {
  const allSelected = perms.every(p => editForm.value.permissions.includes(p));
  if (allSelected) {
    editForm.value.permissions = editForm.value.permissions.filter(p => !perms.includes(p));
  } else {
    const current = new Set(editForm.value.permissions);
    perms.forEach(p => current.add(p));
    editForm.value.permissions = Array.from(current);
  }
};

const savePermissions = async () => {
  if (!editingUser.value) return;
  saving.value = true;

  // Optimistic UI mutation
  const targetId = editingUser.value.id;

  // A user is only genuinely still unassigned if BOTH the "Primary Role" dropdown
  // AND every checked "Composite Roles" checkbox are unassigned. This matters because
  // admins commonly assign a role to a pending user by checking a box in the composite
  // list below, without separately touching the Primary Role dropdown above it — if we
  // only trusted editForm.value.role here, that checkbox pick would be silently
  // discarded and the user would be re-saved as pending.
  const realCompositeRoles = editForm.value.roles.filter(r => !isUnassignedRole(r));
  const effectivePrimaryRole = !isUnassignedRole(editForm.value.role)
    ? editForm.value.role
    : (realCompositeRoles[0] || editForm.value.role);
  const isPending = isUnassignedRole(effectivePrimaryRole) && realCompositeRoles.length === 0;

  const cleanRoles = isPending
    ? [effectivePrimaryRole]
    : Array.from(new Set([effectivePrimaryRole, ...realCompositeRoles]));
  const cleanPerms = isPending ? [] : editForm.value.permissions;

  const updatedPayload = {
    role: effectivePrimaryRole,
    roles: cleanRoles,
    permissions: cleanPerms
  };

  const userIdx = users.value.findIndex(u => u.id === targetId);
  if (userIdx !== -1) {
    users.value[userIdx].role = updatedPayload.role;
    users.value[userIdx].roles = updatedPayload.roles;
    users.value[userIdx].permissions = updatedPayload.permissions;
  }

  try {
    await apiUpdateUserPermissions(targetId, updatedPayload);
    closeEditModal();
    if (authStore.user && (String(targetId) === String(authStore.user.user_id) || String(targetId) === String(authStore.user.id))) {
      authStore.user.role = updatedPayload.role;
      authStore.user.roles = updatedPayload.roles;
      authStore.user.permissions = updatedPayload.permissions;
    }
  } catch (err) {
    console.error('Failed to update user permissions:', err);
    // Revert on failure
    await loadData();
  } finally {
    saving.value = false;
  }
};

const getRoleColor = (role) => {
  const r = String(role || '').toLowerCase();
  switch (r) {
    case 'super_admin': return 'bg-rose-600';
    case 'school_admin':
    case 'admin':
    case 'administrator': return 'bg-amber-600';
    case 'manager': return 'bg-purple-600';
    case 'teacher':
    case 'event_teacher': return 'bg-emerald-600';
    case 'parent': return 'bg-sky-600';
    case 'student': return 'bg-indigo-600';
    case 'pending': return 'bg-amber-600 animate-pulse';
    default: return 'bg-slate-700';
  }
};

const getRoleDotColor = (role) => {
  const r = String(role || '').toLowerCase();
  switch (r) {
    case 'super_admin': return 'bg-rose-400';
    case 'school_admin':
    case 'admin':
    case 'administrator': return 'bg-amber-400';
    case 'manager': return 'bg-purple-400';
    case 'teacher':
    case 'event_teacher': return 'bg-emerald-400';
    case 'parent': return 'bg-sky-400';
    case 'student': return 'bg-indigo-400';
    case 'pending': return 'bg-amber-400';
    default: return 'bg-slate-400';
  }
};

const getRoleBadgeClass = (role) => {
  const r = String(role || '').toLowerCase();
  switch (r) {
    case 'super_admin': return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    case 'school_admin':
    case 'admin':
    case 'administrator': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    case 'manager': return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    case 'teacher':
    case 'event_teacher': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    case 'parent': return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
    case 'student': return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse font-extrabold';
    default: return 'bg-slate-800 text-slate-400 border-gray-700';
  }
};

onMounted(() => {
  loadData();
});
</script>
