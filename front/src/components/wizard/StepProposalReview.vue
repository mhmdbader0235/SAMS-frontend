<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2 font-heading">
        <ClipboardList class="w-5 h-5 text-emerald-400" />
        Step 4: Review & Submit Proposal
      </h3>
      <p class="text-xs text-gray-500 mt-0.5">Verify all event details, class targets, and requested resources before submitting for Manager Review</p>
    </div>

    <!-- Workflow Banner -->
    <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-xs text-emerald-300">
      <span class="text-base">📋</span>
      <div>
        <span class="font-bold text-emerald-400 font-heading block">Teacher Event Workflow</span>
        Submitting will transition this event from <strong class="text-amber-400 font-heading">Draft</strong> to <strong class="text-emerald-400 font-heading">Proposed</strong>. The Manager will review the proposal and publish it for eligible parents and students.
      </div>
    </div>

    <!-- Review Content Card -->
    <div class="theme-card-subtle border border-gray-800 rounded-2xl p-6 space-y-6">
      <!-- 1. Basics -->
      <div>
        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Event Details</h4>
        <div class="grid sm:grid-cols-2 gap-4 theme-card-subtle p-4 rounded-xl border border-gray-800/50">
          <div>
            <span class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Title</span>
            <p class="text-sm font-bold theme-text-heading mt-0.5">{{ modelValue.title || '—' }}</p>
          </div>
          <div>
            <span class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Address / Location</span>
            <p class="text-sm font-semibold theme-text-heading mt-0.5">{{ modelValue.address || '—' }}</p>
          </div>
          <div>
            <span class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Date & Time</span>
            <p class="text-sm font-medium text-gray-300 mt-0.5">{{ formatDate(modelValue.date) }}</p>
          </div>
          <div class="sm:col-span-2 border-t border-gray-800/40 pt-2">
            <span class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Description</span>
            <p class="text-xs text-gray-300 mt-1 whitespace-pre-line leading-relaxed">{{ modelValue.description || '—' }}</p>
          </div>
        </div>
      </div>

      <!-- 2. Audience Target -->
      <div>
        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Audience Target</h4>
        <div class="theme-card-subtle p-4 rounded-xl border border-gray-800/50 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Target Classes</span>
              <div class="flex flex-wrap gap-2 mt-1.5">
                <span v-if="!modelValue.class_ids || modelValue.class_ids.length === 0" class="text-xs text-gray-500 italic">No classes selected</span>
                <div
                  v-for="cid in modelValue.class_ids"
                  :key="cid"
                  class="px-3 py-1.5 bg-slate-900 border border-gray-800 text-gray-300 text-xs font-bold rounded-xl flex items-center gap-2"
                >
                  <span>{{ getClassName(cid) }}</span>
                </div>
              </div>
            </div>
            <div class="text-right shrink-0">
              <span class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Predicted Attendance ({{ modelValue.attendance_rate || 80 }}%)</span>
              <p class="text-xl font-extrabold text-emerald-400 mt-0.5">{{ modelValue.predicted_attendance || 0 }} students</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Resources -->
      <div>
        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Requested Resources</h4>
        <div class="theme-card-subtle rounded-xl border border-gray-800/50 overflow-hidden">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-900/60 border-b border-gray-800">
                <th class="px-4 py-2 font-semibold text-gray-500">Resource Line</th>
                <th class="px-4 py-2 font-semibold text-gray-500">Description / Details</th>
                <th class="px-4 py-2 font-semibold text-gray-500 text-center">Quantity</th>
                <th class="px-4 py-2 font-semibold text-gray-500 text-right">Est. Unit Price</th>
                <th class="px-4 py-2 font-semibold text-gray-500 text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!modelValue.resources || modelValue.resources.length === 0">
                <td colspan="5" class="px-4 py-4 text-center text-gray-500 italic">No resources added.</td>
              </tr>
              <tr v-for="r in modelValue.resources" :key="r.resource_type_id" class="border-b border-gray-800/40 last:border-0 hover:bg-slate-900/10">
                <td class="px-4 py-2.5 font-bold theme-text-heading">{{ r.name }}</td>
                <td class="px-4 py-2.5 text-gray-500 italic">{{ r.description || '—' }}</td>
                <td class="px-4 py-2.5 text-center font-bold text-gray-300">{{ r.quantity }}</td>
                <td class="px-4 py-2.5 text-right font-bold text-gray-300">{{ parseFloat(r.unit_price || 0).toFixed(2) }} JOD</td>
                <td class="px-4 py-2.5 text-right font-bold text-emerald-400 font-heading">{{ parseFloat((r.quantity || 1) * (r.unit_price || 0)).toFixed(2) }} JOD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Financials & Pricing (Final Step) -->
      <div>
        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Final Step: Financials & Ticket Pricing</h4>
        <div class="theme-card-subtle p-5 rounded-2xl border border-emerald-500/40 space-y-5 bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-teal-950/20">
          
          <div class="flex items-center justify-between border-b border-gray-800/60 pb-4">
            <div>
              <span class="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Requested Budget</span>
              <p class="text-lg font-black text-rose-400 mt-0.5">{{ totalResourcesCost.toFixed(2) }} JOD</p>
            </div>
            <button 
              @click="calculateBestPrice" 
              class="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span class="text-base">✨</span> Calculate Best Ticket Price
            </button>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold theme-text-heading">Set Ticket Price per Class (Required for Proposal)</span>
              <span class="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">
                Final Action
              </span>
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
              <div
                v-for="cid in modelValue.class_ids"
                :key="cid"
                class="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30"
              >
                <div>
                  <span class="text-xs font-bold theme-text-heading block">{{ getClassName(cid) }}</span>
                  <span class="text-[10px] text-gray-500">Ticket Price per student</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-emerald-400">JOD</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    :value="modelValue.class_suggested_prices?.[cid] ?? 0"
                    @input="updateClassPrice(cid, $event.target.value)"
                    placeholder="0.00"
                    class="w-24 bg-slate-900 border border-emerald-500/40 text-xs font-extrabold text-emerald-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 text-right transition-all"
                  />
                </div>
              </div>
            </div>
            <p v-if="modelValue.predicted_attendance > 0" class="text-[10px] text-gray-400 italic mt-2 flex items-center gap-1.5">
              <span>💡</span> Note: Clicking <strong>Calculate Best Ticket Price</strong> automatically divides Total Budget ({{ totalResourcesCost.toFixed(2) }} JOD) by Predicted Attendance ({{ modelValue.predicted_attendance }} students).
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ClipboardList } from 'lucide-vue-next';
import { apiLoadClasses } from '../../api';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const classes = ref([]);

