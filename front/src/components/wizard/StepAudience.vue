<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
        <Users class="w-5 h-5 text-emerald-400" />
        Step 2: Target Audience
      </h3>
      <p class="text-xs text-gray-500 mt-0.5">Select the target classes that will attend this event</p>
    </div>

    <!-- Alert for empty selection -->
    <div v-if="selectedClassIds.length === 0" class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 font-medium">
      ⚠️ Please select at least one class to proceed.
    </div>

    <!-- Classes Checklist -->
    <div class="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin">
      <div
        v-for="c in classesWithCount"
        :key="c.id"
        @click="toggleClass(c.id)"
        class="bg-slate-900/40 border rounded-xl p-3.5 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all select-none flex items-center justify-between"
        :class="selectedClassIds.includes(c.id) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-gray-850'"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200"
            :class="selectedClassIds.includes(c.id) ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-black' : 'border-gray-700 bg-slate-950'"
          >
            <span v-if="selectedClassIds.includes(c.id)" class="text-xs">✓</span>
          </div>
          <div>
            <h4 class="font-bold text-sm theme-text-heading flex items-center gap-2">
              {{ c.name }}
              <span class="text-[9px] text-gray-500 font-bold bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50 uppercase tracking-wide">
                {{ c.level_name }}
              </span>
            </h4>
          </div>
        </div>
        <span class="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
          {{ c.studentCount }} Students
        </span>
      </div>
    </div>

    <!-- Dynamic Expected Attendance Rate Control -->
    <div v-if="selectedClassIds.length > 0" class="space-y-4 theme-card-subtle border border-gray-800 rounded-2xl p-5">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-bold theme-text-heading flex items-center gap-2">
            <TrendingUp class="w-4 h-4 text-emerald-400" />
            Dynamic Teacher Attendance Prediction
          </h4>
          <p class="text-xs text-gray-500 mt-0.5">Adjust expected attendance percentage for your event & class</p>
        </div>
        <span class="text-sm font-black text-emerald-400 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/30">
          {{ attendanceRate }}% Rate
        </span>
      </div>

      <!-- Percentage Controls -->
      <div class="space-y-3">
        <div class="flex items-center gap-4">
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            v-model.number="attendanceRate"
            class="flex-1 accent-emerald-500 bg-slate-950 cursor-pointer h-2 rounded-lg"
          />
          <div class="flex items-center gap-1">
            <input
              type="number"
              min="10"
              max="100"
              v-model.number="attendanceRate"
              class="w-16 bg-slate-950 border border-gray-800 text-xs text-center font-bold theme-text-heading rounded-lg py-1.5 focus:outline-none focus:border-emerald-500"
            />
            <span class="text-xs text-gray-500 font-bold">%</span>
          </div>
        </div>

        <!-- Quick Preset Buttons -->
        <div class="flex gap-2">
          <button
            v-for="preset in [50, 75, 85, 90, 100]"
            :key="preset"
            type="button"
            @click="attendanceRate = preset"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
            :class="attendanceRate === preset ? 'bg-emerald-600 theme-text-heading' : 'bg-slate-950 text-gray-500 hover:theme-text-heading border border-gray-800'"
          >
            {{ preset }}%
          </button>
        </div>
      </div>
    </div>


    <!-- Prediction Card -->
    <div v-if="selectedClassIds.length > 0" class="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between">
      <div>
        <h4 class="text-sm font-bold theme-text-heading">Predicted Attendance</h4>
        <p class="text-xs text-gray-500 mt-0.5">
          Based on {{ attendanceRate }}% expected attendance across {{ totalStudentsInSelectedClasses }} total target students
        </p>
      </div>
      <div class="text-center">
        <span class="text-3xl font-extrabold text-emerald-400 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-4 py-1.5 rounded-2xl border border-emerald-500/30">
          {{ prediction }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Users, TrendingUp, Tag } from 'lucide-vue-next';
import { apiLoadClasses, apiLoadStudents, apiGetAudiencePrediction } from '../../api';

const props = defineProps({
  modelValue: {
    type: Object, // Shared event form object
    required: true
  },
  eventId: {
    type: Number,
    default: null
  }
});

const classes = ref([]);
const students = ref([]);
const backendTotalStudents = ref(0);
const attendanceRate = ref(props.modelValue.attendance_rate || 80);

const selectedClassIds = computed(() => {
  return props.modelValue.class_ids || [];
});

const toggleClass = (classId) => {
  const current = [...(props.modelValue.class_ids || [])];
  const idx = current.indexOf(classId);
  if (idx > -1) {
    current.splice(idx, 1);
  } else {
    current.push(classId);
  }
  props.modelValue.class_ids = current;
};

const getClassName = (cid) => {
  const found = classes.value.find(c => c.id === cid || c.id === Number(cid));
  return found ? found.name : `Class #${cid}`;
};

const updateClassPrice = (cid, val) => {
  if (!props.modelValue.class_suggested_prices) {
    props.modelValue.class_suggested_prices = {};
  }
  props.modelValue.class_suggested_prices[cid] = parseFloat(val || 0);
};

const classesWithCount = computed(() => {
  return classes.value.map(c => {
    const count = students.value.filter(s => s.class_id === c.id || s.class_id === Number(c.id)).length;
    return {
      ...c,
      studentCount: count
    };
  });
});

const totalStudentsInSelectedClasses = computed(() => {
  if (selectedClassIds.value.length === 0) return 0;
  const count = students.value.filter(s => selectedClassIds.value.includes(s.class_id) || selectedClassIds.value.includes(Number(s.class_id))).length;
  if (count > 0) return count;
  return backendTotalStudents.value;
});

const prediction = computed(() => {
  const total = totalStudentsInSelectedClasses.value;
  if (total === 0) return 0;
  return Math.round(total * (attendanceRate.value / 100));
});

const syncBackendPrediction = async () => {
  if (selectedClassIds.value.length === 0 || !props.eventId) return;
  try {
    const default80Pred = await apiGetAudiencePrediction(props.eventId, selectedClassIds.value);
    if (default80Pred && default80Pred > 0) {
      backendTotalStudents.value = Math.round(default80Pred / 0.8);
    }
  } catch (err) {
    console.error('Failed to get backend prediction:', err);
  }
};

watch(selectedClassIds, () => {
  syncBackendPrediction();
}, { deep: true });

watch([selectedClassIds, attendanceRate, prediction], () => {
  props.modelValue.attendance_rate = attendanceRate.value;
  props.modelValue.predicted_attendance = prediction.value;
}, { immediate: true });

onMounted(async () => {
  try {
    const [clsList, stdList] = await Promise.all([
      apiLoadClasses(),
      apiLoadStudents()
    ]);
    classes.value = clsList || [];
    students.value = stdList || [];
  } catch (err) {
    console.error('Failed to load audience classes/students:', err);
  }
  await syncBackendPrediction();
});
</script>
