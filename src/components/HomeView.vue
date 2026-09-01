<template>
  <SuperAdminHomeView v-if="authStore.hasRole('super_admin')" />
  <DashboardView v-else />
</template>

<script setup>
import { useAuthStore } from '../store';
import SuperAdminHomeView from './SuperAdminHomeView.vue';
import DashboardView from './DashboardView.vue';

const authStore = useAuthStore();
</script>
