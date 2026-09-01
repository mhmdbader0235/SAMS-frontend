<template>
  <div class="min-h-screen">
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Title Banner -->
      <div class="flex items-center gap-3 theme-card rounded-2xl p-6 shadow-sm border border-amber-500/30 bg-amber-500/5">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Crown class="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 class="text-xl font-bold theme-text-heading tracking-tight">Super Admin Console</h2>
          <p class="text-xs text-gray-500 font-medium mt-0.5">Platform-wide tools, not scoped to any single school. Switch into a tenant below to manage it directly.</p>
        </div>
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

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Send Invitation to Any Tenant -->
        <div class="theme-card rounded-2xl shadow-sm p-6 space-y-4 md:col-span-2 border border-emerald-500/30 bg-emerald-500/5">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
              <KeyRound class="w-5 h-5 text-emerald-400" />
              Send Invitation to a Tenant
            </h3>
            <span class="text-xs text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">Super Admin Only</span>
          </div>
          <p class="text-xs text-gray-400">Generate an invitation code for any school, without switching into it first. Pick the target tenant, role, and (optionally) an email address.</p>

          <form @submit.prevent="handleSendInvite" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Target Tenant</label>
              <select v-model="inviteForm.tenant_id" required class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors">
                <option value="" disabled>Select tenant...</option>
                <option v-for="t in tenants" :key="t" :value="t">{{ t.replace(/_/g, ' ').toUpperCase() }}</option>
              </select>
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

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Target Email (Optional)</label>
              <input type="email" v-model="inviteForm.target_email" placeholder="user@school.com" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>

            <div class="flex items-center gap-2">
              <div class="flex-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Valid (Days)</label>
                <input type="number" min="1" max="30" v-model="inviteForm.valid_days" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors" />
              </div>
              <button type="submit" class="btn-primary theme-text-heading font-semibold shadow-xs font-medium px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95 flex items-center gap-1.5 shrink-0">
                <Plus class="w-4 h-4" /> Send
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

        <!-- Create Tenant -->
        <div class="theme-card rounded-2xl shadow-sm p-6 space-y-4 border border-amber-500/30 bg-amber-500/5">
          <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
            <Building2 class="w-5 h-5 text-amber-500" />
            Create New Tenant
          </h3>
          <p class="text-xs text-gray-400">Provision a new tenant (school) with its own isolated database schema.</p>
          <form @submit.prevent="handleCreateTenant" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tenant ID</label>
              <input type="text" v-model="tenantForm.tenant_id" required placeholder="e.g. tenant_c" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tenant Name</label>
              <input type="text" v-model="tenantForm.name" required placeholder="e.g. Greenwood School" class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors" />
            </div>
            <button type="submit" class="btn-primary theme-text-heading font-semibold shadow-xs font-medium px-4 py-2 rounded-lg text-sm transition-all active:scale-95">Create Tenant</button>
          </form>
        </div>

        <!-- Tenant Directory / Travel -->
        <div class="theme-card rounded-2xl shadow-sm p-6 space-y-4">
          <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
            <Building2 class="w-5 h-5 text-blue-500" />
            Schools (Tenants)
          </h3>
          <p class="text-xs text-gray-400">Jump into a tenant to manage it directly as if you were its admin.</p>
          <div v-if="!tenants.length" class="p-4 text-xs text-gray-500 italic text-center border border-dashed border-theme rounded-xl">
            No tenants found.
          </div>
          <div class="space-y-2 max-h-72 overflow-y-auto">
            <div
              v-for="t in tenants"
              :key="t"
              class="flex items-center justify-between p-3 rounded-xl theme-card-subtle border border-theme"
            >
              <span class="text-sm font-semibold theme-text-heading">{{ t.replace(/_/g, ' ').toUpperCase() }}</span>
              <button
                type="button"
                @click="authStore.switchTenant(t)"
                class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                Switch Into <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store';
import { apiLoadTenants, apiCreateTenant, apiCreateInvitation } from '../api';
import { Crown, Building2, KeyRound, Plus, Copy, CheckCircle, AlertCircle, ArrowRight } from 'lucide-vue-next';

const authStore = useAuthStore();

const tenants = ref([]);
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

const loadTenants = async () => {
  try {
    tenants.value = await apiLoadTenants();
  } catch (err) {
    console.warn('Failed to load tenants:', err.message);
    tenants.value = [];
  }
};

onMounted(loadTenants);

const tenantForm = ref({ tenant_id: '', name: '' });

const handleCreateTenant = async () => {
  try {
    await apiCreateTenant({
      tenant_id: tenantForm.value.tenant_id.trim(),
      name: tenantForm.value.name.trim(),
    });
    tenantForm.value = { tenant_id: '', name: '' };
    setSuccess('Tenant created successfully!');
    await loadTenants();
  } catch (err) {
    setError(err.message);
  }
};

const inviteForm = ref({
  tenant_id: '',
  target_email: '',
  role: 'teacher',
  valid_days: 7,
});
const generatedInvite = ref(null);

const handleSendInvite = async () => {
  try {
    const res = await apiCreateInvitation({
      tenant_id: inviteForm.value.tenant_id,
      role: inviteForm.value.role,
      target_email: inviteForm.value.target_email || null,
      valid_days: parseInt(inviteForm.value.valid_days || 7),
    });
    generatedInvite.value = res;
    setSuccess(`Invitation code generated for tenant "${inviteForm.value.tenant_id}"!`);
  } catch (err) {
    setError(err.message);
  }
};

const copyInviteCode = (code) => {
  navigator.clipboard.writeText(code);
  setSuccess(`Copied invite code "${code}" to clipboard!`);
};
</script>
