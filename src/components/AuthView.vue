<template>
  <div class="min-h-screen flex w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    
    <div class="w-full max-w-7xl mx-auto flex min-h-screen z-10 p-6 lg:p-12 items-center">
      <div class="grid lg:grid-cols-12 gap-8 lg:gap-14 w-full items-center">
        
        <!-- Left Showcase Side (Enterprise SaaS Overview) -->
        <div class="lg:col-span-7 space-y-6 hidden lg:block pr-4">
          <!-- Status Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
            <Sparkles class="w-3.5 h-3.5" />
            <span>SAMS Multi-Tenant Platform</span>
          </div>

          <!-- Main Heading & Subtitle -->
          <div class="space-y-3">
            <h1 class="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-slate-100">
              Streamline School Operations with <br />
              <span class="text-blue-600 dark:text-blue-400">Multi-Role Governance & Workflows</span>
            </h1>
            <p class="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Automate event planning from Teacher Drafts to Manager Approvals and Real-Time Parent Enrollments with Keycloak OIDC security and PostgreSQL schema isolation.
            </p>
          </div>

          <!-- Workflow Pipeline Overview -->
          <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Zap class="w-3.5 h-3.5 text-blue-600" /> Event Lifecycle Pipeline
              </span>
              <span class="text-[11px] text-slate-500 font-medium">4-Stage Workflow</span>
            </div>
            <div class="grid grid-cols-4 gap-2 pt-1">
              <div class="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-1">
                <span class="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Stage 1</span>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Draft</p>
                <p class="text-[10px] text-slate-500">Teacher Plan</p>
              </div>
              <div class="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-1">
                <span class="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">Stage 2</span>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Proposed</p>
                <p class="text-[10px] text-slate-500">Manager Review</p>
              </div>
              <div class="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-1">
                <span class="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Stage 3</span>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Published</p>
                <p class="text-[10px] text-slate-500">Class Roster</p>
              </div>
              <div class="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center space-y-1">
                <span class="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Stage 4</span>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Enrolled</p>
                <p class="text-[10px] text-slate-500">Parent Consent</p>
              </div>
            </div>
          </div>

          <!-- Feature Cards -->
          <div class="grid sm:grid-cols-2 gap-3.5">
            <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div class="w-8 h-8 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 border border-blue-200 dark:border-blue-800">
                <ShieldCheck class="w-4 h-4" />
              </div>
              <h3 class="font-bold text-xs text-slate-900 dark:text-slate-100">Keycloak OIDC & RBAC</h3>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">Multi-role permissions isolating Teachers, Managers, Parents, and Students per tenant.</p>
            </div>

            <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div class="w-8 h-8 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 border border-blue-200 dark:border-blue-800">
                <Calculator class="w-4 h-4" />
              </div>
              <h3 class="font-bold text-xs text-slate-900 dark:text-slate-100">Dynamic Pricing Engine</h3>
              <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">Automated calculations balancing resource expenses, school subsidies, and attendance.</p>
            </div>
          </div>

          <!-- Trust Badges -->
          <div class="flex items-center gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <p class="text-xl font-black text-slate-900 dark:text-slate-100">100%</p>
              <p class="text-[11px] text-slate-500 font-medium">Audit Compliance</p>
            </div>
            <div class="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <p class="text-xl font-black text-blue-600 dark:text-blue-400">Schema-Level</p>
              <p class="text-[11px] text-slate-500 font-medium">Multi-Tenant Isolation</p>
            </div>
            <div class="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
            <div>
              <p class="text-xl font-black text-emerald-600 dark:text-emerald-400">0ms Latency</p>
              <p class="text-[11px] text-slate-500 font-medium">Optimistic Enrollments</p>
            </div>
          </div>
        </div>

        <!-- Right Form Side (Clean Rectangular Card) -->
        <div class="lg:col-span-5 w-full max-w-md mx-auto">
          <div class="theme-card p-6 sm:p-8 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            
            <!-- Top brand header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white">
                  <GraduationCap class="w-5 h-5" />
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900 dark:text-slate-100">SAMS</h2>
                  <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Workspace Portal</p>
                </div>
              </div>
            </div>

            <!-- Active Keycloak Session Alert -->
            <div v-if="keycloak && keycloak.authenticated" class="mb-4 p-2.5 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 overflow-hidden">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span class="text-emerald-900 dark:text-emerald-300 font-semibold truncate">Signed in via SSO</span>
                </div>
                <button 
                  type="button"
                  @click="handleKeycloakLogout"
                  class="px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[10px] transition-colors shrink-0"
                >
                  Sign Out SSO
                </button>
              </div>
            </div>

            <!-- Tab Toggle -->
            <div v-if="inviteStatus.valid || form.invite_code" class="flex p-1 rounded mb-4 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
              <button
                @click="switchTab(true)"
                class="flex-1 py-1.5 text-xs font-bold rounded transition-colors"
                :class="isLogin ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-900'"
              >
                Sign In
              </button>
              <button
                @click="switchTab(false)"
                class="flex-1 py-1.5 text-xs font-bold rounded transition-colors"
                :class="!isLogin ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-900'"
              >
                Register
              </button>
            </div>

            <!-- Auth Form -->
            <form @submit.prevent="handleSubmit" class="space-y-3.5" autocomplete="off">

              <!-- Invitation Code Field -->
              <div v-if="!isLogin">
                <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Invitation Code / Passphrase</label>
                <div class="relative">
                  <KeyRound class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="invite_code"
                    v-model="form.invite_code"
                    type="text"
                    required
                    @input="handleInviteCodeInput"
                    placeholder="Enter invite passphrase (e.g. regester123)"
                    class="w-full theme-input rounded pl-9 pr-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div v-if="inviteStatus.loading" class="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Loader2 class="w-3 h-3 animate-spin" /> Verifying invitation...
                </div>
                <div v-else-if="inviteStatus.valid" class="mt-1 p-1.5 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium flex items-center justify-between">
                  <span>✓ Unlocked: {{ inviteStatus.role || 'Staff/Student' }} ({{ inviteStatus.tenant_id || form.tenant_id }})</span>
                </div>
                <div v-else-if="inviteStatus.error" class="mt-1 text-[11px] text-rose-600 font-medium">
                  {{ inviteStatus.error }}
                </div>
                <div v-else class="mt-1 p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-medium text-center">
                  🔒 Passphrase Required: Enter invite passphrase (e.g. <strong>regester123</strong>) to unlock registration.
                </div>
              </div>

              <!-- First & Last Name Fields -->
              <div v-if="!isLogin && inviteStatus.valid" class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">First Name</label>
                  <div class="relative">
                    <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="first_name"
                      v-model="form.first_name"
                      type="text"
                      required
                      placeholder="First Name"
                      class="w-full theme-input rounded pl-9 pr-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Last Name</label>
                  <div class="relative">
                    <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="last_name"
                      v-model="form.last_name"
                      type="text"
                      required
                      placeholder="Last Name"
                      class="w-full theme-input rounded pl-9 pr-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <!-- Role Selector -->
              <div v-if="!isLogin && inviteStatus.valid">
                <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Role</label>
                <div class="relative">
                  <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <select
                    id="role"
                    v-model="form.role"
                    required
                    :disabled="inviteStatus.valid && Boolean(inviteStatus.role)"
                    class="w-full theme-input rounded pl-9 pr-8 py-2 text-xs focus:outline-none appearance-none cursor-pointer"
                  >
                    <option v-for="r in roles" :key="r.value" :value="r.value">
                      {{ r.label }}
                    </option>
                  </select>
                  <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <!-- Email Field -->
              <div v-if="isLogin || inviteStatus.valid">
                <label class="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Email Address
                  <span v-if="inviteStatus.valid && inviteStatus.target_email" class="normal-case font-medium text-slate-400">— locked by invitation</span>
                </label>
                <div class="relative">
                  <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    :disabled="inviteStatus.valid && Boolean(inviteStatus.target_email)"
                    placeholder="user@school.com"
                    class="w-full theme-input rounded pl-9 pr-3 py-2 text-xs focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <!-- Password Field -->
              <div>
                <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">Password</label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPass ? 'text' : 'password'"
                    required
                    placeholder="••••••••"
                    class="w-full theme-input rounded pl-9 pr-10 py-2 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    @click="showPass = !showPass"
                    tabindex="-1"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Eye v-if="!showPass" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Error Alert -->
              <div v-if="error" class="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 font-medium">
                <AlertCircle class="w-4 h-4 flex-shrink-0" />
                {{ error }}
              </div>

              <!-- Submit Button -->
              <button
                id="auth-submit-btn"
                type="submit"
                :disabled="loading"
                class="w-full py-2.5 px-4 rounded font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
                <ArrowRight v-if="!loading" class="w-3.5 h-3.5" />
              </button>

              <!-- Divider -->
              <div class="relative my-4 flex items-center justify-center">
                <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                <span class="relative px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white dark:bg-slate-900">Or continue with</span>
              </div>

              <!-- Google Sign In -->
              <button
                type="button"
                @click="isLogin ? handleGoogleLogin() : handleGoogleRegister()"
                class="w-full py-2 px-3 rounded font-semibold text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{{ isLogin ? 'Sign in with Google' : 'Sign up with Google' }}</span>
              </button>

              <!-- Standard Keycloak SSO -->
              <button
                type="button"
                @click="isLogin ? handleKeycloakLogin() : handleKeycloakRegister()"
                class="w-full py-2 px-3 rounded font-semibold text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
              >
                <KeyRound class="w-3.5 h-3.5 text-slate-500" />
                <span>Single Sign-On (SSO)</span>
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';
import { apiLoadTenants, apiGetInvitation } from '../api';
import keycloak, { redirectToKeycloak, GOOGLE_IDP_HINT, SSO_IDP_HINT } from '../keycloak';
import {
  GraduationCap, ChevronDown, Mail, Lock, KeyRound,
  Loader2, AlertCircle, Eye, EyeOff, Sparkles, ShieldCheck,
  Calculator, ArrowRight, User, Zap
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const handleGoogleLogin = () => {
  const targetEmail = form.value.email || sessionStorage.getItem('pending_invite_email');
  if (keycloak && keycloak.authenticated) {
    router.push('/');
  } else {
    // Routes straight to Google's account picker via Keycloak's identity
    // broker -- requires the "google" alias configured under Realm Settings
    // -> Identity Providers (see SAMS-realm.json). Until real Google OAuth
    // credentials are set there, Keycloak will show its own "Google" button
    // but the broker itself will fail on click.
    redirectToKeycloak(targetEmail, GOOGLE_IDP_HINT);
  }
};

const handleGoogleRegister = (loginHintEmail = null) => {
  const targetEmail = loginHintEmail || form.value.email || sessionStorage.getItem('pending_invite_email');
  if (keycloak && keycloak.authenticated) {
    keycloak.logout({ redirectUri: window.location.origin + '/auth' });
  } else {
    redirectToKeycloak(targetEmail, GOOGLE_IDP_HINT);
  }
};

const handleKeycloakLogin = () => {
  if (keycloak && keycloak.authenticated) {
    router.push('/');
  } else if (SSO_IDP_HINT) {
    // Once a real enterprise broker (SAML/OIDC) is configured in Keycloak,
    // set VITE_SSO_IDP_HINT to its alias and this routes straight to it,
    // same as the Google button does for "google".
    redirectToKeycloak(null, SSO_IDP_HINT);
  } else {
    // No enterprise broker configured yet for this tenant -- falls back to
    // Keycloak's own generic login form, which is the honest behavior for
    // "SSO not set up" rather than faking a distinct flow.
    keycloak.login({ redirectUri: window.location.origin + '/' });
  }
};

const handleKeycloakRegister = () => {
  if (keycloak && keycloak.authenticated) {
    keycloak.logout({ redirectUri: window.location.origin + '/auth' });
  } else if (SSO_IDP_HINT) {
    redirectToKeycloak(null, SSO_IDP_HINT);
  } else {
    keycloak.register({ redirectUri: window.location.origin + '/' });
  }
};

const handleKeycloakLogout = () => {
  authStore.logout();
};

const initialTenant = localStorage.getItem('sd_active_tenant') || 'tenant_a';
const isLogin = ref(true);
const tenants = ref([initialTenant]);
const loading = ref(false);
const error = ref(null);
const showPass = ref(false);

const SELF_SERVE_ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'event_teacher', label: 'Event Teacher' },
  { value: 'manager', label: 'Manager' },
];