const loadClasses = async () => {
  try {
    classes.value = await apiLoadClasses();
  } catch (err) {
    console.error(err);
  }
};

const getClassName = (cid) => {
  const found = classes.value.find(c => c.id === cid || c.id === Number(cid));
  return found ? found.name : `Class #${cid}`;
};

const updateClassPrice = (cid, val) => {
  const current = props.modelValue.class_suggested_prices || {};
  props.modelValue.class_suggested_prices = {
    ...current,
    [cid]: parseFloat(val || 0)
  };
};

const totalResourcesCost = computed(() => {
  if (!props.modelValue.resources) return 0;
  return props.modelValue.resources.reduce((sum, r) => sum + (parseFloat(r.quantity || 1) * parseFloat(r.unit_price || 0)), 0);
});

const calculateBestPrice = () => {
  const predicted = props.modelValue.predicted_attendance || 1;
  const cost = totalResourcesCost.value;
  // Calculate raw price per student to cover the cost
  const rawPrice = cost / predicted;
  // Round up to nearest 0.5 for a cleaner ticket price (e.g., 2.3 -> 2.5)
  const bestPrice = Math.ceil(rawPrice * 2) / 2;
  
  const current = { ...(props.modelValue.class_suggested_prices || {}) };
  if (props.modelValue.class_ids) {
    props.modelValue.class_ids.forEach(cid => {
      current[cid] = bestPrice;
    });
  }
  props.modelValue.class_suggested_prices = current;
};

const selectedClassNames = computed(() => {
  if (!props.modelValue.class_ids || props.modelValue.class_ids.length === 0) return [];
  return classes.value
    .filter(c => props.modelValue.class_ids.includes(c.id))
    .map(c => c.name);
});

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return dateStr;
  }
};

onMounted(() => {
  loadClasses();
});
</script>
