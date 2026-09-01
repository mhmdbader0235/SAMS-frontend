<template>
  <aside class="w-64 flex-shrink-0 flex flex-col h-screen relative z-20 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 select-none">
    
    <!-- Brand Header -->
    <div class="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900">
      <router-link to="/" class="flex items-center gap-2.5 group">
        <div class="w-8 h-8 rounded bg-blue-600 dark:bg-blue-500 flex items-center justify-center shrink-0 text-white shadow-xs overflow-hidden">
          <img v-if="schoolStore.profile?.logo_url" :src="schoolStore.profile.logo_url" alt="" class="w-full h-full object-cover" />
          <GraduationCap v-else class="w-4 h-4" />
        </div>
        <div>
          <h1 class="text-xs font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">{{ schoolStore.displayName }}</h1>
          <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 block">Admin Workspace</span>
        </div>
      </router-link>
    </div>

    <!-- Navigation Scroll Area (Flat 1-Click Access) -->
    <nav class="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
      
      <!-- Section 1: Workspace & General Overview -->
      <div class="space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pb-1">
          Workspace
        </div>
        
        <router-link to="/" custom v-slot="{ isActive, navigate }">
          <button 
            @click="navigate" 
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
            :class="isActive ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold border-l-2 border-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
          >
            <LayoutDashboard class="w-4 h-4 shrink-0" :class="isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'" />
            <span class="flex-1 text-left">Dashboard & Overview</span>
          </button>
        </router-link>

        <router-link to="/calendar" custom v-slot="{ isActive, navigate }">
          <button
            @click="navigate"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
            :class="isActive ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold border-l-2 border-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
          >
            <Calendar class="w-4 h-4 shrink-0" :class="isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'" />
            <span class="flex-1 text-left">School Calendar</span>
          </button>
        </router-link>

        <router-link to="/profile" custom v-slot="{ isActive, navigate }">
          <button
            @click="navigate"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
            :class="isActive ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold border-l-2 border-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
          >
            <IdCard class="w-4 h-4 shrink-0" :class="isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'" />
            <span class="flex-1 text-left">My Account</span>
          </button>
        </router-link>
      </div>

      <!-- Section 2: Academic Administration -->
      <div v-if="canViewAdmin" class="space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pb-1 flex items-center justify-between">
          <span>Academic Admin</span>
          <Shield class="w-3 h-3 text-slate-400" />
        </div>

        <!-- 1. School Grades & Classes -->
        <router-link
          v-if="authStore.canAccessAcademicHub"
          to="/manage/structure"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
          :class="isStructureActive ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold border-l-2 border-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
        >
          <Building2 class="w-4 h-4 shrink-0" :class="isStructureActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'" />
          <span class="flex-1 text-left">Grades & Class Sections</span>
        </router-link>

        <!-- 2. Student Placement -->
        <router-link
          v-if="authStore.canAccessAcademicHub"
          to="/manage/placement"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
          :class="isPlacementActive ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold border-l-2 border-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
        >
          <UserPlus class="w-4 h-4 shrink-0" :class="isPlacementActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'" />
          <span class="flex-1 text-left">Student Placement</span>
          <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            Roster
          </span>
        </router-link>

        <!-- 3. Curriculum & Ladder Wizard — Day-1 setup only.
             Once the school is live the curriculum system is locked
             (school_profile.curriculum_locked_at), so the wizard has nothing
             left to decide; grades and sections stay editable under
             "Academic Structure". Kept as a reachable route, just not nav. -->
        <router-link
          v-if="authStore.canAccessAcademicHub && showCurriculumWizard"
          to="/manage/ladder-wizard"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
          :class="isLadderActive ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold border-l-2 border-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
        >
          <Sliders class="w-4 h-4 shrink-0" :class="isLadderActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'" />
          <span class="flex-1 text-left">Curriculum Wizard</span>
        </router-link>

        <!-- 4. Students & Parents Directory -->
        <router-link
          v-if="authStore.canAccessManageUsers"
          to="/manage/users"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
          :class="$route.path === '/manage/users' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold border-l-2 border-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
        >
          <Users class="w-4 h-4 shrink-0" :class="$route.path === '/manage/users' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'" />
          <span class="flex-1 text-left">Students & Families</span>
        </router-link>

        <!-- 5. User Roles & Permissions -->
        <router-link 
          v-if="authStore.can('user:invite') || authStore.hasAnyRole(['school_admin', 'super_admin'])" 
          to="/manage/permissions" 
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
          :class="$route.path === '/manage/permissions' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold border-l-2 border-blue-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
        >
          <KeyRound class="w-4 h-4 shrink-0" :class="$route.path === '/manage/permissions' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'" />
          <span class="flex-1 text-left">Roles & Permissions</span>
        </router-link>

        <!-- 6. System Admin Panel -- despite the name, this page's actual
             feature is parent-student linking (see ManageAdminView.vue). Was
             role-only; user:link is the matching real, cataloged permission
             (COMPOSITE_ROLE_PERMISSIONS) -- it existed in the catalog but was
             never actually checked anywhere until now (see
             TenantService.link_student_parent), so granting it previously
             did nothing. -->
        <router-link
          v-if="authStore.hasRole('super_admin') || authStore.hasRole('school_admin') || authStore.can('user:link')"
          to="/admin"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
          :class="$route.path === '/admin' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border-l-2 border-amber-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
        >
          <ShieldCheck class="w-4 h-4 shrink-0" :class="$route.path === '/admin' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'" />
          <span class="flex-1 text-left">System Admin</span>
        </router-link>

        <!-- 7. Permission Control Center -- super_admin only, unlike every
             other link in this section which also lets school_admin in. -->
        <router-link 
          v-if="authStore.hasRole('super_admin')" 
          to="/admin/permission-matrix" 
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
          :class="$route.path === '/admin/permission-matrix' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold border-l-2 border-rose-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
        >
          <Lock class="w-4 h-4 shrink-0" :class="$route.path === '/admin/permission-matrix' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'" />
          <span class="flex-1 text-left">Permission Control Center</span>
        </router-link>
      </div>

      <!-- Section 3: Teaching & Operations -->
      <div v-if="canViewOperations" class="space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pb-1">
          Events & Teaching
        </div>

        <router-link v-if="authStore.can('event:create') || authStore.hasAnyRole(['teacher', 'school_admin'])" to="/manage/plan-event" custom v-slot="{ isActive, navigate }">
          <button 
            @click="navigate" 
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
            :class="isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold border-l-2 border-emerald-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
          >
            <Compass class="w-4 h-4 shrink-0" :class="isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'" />
            <span class="flex-1 text-left">Plan Trip / Event</span>
          </button>
        </router-link>

        <router-link v-if="authStore.can('class:read') || authStore.hasRole('teacher')" to="/my-class" custom v-slot="{ isActive, navigate }">
          <button 
            @click="navigate" 
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors"
            :class="isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold border-l-2 border-emerald-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'"
          >
            <GraduationCap class="w-4 h-4 shrink-0" :class="isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'" />
            <span class="flex-1 text-left">My Assigned Class</span>
          </button>
        </router-link>
      </div>

    </nav>

    <!-- User Profile Footer: account details & sign-out live in the header's
         avatar menu (top-right, always visible without scrolling the nav). -->
    <div class="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
      <router-link to="/profile" class="flex items-center gap-2.5 p-1.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors group">
        <div class="w-7 h-7 rounded bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
          {{ userInitials }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {{ authStore.user?.email || 'User Profile' }}
          </div>
          <div class="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
            {{ primaryRole }}
          </div>
        </div>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore, useSchoolStore } from '../store';