// "School Admin" is deliberately never a free pick on this generic passphrase
// form — the backend now hard-rejects a school_admin registration that isn't
// backed by a real, targeted invitation record (see AuthService.register_user).
// It only appears here — locked, non-editable — when the entered code IS such
// a real invitation whose role is actually "school_admin".
const roles = computed(() => {
  if (inviteStatus.value.role === 'school_admin') {
    return [...SELF_SERVE_ROLES, { value: 'school_admin', label: 'School Admin' }];
  }
  return SELF_SERVE_ROLES;
});

const form = ref({
  tenant_id: initialTenant,
  role: 'student',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  invite_code: ''
});

const inviteStatus = ref({
  loading: false,
  valid: false,
  error: null,
  role: null,
  tenant_id: null,
  target_email: null,
});

let inviteDebounceTimer = null;
const handleInviteCodeInput = () => {
  const code = form.value.invite_code.trim();
  if (!code) {
    inviteStatus.value = { loading: false, valid: false, error: null, role: null, tenant_id: null, target_email: null };
    return;
  }
  
  const fallbackPassphrases = ['regester123', 'register123', 'school-staff-2026', 'teacher-pass-2026'];
  if (fallbackPassphrases.includes(code.toLowerCase())) {
    inviteStatus.value = {
      loading: false,
      valid: true,
      error: null,
      role: null,
      tenant_id: form.value.tenant_id || 'tenant_a',
      target_email: null
    };
    return;
  }

  if (inviteDebounceTimer) clearTimeout(inviteDebounceTimer);
  inviteDebounceTimer = setTimeout(async () => {
    inviteStatus.value.loading = true;
    inviteStatus.value.error = null;
    try {
      const res = await apiGetInvitation(code);
      if (res && res.valid) {
        inviteStatus.value = {
          loading: false,
          valid: true,
          error: null,
          role: res.role,
          tenant_id: res.tenant_id,
          target_email: res.target_email,
        };
        if (res.tenant_id) form.value.tenant_id = res.tenant_id;
        if (res.role) form.value.role = res.role;
        if (res.target_email) form.value.email = res.target_email;
      }
    } catch (err) {
      inviteStatus.value = {
        loading: false,
        valid: false,
        error: err.message || 'Invalid invitation code',
        role: null,
        tenant_id: null,
        target_email: null,
      };
    }
  }, 400);
};

