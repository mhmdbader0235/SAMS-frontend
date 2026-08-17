<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Title Banner -->
    <div class="flex items-center gap-3 theme-card rounded-2xl p-6 shadow-sm">
      <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        <UserCircle class="w-5 h-5 text-emerald-400" />
      </div>
      <div>
        <h2 class="text-xl font-bold theme-text-heading tracking-tight">My Profile</h2>
        <p class="text-xs text-gray-500 font-medium mt-0.5">Manage your account settings & preferences</p>
      </div>
    </div>

    <!-- Profile Card -->
    <div class="theme-card rounded-2xl p-8 shadow-sm space-y-6">
      <div class="flex items-center gap-5 pb-6 border-b border-gray-800/50">
        <!-- Avatar -->
        <div class="w-16 h-16 rounded-2xl bg-emerald-600 theme-text-heading shadow-md flex items-center justify-center text-2xl font-black uppercase flex-shrink-0">
          {{ user?.email?.[0] || '?' }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-lg font-bold theme-text-heading truncate">{{ user?.email?.split('@')[0] || 'User' }}</p>
          <p class="text-xs text-gray-500 truncate font-medium">{{ user?.email }}</p>
        </div>
      </div>

      <!-- Info grid -->
      <div class="grid grid-cols-2 gap-4">
        <div class="theme-card-subtle rounded-xl p-4 border border-gray-800/60">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">User ID</p>
          <p class="text-sm font-bold theme-text-heading truncate">{{ user?.user_id || '—' }}</p>
        </div>
        <div class="theme-card-subtle rounded-xl p-4 border border-gray-800/60">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tenant</p>
          <p class="text-sm font-bold text-emerald-400">{{ user?.tenant_id?.replace(/_/g, ' ').toUpperCase() || 'Global' }}</p>
        </div>
      </div>

      <!-- Linked Parent Information (for students) -->
      <div v-if="authStore.hasRole('student') && (profile?.parent_name || profile?.parent_email)" class="pt-6 border-t border-gray-800/50 space-y-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-gray-500">Linked Guardian Details (Read-only)</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="theme-card-subtle rounded-xl p-4 border border-gray-800/60">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Guardian Name</p>
            <p class="text-sm font-bold theme-text-heading truncate">{{ profile?.parent_name || '—' }}</p>
          </div>
          <div class="theme-card-subtle rounded-xl p-4 border border-gray-800/60">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Guardian Email</p>
            <p class="text-sm font-bold theme-text-heading truncate">{{ profile?.parent_email || '—' }}</p>
          </div>
        </div>
      </div>

      <!-- Linked Student Information (for parents) -->
      <div v-if="authStore.hasRole('parent') && profile?.students?.length" class="pt-6 border-t border-gray-800/50 space-y-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-gray-500">Linked Students (Read-only)</h3>
        <div class="space-y-3">
          <div v-for="student in profile.students" :key="student.email" class="grid grid-cols-2 gap-4 theme-card-subtle rounded-xl p-4 border border-gray-800/60">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Student Name</p>
              <p class="text-sm font-bold theme-text-heading truncate">{{ student.name }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Student Email</p>
              <p class="text-sm font-bold theme-text-heading truncate">{{ student.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Head Class Information (for teachers) -->
      <div v-if="authStore.hasRole('teacher') && profile?.class_name" class="pt-6 border-t border-gray-800/50 space-y-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-gray-500">Academic Role</h3>
        <div class="bg-emerald-500/10/60 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <GraduationCap class="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <p class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Head Teacher</p>
            <p class="text-sm font-bold theme-text-heading mt-0.5">Head of Class: <span class="text-emerald-400 font-extrabold">{{ profile?.class_name }}</span></p>
          </div>
        </div>
      </div>

      <!-- Edit form -->
      <div class="pt-6 border-t border-gray-800/50 space-y-4">
        <h3 class="text-sm font-bold theme-text-heading">Update Profile Details</h3>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Phone Number</label>
          <div class="relative">
            <Phone class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input v-model="form.phone" type="tel" placeholder="+1 234 567 8900"
              class="w-full theme-card focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 theme-text-heading rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none placeholder-gray-400 shadow-xs transition-all" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Address</label>
          <div class="relative">
            <MapPin class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
            <textarea v-model="form.address" rows="3" placeholder="Enter your full home address"
              class="w-full theme-card focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 theme-text-heading rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none placeholder-gray-400 shadow-xs transition-all resize-none"></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button @click="handleSave" :disabled="saving" class="btn-primary shadow-sm">
            <Save class="w-4 h-4" />
            {{ saving ? 'Saving Changes...' : 'Save Profile' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../store';
import { apiGetProfile, apiUpdateProfile } from '../api';
import { UserCircle, Phone, MapPin, GraduationCap, Save } from 'lucide-vue-next';

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const profile = ref(null);
const saving = ref(false);

const form = ref({
  phone: '',
  address: ''
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
});

const handleSave = async () => {
  saving.value = true;
  try {
    await apiUpdateProfile({
      phone: form.value.phone,
      address: form.value.address
    });
    alert('Profile updated successfully!');
  } catch (err) {
    alert(err.message || 'Failed to update profile');
  } finally {
    saving.value = false;
  }
};
</script>
