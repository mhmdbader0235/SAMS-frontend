<template>
  <div class="flex h-screen overflow-hidden" style="font-family: 'Inter', sans-serif; background-color: var(--color-bg); color: var(--color-text);">

    <!-- Pending role screen: shown when logged in but no role assigned yet -->
    <UserPendingRoleView v-if="isPendingRole" />

    <!-- Sidebar (only when authenticated and role is assigned) -->
    <LayoutSidebar v-if="isLoggedIn && !isPendingRole && $route.name !== 'auth'" />

    <!-- Main content area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      
      <!-- Top Header -->
      <header 
        v-if="isLoggedIn && !isPendingRole && $route.name !== 'auth'" 
        class="h-14 flex items-center justify-between px-6 border-b z-20 shrink-0 transition-colors duration-150"
        style="background-color: var(--color-header-bg); border-color: var(--color-header-border);"
      >
        <!-- Breadcrumb Navigation -->
        <div class="flex items-center gap-2">
          <router-link to="/" class="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">Workspace</router-link>
          <span class="text-slate-300 text-xs">/</span>
          <span class="text-xs font-bold capitalize text-slate-900 dark:text-slate-100">{{ $route.name ? String($route.name).replace(/-/g, ' ') : 'Dashboard' }}</span>
        </div>
        
        <div v-if="authStore.user" class="flex items-center gap-3">
          <!-- Super Admin Target Tenant Switcher -->
          <div 
            v-if="authStore.user && (authStore.user.role === 'super_admin' || authStore.hasRole('super_admin'))"
            class="flex items-center gap-2 px-2.5 py-1 rounded border bg-amber-50 border-amber-300 text-xs shrink-0"
          >
            <Crown class="w-3.5 h-3.5 text-amber-700" />
            <span class="font-bold text-amber-900">School:</span>
            <div class="relative flex items-center">
              <select
                v-model="selectedTenant"
                @change="handleTenantChange"
                class="bg-white text-slate-900 font-bold text-xs pl-2 pr-6 py-0.5 rounded border border-amber-300 focus:outline-none cursor-pointer appearance-none"
              >
                <option v-for="t in availableTenants" :key="t" :value="t">
                  {{ t.replace(/_/g, ' ').toUpperCase() }}
                </option>
              </select>
              <Building2 class="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <!-- Send Invitation Quick Button -->
          <router-link
            v-if="authStore.user?.role === 'school_admin' || authStore.user?.role === 'super_admin'"
            to="/manage/users"
            class="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
            title="Generate & Send User Invitations"
          >
            <KeyRound class="w-3.5 h-3.5" />
            <span>Invite User</span>
          </router-link>

          <!-- User Details Capsule -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1 border rounded text-xs" style="background-color: var(--color-surface-subtle); border-color: var(--color-border);">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="text-slate-500 font-medium">User:</span>
            <span class="text-slate-900 dark:text-slate-100 font-bold">{{ authStore.user.email }}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              {{ authStore.activeRoles.length ? authStore.activeRoles.map(r => r.replace(/_/g, ' ')).join(', ') : 'NO ROLE' }}
            </span>
            <span class="text-slate-300">|</span>
            <span class="text-slate-500 font-medium">Tenant:</span>
            <span class="text-blue-600 dark:text-blue-400 font-bold">{{ selectedTenant ? selectedTenant.replace(/_/g, ' ').toUpperCase() : authStore.user.tenant_id }}</span>
          </div>

          <!-- Theme Toggle Button -->
          <button 
            @click="toggleTheme"
            class="p-1.5 rounded border transition-colors flex items-center gap-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            style="background-color: var(--color-surface); border-color: var(--color-border);"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-amber-500" />
            <Moon v-else class="w-4 h-4 text-slate-600" />
            <span class="hidden md:inline">{{ isDark ? 'Light' : 'Dark' }}</span>
          </button>

          <!-- User Avatar Icon -->
          <div class="h-8 w-8 rounded bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {{ authStore.user.email ? authStore.user.email.charAt(0).toUpperCase() : 'U' }}
          </div>
        </div>
      </header>

      <!-- Page content with clean transition -->
      <main v-if="!isPendingRole" class="flex-1 overflow-y-auto relative z-10 p-4 sm:p-6 lg:p-8">
        <router-view v-slot="{ Component }">
          <component :is="Component" :key="$route.path" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './store';
import LayoutSidebar from './components/LayoutSidebar.vue';
import UserPendingRoleView from './components/UserPendingRoleView.vue';
import { Sun, Moon, KeyRound, Crown, Building2 } from 'lucide-vue-next';
import { apiLoadTenants } from './api';
import keycloak from './keycloak';

const authStore = useAuthStore();
const route = useRoute();

const availableTenants = ref(['tenant_a', 'tenant_b', 'tenant_c']);
const selectedTenant = ref(localStorage.getItem('sd_active_tenant') || 'tenant_a');

const handleTenantChange = () => {
  localStorage.setItem('sd_active_tenant', selectedTenant.value);
  if (authStore.user) {
    authStore.user.tenant_id = selectedTenant.value;
  }
  window.location.reload();
};

const isLoggedIn = computed(() => !!authStore.token || (keycloak && keycloak.authenticated));

/** True when the user is authenticated but has no recognized role assigned yet */
const isPendingRole = computed(() => {
  if (!isLoggedIn.value) return false;
  if (route.name === 'auth') return false;
  if (!authStore.user) return false; // Still loading user data

  const primaryRole = String(authStore.user?.role || '').toLowerCase();
  
  // If primary role is explicitly pending/none/unassigned, show pending view
  if (!primaryRole || primaryRole === 'pending' || primaryRole === 'none' || primaryRole === 'unassigned') {
    return true;
  }

  // If user has 1 or more valid active roles, show workspace
  const validActive = (authStore.activeRoles || []).filter(r => r && r !== 'pending' && r !== 'none' && r !== 'unassigned');
  const validUserRoles = (authStore.user?.roles || []).filter(r => r && r !== 'pending' && r !== 'none' && r !== 'unassigned');
  
  if (validActive.length > 0 || validUserRoles.length > 0) {
    return false;
  }

  return true;
});

const isDark = ref(false);

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.remove('light');
    root.classList.add('dark');
    isDark.value = true;
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    isDark.value = false;
  }
};

const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark';
  localStorage.setItem('sd_theme', newTheme);
  applyTheme(newTheme);
};

onMounted(async () => {
  // Ensure default is always crisp light mode
  const savedTheme = localStorage.getItem('sd_theme');
  if (!savedTheme || savedTheme === 'dark') {
    localStorage.setItem('sd_theme', 'light');
    applyTheme('light');
  } else {
    applyTheme(savedTheme);
  }

  if (authStore.token || (keycloak && keycloak.authenticated)) {
    await authStore.fetchMe();
  }

  try {
    const tenantsList = await apiLoadTenants();
    if (tenantsList && tenantsList.length) {
      availableTenants.value = tenantsList;
    }
  } catch (err) {
    console.warn('Could not load tenant list:', err.message);
  }
});
</script>
