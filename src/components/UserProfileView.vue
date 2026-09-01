<template>
  <div class="max-w-4xl mx-auto space-y-5">

    <!-- Header -->
    <div class="theme-card rounded-lg p-6 shadow-xs border border-slate-200 dark:border-slate-800">
      <div class="flex flex-wrap items-center gap-5">
        <div class="w-16 h-16 rounded-lg bg-blue-600 text-white shadow-xs flex items-center justify-center text-2xl font-black uppercase shrink-0">
          {{ user?.email?.[0] || '?' }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-lg font-bold theme-text-heading truncate">{{ user?.email?.split('@')[0] || 'User' }}</p>
          <p class="text-xs text-slate-500 truncate font-medium">{{ user?.email }}</p>
          <div class="flex flex-wrap items-center gap-1.5 mt-2">
            <span
              v-for="r in authStore.activeRoles"
              :key="r"
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
              :class="isAdminRole(r) ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' : 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'"
            >
              {{ r.replace(/_/g, ' ') }}
            </span>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tenant</p>
          <p class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ user?.tenant_id?.replace(/_/g, ' ').toUpperCase() || 'Global' }}</p>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="saveMessage" class="p-3 rounded border text-xs font-semibold flex items-center gap-2"
        :class="saveError ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300'">
        <CheckCircle2 v-if="!saveError" class="w-4 h-4 shrink-0" />
        <AlertCircle v-else class="w-4 h-4 shrink-0" />
        {{ saveMessage }}
      </div>
    </transition>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

      <!-- Editable contact info — every role can change this -->
      <div class="theme-card rounded-lg p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold theme-text-heading">Contact Information</h3>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            Editable
          </span>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input :value="user?.email" disabled
              class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 rounded pl-9 pr-3 py-2.5 text-sm cursor-not-allowed" />
          </div>
          <p class="text-[10px] text-slate-400 mt-1">Locked — contact your school administrator to change your login email.</p>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
          <div class="relative">
            <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input v-model="form.phone" type="tel" placeholder="+1 234 567 8900"
              class="w-full theme-card border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 theme-text-heading rounded pl-9 pr-3 py-2.5 text-sm focus:outline-none placeholder-slate-400 transition-all" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Address</label>
          <div class="relative">
            <MapPin class="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
            <textarea v-model="form.address" rows="3" placeholder="Enter your full home address"
              class="w-full theme-card border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 theme-text-heading rounded pl-9 pr-3 py-2.5 text-sm focus:outline-none placeholder-slate-400 transition-all resize-none"></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end pt-1">
          <button @click="handleSave" :disabled="saving" class="btn-primary shadow-xs">
            <Save class="w-3.5 h-3.5" />
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <!-- Role-specific read-only info -->
      <div class="theme-card rounded-lg p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold theme-text-heading">Academic Record</h3>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700">
            Read-only
          </span>
        </div>

        <!-- Student: guardian + class -->
        <template v-if="authStore.hasRole('student')">
          <InfoRow label="Assigned Class" :value="profile?.class_name" />
          <InfoRow label="Guardian Name" :value="profile?.parent_name" />
          <InfoRow label="Guardian Email" :value="profile?.parent_email" />
          <p class="text-[10px] text-slate-400 pt-1">Managed by academic staff — ask your teacher or school admin to update these.</p>
        </template>

        <!-- Parent: linked children -->
        <template v-else-if="authStore.hasRole('parent')">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Linked Children</p>
          <div v-if="profile?.students?.length" class="space-y-2">
            <div v-for="s in profile.students" :key="s.email" class="flex items-center gap-2.5 p-2.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div class="w-7 h-7 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                {{ s.name?.[0] || '?' }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold theme-text-heading truncate">{{ s.name }}</p>
                <p class="text-[10px] text-slate-500 truncate">{{ s.email }}</p>
              </div>
            </div>
          </div>
          <p v-else class="text-xs text-slate-400">No students linked yet.</p>
        </template>

        <!-- Teacher: head-of-class -->
        <template v-else-if="authStore.hasRole('teacher')">
          <div v-if="profile?.class_name" class="flex items-center gap-3 p-3 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
            <GraduationCap class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p class="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wide">Head Teacher</p>
              <p class="text-sm font-bold theme-text-heading">{{ profile.class_name }}</p>
            </div>
          </div>
          <p v-else class="text-xs text-slate-400">Not currently assigned as head of a class.</p>
        </template>

        <!-- Admin roles: point to real management surfaces -->
        <template v-else-if="isAdminUser">
          <p class="text-xs text-slate-500 leading-relaxed">
            Administrative accounts don't carry academic records. Manage staff, students, and
            role assignments from the links below.
          </p>
          <div class="flex flex-col gap-2 pt-1">
            <router-link to="/manage/users" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
              <Users class="w-3.5 h-3.5" /> Students & Families Directory
            </router-link>
            <router-link to="/manage/permissions" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
              <KeyRound class="w-3.5 h-3.5" /> Roles & Permissions
            </router-link>
          </div>
        </template>

        <p v-else class="text-xs text-slate-400">No academic record associated with this account.</p>
      </div>
    </div>

    <!-- School profile summary — school_admin / super_admin only, sourced
         from the setup wizard's own data (school domain), not the personal
         profile endpoint. -->
    <div v-if="isAdminUser" class="theme-card rounded-lg p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold theme-text-heading">School</h3>
          <p class="text-xs text-slate-500 mt-0.5">Set up during onboarding. Edit it from the Structure & Setup pages.</p>
        </div>
        <span
          class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide shrink-0"
          :class="schoolStore.isLive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'"
        >
          {{ schoolStore.isLive ? 'Active' : 'Setup' }}
        </span>
      </div>

      <div v-if="!schoolStore.profileLoaded" class="flex items-center gap-2 text-xs text-slate-400 py-4">
        <Loader2 class="w-4 h-4 animate-spin" /> Loading school profile...
      </div>

      <template v-else-if="schoolStore.profile">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow label="School Name" :value="schoolStore.profile.display_name || schoolStore.profile.legal_name" />
          <InfoRow label="School Code" :value="schoolStore.profile.school_code" />
          <InfoRow label="School Type" :value="schoolStore.profile.school_type" />
          <InfoRow label="Country" :value="schoolStore.profile.country" />
          <InfoRow label="Timezone" :value="schoolStore.profile.timezone" />
          <InfoRow label="Currency" :value="schoolStore.profile.currency" />
          <InfoRow label="Default Language" :value="schoolStore.profile.default_language" />
          <InfoRow label="Activated" :value="schoolStore.profile.activated_at ? new Date(schoolStore.profile.activated_at).toLocaleDateString() : 'Not yet activated'" />
        </div>

        <div v-if="primaryCampus" class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
            <MapPin class="w-3.5 h-3.5" /> Primary Campus
          </p>
          <p class="text-xs font-bold theme-text-heading">{{ primaryCampus.name }}</p>
          <p class="text-[11px] text-slate-500 mt-0.5">{{ campusAddressLine }}</p>
        </div>

        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p class="text-[11px] text-slate-500">
            {{ (schoolStore.profile.campuses || []).length }} campus{{ (schoolStore.profile.campuses || []).length === 1 ? '' : 'es' }},
            {{ (schoolStore.profile.contacts || []).length }} emergency contact{{ (schoolStore.profile.contacts || []).length === 1 ? '' : 's' }}
          </p>
          <router-link to="/manage/structure" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
            <Building2 class="w-3.5 h-3.5" /> Manage School Structure
          </router-link>
        </div>
      </template>

      <p v-else class="text-xs text-slate-400">School profile unavailable.</p>
    </div>

    <!-- Permissions summary — differs per role, always read-only here -->
    <div class="theme-card rounded-lg p-6 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold theme-text-heading">Your Access & Permissions</h3>
          <p class="text-xs text-slate-500 mt-0.5">What your current role{{ authStore.activeRoles.length > 1 ? 's' : '' }} allow{{ authStore.activeRoles.length > 1 ? '' : 's' }} you to do in this school.</p>
        </div>
        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700 shrink-0">
          View only
        </span>
      </div>

      <div v-if="loadingCatalog" class="flex items-center gap-2 text-xs text-slate-400 py-4">
        <Loader2 class="w-4 h-4 animate-spin" /> Loading role details...
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="r in roleDetails"
          :key="r.id"
          class="p-3.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
        >
          <p class="text-xs font-bold theme-text-heading">{{ r.label }}</p>
          <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">{{ r.description }}</p>
        </div>
      </div>

      <div v-if="isAdminUser" class="pt-2 border-t border-slate-100 dark:border-slate-800">
        <router-link to="/manage/permissions" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5">
          <ShieldCheck class="w-3.5 h-3.5" /> Manage other users' roles & permissions
        </router-link>
      </div>
      <p v-else class="text-[10px] text-slate-400 pt-1">
        Permissions are assigned by your school administrator and can't be changed here.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue';
import { useAuthStore, useSchoolStore } from '../store';
import { apiGetProfile, apiUpdateProfile, apiGetRolesCatalog } from '../api';
import {
  Mail, Phone, MapPin, GraduationCap, Save, Users, KeyRound, Building2,
  ShieldCheck, CheckCircle2, AlertCircle, Loader2
} from 'lucide-vue-next';

const InfoRow = (props) => h('div', { class: 'flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0' }, [
  h('span', { class: 'text-xs font-medium text-slate-500' }, props.label),
  h('span', { class: 'text-xs font-bold theme-text-heading text-right' }, props.value || '—'),
]);
InfoRow.props = ['label', 'value'];

const authStore = useAuthStore();
const schoolStore = useSchoolStore();
const user = computed(() => authStore.user);

const profile = ref(null);
const saving = ref(false);
const saveMessage = ref('');
const saveError = ref(false);

const roleCatalog = ref([]);
const loadingCatalog = ref(true);

const form = ref({
  phone: '',
  address: ''
});

const ADMIN_ROLES = ['school_admin', 'super_admin', 'admin'];
const isAdminRole = (r) => ADMIN_ROLES.includes(String(r || '').toLowerCase());
const isAdminUser = computed(() => authStore.hasAnyRole(ADMIN_ROLES));

const roleDetails = computed(() => {
  const active = new Set(authStore.activeRoles);
  return roleCatalog.value.filter((r) => active.has(r.id));
});

const primaryCampus = computed(() => {
  const campuses = schoolStore.profile?.campuses || [];
  return campuses.find((c) => c.is_primary) || campuses[0] || null;
});

const campusAddressLine = computed(() => {
  const c = primaryCampus.value;
  if (!c) return '';
  return [c.address_line1, c.city, c.state_region, c.country].filter(Boolean).join(', ');
});

onMounted(async () => {
  try {
    const data = await apiGetProfile();
    profile.value = data;
    form.value.phone = data.phone || '';
    form.value.address = data.address || '';
  } catch (err) {
    console.error('Failed to load profile:', err);
  }

  try {
    const catalog = await apiGetRolesCatalog();
    roleCatalog.value = catalog?.composite_roles || [];
  } catch (err) {
    console.error('Failed to load roles catalog:', err);
  } finally {
    loadingCatalog.value = false;
  }

  if (isAdminUser.value) {
    schoolStore.ensureProfileLoaded();
    schoolStore.ensureSetupStateLoaded();
  }
});

const handleSave = async () => {
  saving.value = true;
  saveMessage.value = '';
  try {
    await apiUpdateProfile({
      phone: form.value.phone,
      address: form.value.address
    });
    saveError.value = false;
    saveMessage.value = 'Profile updated successfully.';
  } catch (err) {
    saveError.value = true;
    saveMessage.value = err.message || 'Failed to update profile.';
  } finally {
    saving.value = false;
    setTimeout(() => { saveMessage.value = ''; }, 4000);
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
