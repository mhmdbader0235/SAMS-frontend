<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 text-slate-900">
    <div class="w-full max-w-lg">
      <div class="theme-card p-6 sm:p-8 rounded border border-slate-200 bg-white shadow-sm space-y-6">
        <div class="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <GraduationCap class="w-4 h-4" />
            </div>
            <div>
              <h2 class="font-bold text-sm text-slate-900">{{ schoolStore.displayName }}</h2>
              <p class="text-[10px] text-slate-500 font-medium">SAMS Workspace</p>
            </div>
          </div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Setup In Progress
          </div>
        </div>

        <div class="text-left space-y-1.5">
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            School Setup In Progress
          </h1>
          <p class="text-xs text-slate-600 leading-relaxed">
            Your school administrator is still configuring this workspace — school information and academic
            structure need to be finished before the dashboard, events, and user management become available.
          </p>
        </div>

        <div class="p-3.5 rounded border border-slate-200 bg-slate-50 text-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-slate-500 font-medium flex items-center gap-1.5">
              <Mail class="w-3.5 h-3.5 text-blue-600" /> Signed in as
            </span>
            <span class="font-bold text-slate-900 truncate max-w-[220px]">{{ authStore.user?.email }}</span>
          </div>
        </div>

        <button @click="handleLogout" class="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors">
          <LogOut class="w-3.5 h-3.5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { GraduationCap, Mail, LogOut } from 'lucide-vue-next';
import { useAuthStore, useSchoolStore } from '../store';

const authStore = useAuthStore();
const schoolStore = useSchoolStore();

const handleLogout = () => {
  authStore.logout();
};
</script>