import {
  GraduationCap, LayoutDashboard, Calendar,
  ShieldCheck, Users, KeyRound, Building2,
  Sliders, UserPlus, Compass, Shield, IdCard, Lock
} from 'lucide-vue-next';

const authStore = useAuthStore();
const schoolStore = useSchoolStore();
const route = useRoute();
schoolStore.ensureProfileLoaded().catch(() => {});

// Whether the "Academic Admin" section header is worth rendering at all --
// true whenever at least one of its five children would show. The children
// below are each individually gated on the SAME conditions repeated here
// (authStore.canAccessAcademicHub / canAccessManageUsers -- the single
// definitions shared with router.js, ManageUsersView.vue and
// ManageStructureView.vue -- plus the two pre-existing separate gates for
// Roles & Permissions and System Admin), so a viewer who qualifies for
// exactly one specific link still gets the section header without the other
// four links appearing alongside it. It used to be a single
// `hasAnyRole(['school_admin', 'super_admin', 'manager'])` covering the
// whole section as one unit, which showed manager every link in it
// (including /manage/users and the Academic Administration Hub) even though
// manager's real job is reviewing/pricing/publishing trips, not managing the
// school's structure or user accounts -- and before that, it leaked to every
// teacher too, via a loose authStore.can('user:view') OR-branch (teacher
// legitimately holds user:view for something unrelated). Route-level and
// view-level guards (router.js, ManageUsersView.vue, ManageStructureView.vue)
// are the real block; this just stops the sidebar from advertising a page
// most viewers will be redirected straight out of.
const canViewAdmin = computed(() =>
  authStore.canAccessAcademicHub ||
  authStore.canAccessManageUsers ||
  authStore.can('user:invite') ||
  authStore.can('user:link') ||
  authStore.hasRole('super_admin') ||
  authStore.hasRole('school_admin')
);

const canViewOperations = computed(() => {
  return authStore.can('event:create') || authStore.can('event:review') || authStore.can('class:read') || authStore.hasAnyRole(['teacher', 'school_admin', 'manager']);
});

const isStructureActive = computed(() => {
  const p = route.path.toLowerCase();
  const q = route.query.tab;
  return p === '/manage/structure' && q !== 'enrollment' && q !== 'setup';
});

const isPlacementActive = computed(() => {
  const p = route.path.toLowerCase();
  const q = route.query.tab;
  return p.includes('placement') || p.includes('enrollment') || (p === '/manage/structure' && q === 'enrollment');
});

const isLadderActive = computed(() => {
  const p = route.path.toLowerCase();
  const q = route.query.tab;
  return p.includes('ladder') || p.includes('wizard') || (p === '/manage/structure' && q === 'setup');
});

// The Curriculum Wizard is a Day-1 tool: it decides the curriculum system,
// which the backend locks the moment the school is activated. Show it while the
// tenant is still in setup (or before setup-state has resolved, so the link
// never flickers out from under an admin mid-onboarding), and keep showing it if
// the admin is standing on the page right now.
const showCurriculumWizard = computed(() => {
  if (isLadderActive.value) return true;
  if (!schoolStore.setupStateLoaded) return true;
  return !schoolStore.isLive;
});

const userInitials = computed(() => {
  if (!authStore.user?.email) return 'U';
  return authStore.user.email.charAt(0).toUpperCase();
});

const primaryRole = computed(() => {
  if (authStore.activeRoles && authStore.activeRoles.length > 0) {
    return authStore.activeRoles[0].replace(/_/g, ' ');
  }
  return authStore.user?.role?.replace(/_/g, ' ') || 'User';
});
</script>
