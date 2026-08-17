<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Title & Controls Banner -->
    <div class="flex items-center justify-between theme-card rounded-2xl p-6 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CalendarDays class="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 class="text-xl font-bold theme-text-heading tracking-tight">Academic Calendar</h2>
          <p class="text-xs text-gray-500 font-medium mt-0.5">{{ currentMonthLabel }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button @click="prevMonth" class="p-2.5 rounded-xl theme-card-subtle hover:bg-slate-800 border border-gray-800 text-gray-500 hover:theme-text-heading transition-all shadow-sm">
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button @click="nextMonth" class="p-2.5 rounded-xl theme-card-subtle hover:bg-slate-800 border border-gray-800 text-gray-500 hover:theme-text-heading transition-all shadow-sm">
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="theme-card rounded-2xl shadow-sm overflow-hidden">
      <!-- Day headers -->
      <div class="grid grid-cols-7 border-b border-gray-800 theme-card-subtle">
        <div v-for="day in dayNames" :key="day"
          class="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{{ day }}</div>
      </div>

      <!-- Calendar cells -->
      <div class="grid grid-cols-7">
        <div v-for="(cell, i) in calendarCells" :key="i"
          class="min-h-28 border-b border-r border-gray-800/50 p-2.5 last:border-r-0 transition-colors"
          :class="[
            !cell.inMonth ? 'theme-card-subtle' : 'hover:theme-card-subtle',
            cell.isToday ? 'bg-emerald-500/10/40 border-emerald-500/30' : ''
          ]">
          <!-- Day number -->
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full"
              :class="cell.isToday ? 'bg-emerald-600 theme-text-heading shadow-xs' : cell.inMonth ? 'theme-text-heading' : 'text-gray-300'">
              {{ cell.day }}
            </span>
          </div>
          <!-- Events -->
          <div class="space-y-1">
            <div v-for="ev in cell.events" :key="ev.id"
              @click="handleEventClick(ev)"
              class="px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 truncate hover:bg-blue-100 transition-colors shadow-2xs"
              :class="canTeacherManage(ev) ? 'cursor-pointer' : ''"
              :title="ev.title">
              {{ ev.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming events list -->
    <div class="theme-card rounded-2xl p-6 shadow-sm space-y-4">
      <h3 class="text-sm font-bold theme-text-heading flex items-center gap-2">
        <Clock class="w-4 h-4 text-emerald-400" />
        Upcoming Events this Month
      </h3>
      <div v-if="!monthEvents.length" class="theme-card-subtle rounded-xl border-dashed rounded-xl p-8 text-center">
        <p class="text-gray-500 text-sm font-medium">No events scheduled for this month</p>
      </div>
      <div class="space-y-3">
        <div v-for="ev in monthEvents" :key="ev.id"
          @click="handleEventClick(ev)"
          :class="[
            'flex items-center gap-4 theme-card-subtle border border-gray-800 rounded-xl px-5 py-4 hover:theme-card hover:border-blue-300 hover:shadow-sm transition-all group',
            canTeacherManage(ev) ? 'cursor-pointer' : ''
          ]">
          <!-- Date pill -->
          <div class="text-center w-12 flex-shrink-0">
            <div class="text-2xl font-black text-emerald-400 leading-none">{{ new Date(ev.date).getDate() }}</div>
            <div class="text-[10px] font-bold text-gray-500 uppercase mt-0.5">{{ new Date(ev.date).toLocaleDateString('en', { month: 'short' }) }}</div>
          </div>
          <div class="w-px h-10 bg-gray-200 flex-shrink-0"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold theme-text-heading group-hover:text-emerald-400 transition-colors truncate">{{ ev.title }}</p>
            <p class="text-xs text-gray-500 mt-0.5 font-medium">{{ ev.address || 'Location TBD' }} · Subsidy: ${{ parseFloat(ev.school_subsidy || 0).toFixed(2) }}</p>
          </div>
          <span class="text-xs font-semibold text-gray-500 theme-card px-3 py-1 rounded-full flex-shrink-0">{{ new Date(ev.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEventStore, useAuthStore } from '../store';
import { apiLoadClasses } from '../api';
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-vue-next';

const eventStore = useEventStore();
const authStore = useAuthStore();
const router = useRouter();

const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const teacherClasses = ref([]);

const currentMonthLabel = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleDateString('en', {
    month: 'long',
    year: 'numeric'
  });
});

const monthEvents = computed(() => {
  const allEvents = eventStore.events || [];
  return allEvents.filter(ev => {
    if (!ev.date) return false;
    if (ev.status !== 'published') return false;
    const d = new Date(ev.date);
    return d.getMonth() === currentMonth.value && d.getFullYear() === currentYear.value;
  });
});

const calendarCells = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = [];
  const today = new Date();

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      day: prevMonthDays - i,
      inMonth: false,
      isToday: false,
      events: []
    });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
    const events = monthEvents.value.filter(ev => {
      const ed = new Date(ev.date);
      return ed.getDate() === d;
    });

    cells.push({
      day: d,
      inMonth: true,
      isToday,
      events
    });
  }

  // Next month padding to fill 35/42 grid
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      day: i,
      inMonth: false,
      isToday: false,
      events: []
    });
  }

  return cells;
});

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const canTeacherManage = (ev) => {
  const role = authStore.user?.role;
  if (role === 'school_admin') return true;
  if (role === 'teacher') {
    if (ev.created_by_user_id && parseInt(ev.created_by_user_id) === parseInt(authStore.user?.user_id)) {
      return true;
    }
    if (ev.class_mappings && teacherClasses.value.length > 0) {
      const myClassIds = teacherClasses.value.map(c => c.id);
      return ev.class_mappings.some(m => myClassIds.includes(m.class_id));
    }
  }
  return false;
};

const handleEventClick = (ev) => {
  if (canTeacherManage(ev)) {
    router.push({ name: 'event-details', params: { id: ev.id } });
  }
};

onMounted(async () => {
  await eventStore.loadEvents();
  if (authStore.user?.role === 'teacher') {
    try {
      const classes = await apiLoadClasses();
      teacherClasses.value = classes.filter(c => c.head_teacher_id === parseInt(authStore.user?.user_id));
    } catch (err) {
      console.error('Failed to load teacher classes:', err);
    }
  }
});
</script>
