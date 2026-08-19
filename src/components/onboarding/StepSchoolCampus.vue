<template>
  <div class="space-y-6 animation-fade-in">
    <div>
      <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <MapPin class="w-5 h-5 text-blue-600" /> Campus &amp; Address
      </h3>
      <p class="text-xs text-slate-500 mt-1">The primary campus address — used on consent notices and as the default location for events. No map library is wired up yet, so paste coordinates directly from Google Maps if you have them.</p>
    </div>

    <div class="theme-card rounded p-5 border border-slate-200 bg-white shadow-xs space-y-4">
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Campus Name <span class="text-rose-500">*</span></label>
          <input v-model="form.name" type="text" placeholder="e.g. Main Campus"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Address Line <span class="text-rose-500">*</span></label>
          <input v-model="form.address_line1" type="text" placeholder="e.g. Street 14, Al Barsha South"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Area / District</label>
          <input v-model="form.area" type="text" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">City <span class="text-rose-500">*</span></label>
          <input v-model="form.city" type="text" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">State / Region</label>
          <input v-model="form.state_region" type="text" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Country <span class="text-rose-500">*</span></label>
          <input v-model="form.country" type="text" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">PO Box <span class="text-slate-400 font-normal normal-case">optional</span></label>
          <input v-model="form.po_box" type="text" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Postal Code <span class="text-slate-400 font-normal normal-case">optional</span></label>
          <input v-model="form.postal_code" type="text" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Latitude <span class="text-slate-400 font-normal normal-case">optional</span></label>
          <input v-model="form.latitude" type="text" placeholder="e.g. 31.9539"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Longitude <span class="text-slate-400 font-normal normal-case">optional</span></label>
          <input v-model="form.longitude" type="text" placeholder="e.g. 35.9106"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Day Start <span class="text-slate-400 font-normal normal-case">optional</span></label>
          <input v-model="form.day_start" type="time" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Day End <span class="text-slate-400 font-normal normal-case">optional</span></label>
          <input v-model="form.day_end" type="time" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { MapPin } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Object, required: true }
});
const emit = defineEmits(['update:modelValue']);

const form = reactive({ ...props.modelValue });
watch(form, (val) => emit('update:modelValue', { ...val }), { deep: true });
</script>