const switchTab = (login) => {
  isLogin.value = login;
  error.value = null;
};

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const urlInvite = params.get('invite_code');
  const autoGoogle = params.get('auto_google');
  const targetEmail = params.get('email') || params.get('target_email');

  if (targetEmail) {
    form.value.email = targetEmail;
    sessionStorage.setItem('pending_invite_email', targetEmail);
  }

  if (urlInvite) {
    switchTab(false);
    form.value.invite_code = urlInvite;
    handleInviteCodeInput();
    sessionStorage.setItem('pending_invite_code', urlInvite);
  }

  if (autoGoogle === 'true' && !(keycloak && keycloak.authenticated) && !authStore.token) {
    handleGoogleRegister(targetEmail);
    return;
  }

  if ((keycloak && keycloak.authenticated) || authStore.token) {
    const pendingInvite = sessionStorage.getItem('pending_invite_code');
    if (pendingInvite && keycloak && keycloak.tokenParsed) {
      try {
        await authStore.register({
          email: keycloak.tokenParsed.email || sessionStorage.getItem('pending_invite_email') || form.value.email || '',
          password: 'google_sso_dummy_password',
          tenant_id: inviteStatus.value.tenant_id || 'tenant_a',
          role: inviteStatus.value.role || 'student',
          name: keycloak.tokenParsed.name || '',
          first_name: keycloak.tokenParsed.given_name || '',
          last_name: keycloak.tokenParsed.family_name || '',
          invite_code: pendingInvite
        });
        sessionStorage.removeItem('pending_invite_code');
        sessionStorage.removeItem('pending_invite_email');
      } catch(err) {
         console.warn("Failed to auto-register with invite code after SSO:", err);
      }
    }
    router.push('/');
    return;
  }
  
  try {
    const list = await apiLoadTenants();
    if (list && list.length) {
      tenants.value = list;
      if (!list.includes(form.value.tenant_id)) {
        form.value.tenant_id = list[0];
      }
    }
  } catch (err) {
    console.warn('Could not load tenants dynamically from backend:', err.message);
  }
});

