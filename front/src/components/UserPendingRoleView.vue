<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    
    <div class="w-full max-w-lg">
      <!-- Clean Rectangular Card -->
      <div class="theme-card p-6 sm:p-8 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        
        <!-- Top Header & Brand -->
        <div class="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <GraduationCap class="w-4 h-4" />
            </div>
            <div>
              <h2 class="font-bold text-sm text-slate-900 dark:text-slate-100">SchoolDesk</h2>
              <p class="text-[10px] text-slate-500 font-medium">Enterprise Platform</p>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Role Pending
          </div>
        </div>

        <!-- Title & Subtitle -->
        <div class="text-left space-y-1.5">
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Access Pending Authorization
          </h1>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your account is authenticated. An administrator must assign your user role before workspace modules become accessible.
          </p>
        </div>

        <!-- Account Metadata Summary -->
        <div class="p-3.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-slate-500 font-medium flex items-center gap-1.5">
              <Mail class="w-3.5 h-3.5 text-blue-600" /> Account Email
            </span>
            <span class="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[220px]">{{ userEmail }}</span>
          </div>

          <div v-if="tenantId" class="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
            <span class="text-slate-500 font-medium flex items-center gap-1.5">
              <Building2 class="w-3.5 h-3.5 text-emerald-600" /> School Domain
            </span>
            <span class="font-bold text-slate-800 dark:text-slate-200 uppercase">{{ tenantId.replace(/_/g, ' ') }}</span>
          </div>

          <div class="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
            <span class="text-slate-500 font-medium flex items-center gap-1.5">
              <UserCheck class="w-3.5 h-3.5 text-amber-600" /> Status
            </span>
            <span class="font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Pending Role Assignment
            </span>
          </div>
        </div>

        <!-- 3-Step Access Flow -->
        <div class="space-y-2">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Authorization Steps</p>
          <div class="grid grid-cols-3 gap-2 text-left">
            
            <!-- Step 1 -->
            <div class="p-2.5 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[9px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Step 1</span>
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p class="text-xs font-bold text-emerald-900 dark:text-emerald-300">Verified</p>
            </div>

            <!-- Step 2 -->
            <div class="p-2.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[9px] font-bold uppercase text-amber-800 dark:text-amber-400">Step 2</span>
                <Clock class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <p class="text-xs font-bold text-amber-900 dark:text-amber-300">Admin Review</p>
            </div>

            <!-- Step 3 -->
            <div class="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 opacity-60">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[9px] font-bold uppercase text-slate-500">Step 3</span>
                <Lock class="w-3.5 h-3.5 text-slate-500" />
              </div>
              <p class="text-xs font-bold text-slate-700 dark:text-slate-300">Unlocked</p>
            </div>

          </div>
        </div>

        <!-- Status Message Alert -->
        <div v-if="statusMessage" class="p-2.5 rounded border text-xs font-semibold flex items-center gap-2" :class="statusSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'">
          <Sparkles class="w-3.5 h-3.5 flex-shrink-0" />
          <span>{{ statusMessage }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            @click="checkStatus"
            :disabled="checking"
            class="flex-1 py-2 px-3 rounded font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': checking }" />
            <span>{{ checking ? 'Checking...' : 'Refresh Status' }}</span>
          </button>

          <button
            type="button"
            @click="showSupportModal = true"
            class="py-2 px-3 rounded font-semibold text-xs text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <HelpCircle class="w-3.5 h-3.5 text-slate-500" />
            <span>Contact Admin</span>
          </button>

          <button
            type="button"
            @click="handleLogout"
            class="py-2 px-3 rounded font-semibold text-xs text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <!-- Footer Help Note -->
        <div class="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
          <span>Role updates apply automatically upon administrative assignment.</span>
        </div>

      </div>
    </div>

    <!-- Contact Support Modal -->
    <div v-if="showSupportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
      <div class="theme-card p-6 rounded max-w-md w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg space-y-4">
        
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <HelpCircle class="w-4 h-4 text-blue-600" />
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">Contact Administrator</h3>
          </div>
          <button type="button" @click="showSupportModal = false" class="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
        </div>

        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Please contact your school administrator to request role provisioning for your account.
        </p>

        <div class="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs space-y-1.5">
          <div class="flex justify-between items-center">
            <span class="text-slate-500">School Domain:</span>
            <span class="font-bold text-slate-900 dark:text-slate-100 uppercase">{{ tenantId || 'tenant_a' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Admin Contact:</span>
            <span class="font-bold text-blue-600">admin@{{ tenantId || 'tenant_a' }}.school.com</span>
          </div>
        </div>

        <div class="flex gap-2 pt-2">
          <button
            type="button"
            @click="copyAdminEmail"
            class="flex-1 py-2 px-3 rounded font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Copy v-if="!copied" class="w-3.5 h-3.5" />
            <CheckCircle2 v-else class="w-3.5 h-3.5 text-white" />
            <span>{{ copied ? 'Copied!' : 'Copy Email' }}</span>
          </button>
          
          <button
            type="button"
            @click="showSupportModal = false"
            class="py-2 px-3 rounded font-semibold text-xs text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../store';
import { useRouter } from 'vue-router';
import {
  GraduationCap, ShieldCheck, Mail, Building2,
  UserCheck, CheckCircle2, Clock, Lock, RefreshCw, HelpCircle,
  LogOut, Sparkles, Copy
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const checking = ref(false);
const showSupportModal = ref(false);
const copied = ref(false);
const statusMessage = ref('');
const statusSuccess = ref(false);
let autoPollTimer = null;

const userEmail = computed(() => authStore.user?.email || 'Authenticated User');
const tenantId = computed(() => authStore.user?.tenant_id || '');

const checkStatus = async () => {
  checking.value = true;
  statusMessage.value = '';
  try {
    await authStore.fetchMe();
    const currentRole = authStore.user?.role;
    const activeRoles = authStore.activeRoles.filter(r => r && r !== 'pending' && r !== 'none' && r !== 'unassigned');
    const validRoles = (authStore.user?.roles || []).filter(r => r && r !== 'pending' && r !== 'none' && r !== 'unassigned');
    const hasAssignedRole = (currentRole && currentRole !== 'pending' && currentRole !== 'none' && currentRole !== 'unassigned') || activeRoles.length > 0 || validRoles.length > 0;
    
    if (hasAssignedRole) {
      statusSuccess.value = true;
      statusMessage.value = 'Role assigned! Redirecting to workspace...';
      setTimeout(() => {
        router.push('/');
      }, 750);
    } else {
      statusSuccess.value = false;
      statusMessage.value = 'Account is still awaiting administrator role assignment.';
    }
  } catch (err) {
    statusSuccess.value = false;
    statusMessage.value = 'Could not verify status. Please try again.';
  } finally {
    checking.value = false;
  }
};

const copyAdminEmail = async () => {
  const email = `admin@${tenantId.value || 'tenant_a'}.school.com`;
  try {
    await navigator.clipboard.writeText(email);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch (err) {
    console.error('Failed to copy email:', err);
  }
};

const handleLogout = () => {
  authStore.logout();
};

onMounted(() => {
  autoPollTimer = setInterval(async () => {
    if (!checking.value) {
      try {
        await authStore.fetchMe();
        const currentRole = authStore.user?.role;
        const activeRoles = authStore.activeRoles.filter(r => r && r !== 'pending' && r !== 'none' && r !== 'unassigned');
        const validRoles = (authStore.user?.roles || []).filter(r => r && r !== 'pending' && r !== 'none' && r !== 'unassigned');
        if ((currentRole && currentRole !== 'pending' && currentRole !== 'none' && currentRole !== 'unassigned') || activeRoles.length > 0 || validRoles.length > 0) {
          clearInterval(autoPollTimer);
          router.push('/');
        }
      } catch (_) {}
    }
  }, 10000);
});

onUnmounted(() => {
  if (autoPollTimer) clearInterval(autoPollTimer);
});
</script>
