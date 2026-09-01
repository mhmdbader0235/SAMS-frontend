<template>
  <div class="space-y-8 animate-fade-in pb-12">

    <!-- Access denied guard: covers the instant right after a hard reload,
         before App.vue's fetchMe() has populated authStore.user. Once the
         user resolves, the watch() below redirects non-super-admins home;
         this block just makes sure nothing sensitive renders in that gap. -->
    <div
      v-if="authStore.user && !authStore.hasRole('super_admin')"
      class="p-10 text-center rounded-2xl border border-rose-500/30 bg-rose-950/20 text-rose-300 space-y-2"
    >
      <ShieldAlert class="w-10 h-10 mx-auto text-rose-400" />
      <p class="font-bold">Super Admin access required</p>
      <p class="text-xs text-rose-400/80">This control center is restricted to the Super Administrator role.</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert class="w-3 h-3" /> Super Admin Only
            </span>
            <span class="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-gray-700 text-[10px] font-bold uppercase tracking-wider">
              {{ activeTenant.toUpperCase() }}
            </span>
          </div>
          <h1 class="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Lock class="w-6 h-6 text-rose-400" />
            Permission Control Center
          </h1>
          <p class="text-xs text-slate-400 mt-1 max-w-2xl">
            The single source of truth for what every role can do, and the only place a Super Admin can grant
            or revoke an individual user's access with a checkbox. Changes here take effect immediately on save.
          </p>
        </div>
        <button
          @click="loadAll"
          :disabled="loading"
          class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-gray-700 text-slate-200 font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>
      </div>

      <!-- Transient banners -->
      <div v-if="errorMessage" class="p-4 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 shrink-0" /> {{ errorMessage }}
      </div>
      <div v-if="saveMessage" class="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 shrink-0" /> {{ saveMessage }}
      </div>

      <!-- Tabs -->
      <div class="flex items-center gap-2 border-b border-gray-800">
        <button
          v-for="t in tabs"
          :key="t.id"
          @click="activeTab = t.id"
          class="px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px cursor-pointer flex items-center gap-1.5"
          :class="activeTab === t.id
            ? 'border-rose-500 text-rose-300'
            : 'border-transparent text-slate-500 hover:text-slate-300'"
        >
          <component :is="t.icon" class="w-3.5 h-3.5" />
          {{ t.label }}
        </button>
      </div>

      <!-- ================= TAB 1: ROLE MATRIX (reference) ================= -->
      <div v-if="activeTab === 'matrix'" class="space-y-4">
        <div class="p-4 rounded-xl border border-gray-800 bg-slate-950/40 text-xs text-slate-400 flex items-start gap-2.5">
          <Info class="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p>
            This is the live default policy baked into every account of a given role
            (<code class="text-[10px] bg-slate-900 px-1 py-0.5 rounded border border-gray-800">COMPOSITE_ROLE_PERMISSIONS</code>
            on the backend). <span class="font-bold text-rose-300">Super Admin</span> holds every permission by
            design (<code class="text-[10px] bg-slate-900 px-1 py-0.5 rounded border border-gray-800">*</code>) and is not
            editable here. To grant one specific user more or less than their role's default, use the
            <span class="font-bold text-slate-200">Edit User Access</span> tab.
          </p>
        </div>

        <div v-if="loading" class="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
          <div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
          <p class="text-xs font-semibold">Loading permission catalog...</p>
        </div>

        <div v-else class="rounded-2xl border border-gray-800 bg-slate-900/60 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse min-w-[820px]">
              <thead>
                <tr class="border-b border-gray-800 bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th class="py-3 px-4 sticky left-0 bg-slate-950/95 z-10">Permission</th>
                  <th v-for="r in matrixRoles" :key="r.id" class="py-3 px-3 text-center whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full" :class="getRoleDotColor(r.id)"></span>
                      {{ r.label }}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(perms, categoryName) in permissionCategories" :key="categoryName">
                  <tr class="bg-slate-950/60">
                    <td :colspan="matrixRoles.length + 1" class="py-2 px-4 font-extrabold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-2">
                      <Folder class="w-3.5 h-3.5 text-amber-400" /> {{ categoryName }}
                    </td>
                  </tr>
                  <tr v-for="perm in perms" :key="perm" class="border-b border-gray-800/60 hover:bg-slate-800/30">
                    <td
                      class="py-2 px-4 font-mono text-[11px] text-slate-300 sticky left-0 bg-slate-900/95 cursor-help"
                      @mouseenter="showTooltip($event, getPermDescription(perm))"
                      @mousemove="moveTooltip"
                      @mouseleave="hideTooltip"
                    >{{ perm }}</td>
                    <td v-for="r in matrixRoles" :key="r.id" class="py-2 px-3 text-center">
                      <CheckCircle2 v-if="roleHasPermission(r.id, perm)" class="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                      <Minus v-else class="w-3.5 h-3.5 text-slate-700 mx-auto" />
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================= TAB 2: EDIT USER ACCESS ================= -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">

        <!-- User picker -->
        <div class="rounded-2xl border border-gray-800 bg-slate-900/60 overflow-hidden">
          <div class="p-3 border-b border-gray-800 bg-slate-950/60 space-y-2.5">
            <div class="relative">
              <Search class="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search email, ID, role..."
                class="w-full bg-slate-950 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-[11px] text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
          <div v-if="loading" class="p-8 text-center text-slate-500 text-xs">Loading users...</div>
          <div v-else-if="filteredUsers.length === 0" class="p-8 text-center text-slate-500 text-xs">No users match.</div>
          <div v-else class="max-h-[560px] overflow-y-auto divide-y divide-gray-800/60">
            <button
              v-for="u in filteredUsers"
              :key="u.id"
              type="button"
              @click="selectUser(u)"
              class="w-full text-left p-3 flex items-center gap-2.5 transition-colors cursor-pointer"
              :class="selectedUserId === u.id ? 'bg-rose-950/30 border-l-2 border-rose-500' : 'hover:bg-slate-800/40 border-l-2 border-transparent'"
            >
              <div class="w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-[10px] text-white shrink-0" :class="getRoleColor(u.role)">
                {{ u.email ? u.email.charAt(0).toUpperCase() : 'U' }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-bold text-slate-200 text-[11px] truncate">{{ u.email }}</div>
                <div class="text-[10px] text-slate-500 capitalize">{{ u.role.replace('_', ' ') }}</div>
              </div>
              <span v-if="isDirtyUser(u.id)" class="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes"></span>
            </button>
          </div>
        </div>

        <!-- Editor -->
        <div v-if="!selectedUser" class="rounded-2xl border border-dashed border-gray-800 bg-slate-950/30 p-14 text-center text-slate-500">
          <MousePointerClick class="w-8 h-8 mx-auto mb-3 text-slate-600" />
          <p class="text-sm font-bold text-slate-400">Select a user to edit their access</p>
          <p class="text-xs mt-1">Check or uncheck any permission below and save — changes apply to that one user only.</p>
        </div>

        <div v-else class="rounded-2xl border border-gray-800 bg-slate-900/60 overflow-hidden">
          <div class="p-5 border-b border-gray-800 bg-slate-950/60 flex items-center justify-between gap-4">
            <div class="min-w-0">
              <h2 class="text-sm font-extrabold text-slate-100 truncate">{{ selectedUser.email }}</h2>
              <p class="text-[10px] text-slate-500">User ID: #{{ selectedUser.id }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                v-if="isDirtyUser(selectedUser.id)"
                @click="resetUserEdits"
                class="px-3 py-2 rounded-lg text-[11px] font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Discard
              </button>
              <button
                @click="saveUserPermissions"
                :disabled="saving || !isDirtyUser(selectedUser.id)"
                class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-[11px] transition-all shadow-lg shadow-rose-600/20 active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <Save class="w-3.5 h-3.5" :class="{ 'animate-spin': saving }" />
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>

          <div class="p-5 space-y-6 max-h-[640px] overflow-y-auto">
            <!-- Primary role -->
            <div class="space-y-2">
              <label class="block font-bold text-slate-300 uppercase tracking-wider text-[10px]">Primary Role</label>
              <select
                v-model="editForm.role"
                class="w-full bg-slate-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option v-for="r in allRoles" :key="r.id" :value="r.id">{{ r.label }} ({{ r.id }})</option>
              </select>
            </div>

            <!-- Composite roles -->
            <div class="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-gray-800">
              <label class="block font-bold text-rose-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Users class="w-3.5 h-3.5" /> Composite Roles (multi-role membership)
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label
                  v-for="r in allRoles"
                  :key="r.id"
                  class="flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none"
                  :class="editForm.roles.includes(r.id)
                    ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                    : 'bg-slate-900/80 border-gray-800 text-slate-400 hover:border-gray-700'"
                >
                  <input type="checkbox" :value="r.id" v-model="editForm.roles" class="rounded border-gray-700 text-rose-600 focus:ring-rose-500 mt-0.5" />
                  <div>
                    <div class="font-bold text-xs capitalize">{{ r.label }}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">{{ r.description }}</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Granular permissions grouped by category -->
            <div class="space-y-3">
              <div class="flex items-center justify-between border-b border-gray-800 pb-2">
                <label class="block font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <KeyRound class="w-3.5 h-3.5 text-amber-400" /> Individual Permission Checks
                </label>
                <button type="button" @click="editForm.permissions = []" class="text-[10px] font-bold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">
                  Clear Custom
                </button>
              </div>

              <div class="space-y-3">
                <div v-for="(perms, categoryName) in permissionCategories" :key="categoryName" class="rounded-xl border border-gray-800/80 bg-slate-950/40 overflow-hidden">
                  <div class="p-3 bg-slate-900/60 flex items-center justify-between">
                    <span class="font-bold text-slate-200 text-xs flex items-center gap-2">
                      <Folder class="w-3.5 h-3.5 text-amber-400" /> {{ categoryName }}
                    </span>
                    <button type="button" @click="toggleCategory(perms)" class="text-[10px] font-semibold text-rose-400 hover:underline cursor-pointer">
                      Toggle All
                    </button>
                  </div>
                  <div class="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      v-for="perm in perms"
                      :key="perm"
                      class="flex items-center gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer select-none"
                      :class="editForm.permissions.includes(perm)
                        ? 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                        : 'bg-slate-900/40 border-gray-800/80 text-slate-400 hover:border-gray-700'"
                      @mouseenter="showTooltip($event, getPermDescription(perm))"
                      @mousemove="moveTooltip"
                      @mouseleave="hideTooltip"
                    >
                      <input type="checkbox" :value="perm" v-model="editForm.permissions" class="rounded border-gray-700 text-rose-600 focus:ring-rose-500" />
                      <span class="font-mono text-[11px]">{{ perm }}</span>
                      <span v-if="roleHasPermission(editForm.role, perm)" class="ml-auto text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-gray-700 shrink-0">role default</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-gray-800 bg-slate-950/80 text-[11px] text-slate-400">
            Total active roles: <span class="font-bold text-rose-300">{{ editForm.roles.length }}</span> &bull;
            Custom permission checks: <span class="font-bold text-amber-400">{{ editForm.permissions.length }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Hover explainer -- a single floating box that follows the cursor,
         teleported to <body> so it's never clipped by the matrix table's
         overflow-x-auto scroller or the editor panel's overflow-y-auto. -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        class="fixed z-[9999] pointer-events-none max-w-xs px-3 py-2 rounded-lg bg-black text-white text-[11px] leading-snug shadow-2xl border border-gray-700"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        {{ tooltip.text }}
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';
import { apiLoadUsersPermissions, apiUpdateUserPermissions, apiGetRolesCatalog } from '../api';
import {
  Lock, ShieldAlert, RefreshCw, AlertTriangle, CheckCircle2, Info, Folder,
  Minus, Search, MousePointerClick, Save, Users, KeyRound, Table2, UserCog
} from 'lucide-vue-next';

// Route-level gating is presentation only (per sd-vue convention) -- the
// real boundary is the backend: TenantService.update_tenant_user_permissions
// rejects granting super_admin unless the caller already is one, and every
// permission-catalog / users-permissions endpoint requires school_admin /
// super_admin / user:view already. This page narrows that further on
// purpose: unlike ManagePermissionsView.vue (which school_admin can also
// open), this control center is super_admin ONLY, because it's the one
// place that can grant super_admin itself and see the full role-default
// matrix side by side with per-user overrides.
const authStore = useAuthStore();
const router = useRouter();

watch(() => authStore.user, (u) => {
  if (u && !authStore.hasRole('super_admin')) {
    router.replace('/');
  }
}, { immediate: true, deep: true });

const activeTenant = computed(() => authStore.user?.tenant_id || localStorage.getItem('sd_active_tenant') || 'tenant_a');

const tabs = [
  { id: 'matrix', label: 'Role Matrix', icon: Table2 },
  { id: 'users', label: 'Edit User Access', icon: UserCog },
];
const activeTab = ref('matrix');

const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const saveMessage = ref('');

const users = ref([]);
const searchQuery = ref('');

// Fallback mirrors ManagePermissionsView.vue's fallback exactly, so the two
// pages never disagree while the network is down -- both are overwritten by
// the live /auth/roles-catalog response the instant it loads.
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

// role id -> permission list ('*' for super_admin), from GET /auth/roles-catalog
const rolePermissionMap = ref({});

// Plain-English explainer for every permission string, shown in the hover
// tooltip. Kept as a flat lookup (not fetched from the backend -- the
// catalog only names permissions, it doesn't describe them) so this is the
// one place to update if a permission's meaning changes. Any permission the
// live /auth/roles-catalog adds later that isn't listed here still gets a
// readable fallback from getPermDescription() below, so a catalog update on
// its own never breaks the tooltip.
const PERMISSION_DESCRIPTIONS = {
  // Events Planning & Approvals
  'event:create': 'Create a brand-new field-trip event as a draft.',
  'event:edit': "Edit any field of an existing event.",
  'event:patch': 'Make small partial updates to an event without a full edit.',
  'event:delete': 'Permanently delete an event.',
  'event:clone': 'Duplicate an existing event as a starting point for a new one.',
  'event:propose': 'Move a draft event forward for manager review.',
  'event:submit': 'Submit an event for approval.',
  'event:review': 'Review a proposed event and approve it or send it back for changes.',
  'event:publish': 'Publish an approved event so parents and students can see it and enroll.',
  'event:view_draft': 'See events that are still in draft, before they are proposed or published.',
  'event:audience_edit': "Choose which classes, grades, or students an event is visible to.",
  'event:audience_predict': "Preview how many students would qualify for an event's audience rules.",

  // Resources & Pricing
  'resource:create': 'Add a new resource (bus, venue, equipment, etc.) to the catalog.',
  'resource:view': 'View the resources booked for an event.',
  'resource:read': 'Read resource catalog details.',
  'resource:edit': "Edit a resource's details.",
  'resource:update': "Update a resource's booking or status.",
  'resource:delete': 'Remove a resource from the catalog.',
  'resource:price': 'Set or change the price charged for a resource.',
  'resource:set_cost': "Set a resource's internal cost, used for budget calculations.",
  'resource_type:create': 'Create a new resource type or category.',
  'resource_type:read': 'View the available resource types.',

  // Enrollments & Roster
  'enrollment:request': "Request a student's enrollment into an event.",
  'enrollment:parent_approve': "Approve a child's enrollment request, as a parent.",
  'enrollment:teacher_approve': "Approve a student's enrollment request, as a teacher.",
  'enrollment:cancel': 'Cancel an existing enrollment.',
  'enrollment:view_roster': 'View the full roster of students enrolled in an event.',
  'enrollment:read': 'View enrollment records.',

  // Billing & Invoices
  'billing:invoice': 'Generate or send an invoice for an event.',
  'billing:pay': 'Make a payment toward an invoice.',
  'billing:refund': 'Issue a refund for a payment.',
  'billing:audit': 'View the full billing and payment audit trail.',
  'billing:view_payment': 'View payment status and history.',
  'subsidy:manage': 'Manage financial subsidies or discounts for families.',

  // Health & Safety
  'health:view': "View a student's health or medical notes relevant to a trip.",
  'health:manage': "Add or edit a student's health or medical notes.",
  'health:manage_child': "Manage health or medical notes for one's own linked child (parent).",
  'safety:manage': 'Manage safety plans and emergency procedures for an event.',

  // Academic & Directory
  'school:write': "Edit the school's profile and settings.",
  'school:read': "View the school's profile and settings.",
  'level:create': 'Create a new grade level.',
  'level:manage': 'Edit or reorganize grade levels.',
  'level:read': 'View grade levels.',
  'class:create': 'Create a new class section.',
  'class:edit': "Edit a class section's details.",
  'class:update': 'Update a class section (roster, teacher, or schedule).',
  'class:read': 'View class sections.',
  'class:assign_teacher': 'Assign a teacher to a class section.',
  'user:create': 'Create a new user account.',
  'user:invite': "Invite a new user, and edit an existing user's roles and permissions.",
  'user:delete': 'Permanently delete a user account.',
  'user:link': "Link a parent's account to a student record.",
  'user:view': 'View the list of users and their roles.',
  'user:read': "Read a user's account details.",
  'teacher:create': 'Add a new teacher record.',
  'teacher:read': 'View teacher directory records.',
  'teacher:write': 'Edit teacher directory records.',
  'parent:read': 'View parent directory records.',
  'student:create': 'Add a new student record.',
  'student:read': 'View student directory records.',
  'student:view_linked': "View records of students linked to one's own account (parent).",

  // Announcements & Feedback
  'announcement:manage': 'Create, edit, or delete school-wide announcements.',
  'notification:send': 'Send a notification to users.',
  'notification:read': "View one's own received notifications.",
  'notification:mark_read': 'Mark a notification as read.',
  'feedback:view': 'View feedback submitted on an event.',
  'feedback:create': 'Submit feedback about an event.',
};

const getPermDescription = (perm) => PERMISSION_DESCRIPTIONS[perm] || `Grants the "${perm}" capability.`;

// Cursor-following hover tooltip -- a single shared piece of state (not one
// per permission) so hovering never mounts/unmounts dozens of tooltip
// elements as the mouse moves down a long checkbox grid. Teleported to
// <body> in the template so `position: fixed` measures from the real
// viewport rather than getting clipped by an `overflow-x-auto`/
// `overflow-y-auto` ancestor (the matrix table and the editor panel both
// have one).
const tooltip = ref({ visible: false, text: '', x: 0, y: 0 });

const clampTooltipPos = (x, y) => ({
  x: Math.min(x, Math.max(8, window.innerWidth - 300)),
  y: Math.min(y, Math.max(8, window.innerHeight - 70)),
});

const showTooltip = (event, text) => {
  if (!text) return;
  const pos = clampTooltipPos(event.clientX + 14, event.clientY + 16);
  tooltip.value = { visible: true, text, ...pos };
};

const moveTooltip = (event) => {
  if (!tooltip.value.visible) return;
  const pos = clampTooltipPos(event.clientX + 14, event.clientY + 16);
  tooltip.value.x = pos.x;
  tooltip.value.y = pos.y;
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

// Only the 6 Phase-1 roles are shown as columns in the reference matrix --
// event_teacher/pending have no meaningful default policy to compare.
const matrixRoles = computed(() =>
  allRoles.value.filter(r => ['super_admin', 'school_admin', 'manager', 'teacher', 'parent', 'student'].includes(r.id))
);

const roleHasPermission = (roleId, perm) => {
  const perms = rolePermissionMap.value[roleId];
  if (!perms) return false;
  return perms.includes('*') || perms.includes(perm);
};

const loadAll = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const [usersData, catalog] = await Promise.all([
      apiLoadUsersPermissions(),
      apiGetRolesCatalog().catch(() => null)
    ]);
    users.value = usersData || [];
    if (catalog?.composite_roles) allRoles.value = catalog.composite_roles;
    if (catalog?.categories) permissionCategories.value = catalog.categories;
    if (catalog?.composite_role_permissions) rolePermissionMap.value = catalog.composite_role_permissions;
  } catch (err) {
    console.error('Failed to load permission control center data:', err);
    errorMessage.value = err.message || 'Failed to load users or the permission catalog. Ensure you have Super Admin access.';
  } finally {
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value;
  const q = searchQuery.value.toLowerCase().trim();
  return users.value.filter(u =>
    (u.email && u.email.toLowerCase().includes(q)) ||
    String(u.id).toLowerCase().includes(q) ||
    (u.role && u.role.toLowerCase().includes(q))
  );
});

// Per-user edit state, keyed by user id, so switching between users in the
// left list never loses unsaved work on the one you were just editing.
const editStates = ref({});
const selectedUserId = ref(null);
const selectedUser = computed(() => users.value.find(u => u.id === selectedUserId.value) || null);
const editForm = computed({
  get: () => editStates.value[selectedUserId.value] || { role: 'student', roles: [], permissions: [] },
  set: (val) => { editStates.value[selectedUserId.value] = val; }
});

const snapshotOf = (u) => {
  const initialRoles = u.roles && u.roles.length > 0 ? [...u.roles] : [u.role];
  if (!initialRoles.includes(u.role)) initialRoles.push(u.role);
  return { role: u.role, roles: initialRoles, permissions: u.permissions ? [...u.permissions] : [] };
};

const originalSnapshots = ref({});

const selectUser = (u) => {
  selectedUserId.value = u.id;
  if (!editStates.value[u.id]) {
    const snap = snapshotOf(u);
    editStates.value[u.id] = { ...snap, roles: [...snap.roles], permissions: [...snap.permissions] };
    originalSnapshots.value[u.id] = snap;
  }
};

const isDirtyUser = (userId) => {
  const cur = editStates.value[userId];
  const orig = originalSnapshots.value[userId];
  if (!cur || !orig) return false;
  return cur.role !== orig.role
    || JSON.stringify([...cur.roles].sort()) !== JSON.stringify([...orig.roles].sort())
    || JSON.stringify([...cur.permissions].sort()) !== JSON.stringify([...orig.permissions].sort());
};

const resetUserEdits = () => {
  if (!selectedUserId.value) return;
  const orig = originalSnapshots.value[selectedUserId.value];
  if (orig) editStates.value[selectedUserId.value] = { role: orig.role, roles: [...orig.roles], permissions: [...orig.permissions] };
};

const toggleCategory = (perms) => {
  const form = editForm.value;
  const allSelected = perms.every(p => form.permissions.includes(p));
  const next = allSelected
    ? form.permissions.filter(p => !perms.includes(p))
    : Array.from(new Set([...form.permissions, ...perms]));
  editForm.value = { ...form, permissions: next };
};

const isUnassignedRole = (r) => !r || r === 'pending' || r === 'none' || r === 'unassigned';

const flash = (target, msg) => {
  target.value = msg;
  setTimeout(() => { target.value = ''; }, 5000);
};

const saveUserPermissions = async () => {
  if (!selectedUserId.value) return;
  saving.value = true;
  errorMessage.value = '';
  const targetId = selectedUserId.value;
  const form = editStates.value[targetId];

  // Same reconciliation ManagePermissionsView.vue uses: a role checked in
  // the composite-roles grid without touching the Primary Role dropdown
  // must not be silently discarded on save.
  const realCompositeRoles = form.roles.filter(r => !isUnassignedRole(r));
  const effectivePrimaryRole = !isUnassignedRole(form.role) ? form.role : (realCompositeRoles[0] || form.role);
  const isPending = isUnassignedRole(effectivePrimaryRole) && realCompositeRoles.length === 0;
  const cleanRoles = isPending ? [effectivePrimaryRole] : Array.from(new Set([effectivePrimaryRole, ...realCompositeRoles]));
  const cleanPerms = isPending ? [] : form.permissions;
  const payload = { role: effectivePrimaryRole, roles: cleanRoles, permissions: cleanPerms };

  try {
    await apiUpdateUserPermissions(targetId, payload);
    const idx = users.value.findIndex(u => u.id === targetId);
    if (idx !== -1) {
      users.value[idx].role = payload.role;
      users.value[idx].roles = payload.roles;
      users.value[idx].permissions = payload.permissions;
    }
    const snap = { role: payload.role, roles: [...payload.roles], permissions: [...payload.permissions] };
    originalSnapshots.value[targetId] = snap;
    editStates.value[targetId] = { ...snap, roles: [...snap.roles], permissions: [...snap.permissions] };
    if (authStore.user && (String(targetId) === String(authStore.user.user_id) || String(targetId) === String(authStore.user.id))) {
      authStore.user.role = payload.role;
      authStore.user.roles = payload.roles;
      authStore.user.permissions = payload.permissions;
    }
    flash(saveMessage, `Saved. ${users.value[idx]?.email || 'User'} now has ${payload.roles.length} role(s) and ${payload.permissions.length} custom permission(s).`);
  } catch (err) {
    console.error('Failed to save user permissions:', err);
    flash(errorMessage, err.message || 'Failed to save permissions for this user.');
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
    case 'school_admin': return 'bg-amber-400';
    case 'manager': return 'bg-purple-400';
    case 'teacher': return 'bg-emerald-400';
    case 'parent': return 'bg-sky-400';
    case 'student': return 'bg-indigo-400';
    default: return 'bg-slate-400';
  }
};

watch(activeTenant, (newT, oldT) => {
  if (newT && newT !== oldT) {
    editStates.value = {};
    originalSnapshots.value = {};
    selectedUserId.value = null;
    loadAll();
  }
});

onMounted(() => {
  loadAll();
});
</script>