const handleSubmit = async () => {
  if (!form.value.email || !form.value.password) {
    error.value = 'Please fill in all required fields.';
    return;
  }
  if (!isLogin.value) {
    if (!form.value.invite_code.trim()) {
      error.value = 'An invitation code is required to register.';
      return;
    }
    if (!form.value.first_name.trim() || !form.value.last_name.trim()) {
      error.value = 'Please enter both your First Name and Last Name.';
      return;
    }
  }
  loading.value = true;
  error.value = null;
  try {
    if (isLogin.value) {
      await authStore.login({
        email: form.value.email,
        password: form.value.password,
        tenant_id: form.value.tenant_id || 'tenant_a'
      });
    } else {
      const fullName = `${form.value.first_name.trim()} ${form.value.last_name.trim()}`.trim();
      await authStore.register({
        email: form.value.email,
        password: form.value.password,
        tenant_id: inviteStatus.value.tenant_id || form.value.tenant_id || 'tenant_a',
        role: inviteStatus.value.role || form.value.role,
        name: fullName,
        first_name: form.value.first_name.trim(),
        last_name: form.value.last_name.trim(),
        invite_code: form.value.invite_code.trim()
      });
    }
    router.push('/');
  } catch (err) {
    error.value = err.message || 'Authentication failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>
