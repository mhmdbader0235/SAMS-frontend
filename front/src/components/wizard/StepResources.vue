<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
          <Layers class="w-5 h-5 text-emerald-400" />
          Step 3: Resources
        </h3>
        <p class="text-xs text-gray-500 mt-0.5">Select and specify resource lines needed for the event</p>
      </div>

      <!-- Add Custom Type Button -->
      <button
        v-if="authStore.hasAnyRole(['school_admin', 'teacher'])"
        type="button"
        @click="showCustomModal = true"
        class="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-gray-700 text-emerald-400 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
      >
        <Plus class="w-3.5 h-3.5" />
        Add Custom Type
      </button>
    </div>

    <!-- Resource Selection Grid by Category -->
    <div class="space-y-6 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
      <div v-for="cat in categories" :key="cat.id" class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800 pb-1.5 flex items-center gap-1.5">
          <component :is="cat.icon" class="w-3.5 h-3.5 text-emerald-400" />
          {{ cat.name }}
        </h4>

        <div class="grid sm:grid-cols-2 gap-4">
          <div
            v-for="rt in getTypesByCategory(cat.id)"
            :key="rt.id"
            class="theme-card-subtle border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between"
            :class="isTypeSelected(rt.id) ? 'border-emerald-600/60 bg-emerald-600/5' : 'border-gray-800'"
          >
            <!-- Header: Checkbox & Name -->
            <div class="flex items-center gap-3 cursor-pointer select-none" @click="toggleResourceType(rt)">
              <div
                class="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                :class="isTypeSelected(rt.id) ? 'bg-emerald-600 border-emerald-600 theme-text-heading' : 'border-gray-800 bg-slate-950'"
              >
                <span v-if="isTypeSelected(rt.id)" class="text-[10px] font-bold">✓</span>
              </div>
              <div>
                <span class="text-sm font-semibold theme-text-heading">{{ rt.name }}</span>
                <span v-if="rt.is_custom" class="ml-1.5 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">Custom</span>
              </div>
            </div>

            <!-- Details when selected -->
            <div v-if="isTypeSelected(rt.id)" class="mt-4 pt-3 border-t border-gray-800/60 space-y-2">
              <div class="grid grid-cols-[1fr_75px_100px] gap-2 items-center">
                <div>
                  <label class="block text-[9px] font-bold uppercase text-gray-500 mb-0.5">Notes / Details</label>
                  <input
                    type="text"
                    placeholder="e.g. driver, time, venue"
                    v-model="getSelectedLine(rt.id).description"
                    class="w-full theme-card shadow-xs focus:border-emerald-500 text-xs text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none placeholder-slate-700"
                  />
                </div>
                <div>
                  <label class="block text-[9px] font-bold uppercase text-gray-500 mb-0.5 text-center">Qty</label>
                  <input
                    type="number"
                    min="1"
                    v-model.number="getSelectedLine(rt.id).quantity"
                    class="w-full theme-card shadow-xs focus:border-emerald-500 text-xs text-center text-gray-300 rounded-lg px-2 py-1.5 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label class="block text-[9px] font-bold uppercase text-emerald-400 mb-0.5 text-right">Est. Price ({{ currency }})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    v-model.number="getSelectedLine(rt.id).unit_price"
                    placeholder="0.00"
                    class="w-full theme-card shadow-xs focus:border-emerald-500 text-xs text-right font-bold text-emerald-400 rounded-lg px-2 py-1.5 focus:outline-none"
                  />
                </div>
              </div>
              <div class="flex justify-end items-center gap-1.5 text-[10px] text-gray-500 font-semibold pt-1">
                <span>Line Total:</span>
                <span class="text-emerald-400 font-bold font-heading">
                  {{ formatMoney((getSelectedLine(rt.id).quantity || 1) * (getSelectedLine(rt.id).unit_price || 0), currency) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Resource Type Modal -->
    <transition name="fade">
      <div v-if="showCustomModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 theme-card backdrop-blur-sm">
        <div class="bg-slate-900 border border-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
          <div>
            <h3 class="text-base font-bold theme-text-heading">Create Custom Resource Type</h3>
            <p class="text-xs text-gray-500 mt-0.5">Define a reusable custom type for this school</p>
          </div>

          <form @submit.prevent="handleCreateCustomType" class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Type Name</label>
              <input
                type="text"
                v-model="customForm.name"
                required
                placeholder="e.g. Tour Guide, Stage Sound System"
                class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Category</label>
              <select
                v-model="customForm.category"
                required
                class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors text-gray-300"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                @click="showCustomModal = false"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-gray-700 text-gray-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 btn-primary theme-text-heading rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20"
              >
                Create & Select
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Layers, Truck, Users as UsersIcon, Coffee, Sparkles, Plus } from 'lucide-vue-next';
import { apiGetResourceTypes, apiCreateResourceType } from '../../api';
import { useAuthStore, useSchoolStore } from '../../store';
import { formatMoney } from '../../format';

const schoolStore = useSchoolStore();
const currency = computed(() => schoolStore.currency);

const props = defineProps({
  modelValue: {
    type: Object, // Shared event form object containing resources
    required: true
  }
});

const resourceTypes = ref([]);
const showCustomModal = ref(false);
const customForm = ref({ name: '', category: 'other' });

const authStore = useAuthStore();

const categories = [
  { id: 'transport', name: 'Transport', icon: Truck },
  { id: 'staffing', name: 'Staffing', icon: UsersIcon },
  { id: 'meals', name: 'Meals', icon: Coffee },
  { id: 'other', name: 'Other Support', icon: Sparkles }
];

// Initialize resources list in shared form if not already present
if (!props.modelValue.resources) {
  props.modelValue.resources = [];
}

const loadResourceTypes = async () => {
  try {
    resourceTypes.value = await apiGetResourceTypes();
  } catch (err) {
    console.error('Failed to load resource types:', err);
  }
};

const getTypesByCategory = (catId) => {
  return resourceTypes.value.filter(rt => rt.category === catId);
};

const isTypeSelected = (typeId) => {
  return props.modelValue.resources.some(r => r.resource_type_id === typeId);
};

const getSelectedLine = (typeId) => {
  return props.modelValue.resources.find(r => r.resource_type_id === typeId);
};

const toggleResourceType = (rt) => {
  const idx = props.modelValue.resources.findIndex(r => r.resource_type_id === rt.id);
  if (idx > -1) {
    props.modelValue.resources.splice(idx, 1);
  } else {
    props.modelValue.resources.push({
      resource_type_id: rt.id,
      description: '',
      quantity: 1,
      unit_price: 0,
      name: rt.name // Keep temporary display name for preview
    });
  }
};

const handleCreateCustomType = async () => {
  try {
    const newType = await apiCreateResourceType({
      name: customForm.value.name,
      category: customForm.value.category
    });
    
    // Append to list of resource types
    resourceTypes.value.push(newType);
    
    // Automatically select the newly created type
    props.modelValue.resources.push({
      resource_type_id: newType.id,
      description: '',
      quantity: 1,
      name: newType.name
    });

    customForm.value = { name: '', category: 'other' };
    showCustomModal.value = false;
  } catch (err) {
    console.error('Failed to create custom type:', err);
  }
};

onMounted(() => {
  loadResourceTypes();
});
</script>
