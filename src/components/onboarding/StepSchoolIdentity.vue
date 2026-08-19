<template>
  <div class="space-y-6 animation-fade-in">
    <div>
      <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <Building2 class="w-5 h-5 text-blue-600" /> School Identity &amp; Locale
      </h3>
      <p class="text-xs text-slate-500 mt-1">This information appears on invoices, the parent app, and event pages. You can edit most of it later — two fields lock permanently once the school activates.</p>
    </div>

    <div class="theme-card rounded p-5 border border-slate-200 bg-white shadow-xs space-y-4">
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Legal Name <span class="text-rose-500">*</span></label>
          <input v-model="form.legal_name" type="text" placeholder="e.g. Alnoor International School LLC"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Display Name <span class="text-rose-500">*</span></label>
          <input v-model="form.display_name" type="text" placeholder="e.g. Alnoor School"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
            School Code <span class="text-rose-500">*</span>
            <span v-if="isLocked" class="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              <Lock class="w-2.5 h-2.5" /> Locked after activation
            </span>
          </label>
          <input v-model="form.school_code" type="text" placeholder="e.g. ALNOOR" :disabled="isLocked"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs disabled:opacity-50 disabled:bg-slate-50" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">School Type</label>
          <input v-model="form.school_type" type="text" placeholder="e.g. Private — International"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
      </div>
    </div>

    <div class="theme-card rounded p-5 border border-slate-200 bg-white shadow-xs space-y-4">
      <h4 class="font-bold text-xs uppercase tracking-wider text-slate-600">Locale &amp; Money</h4>
      <div class="grid md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Country <span class="text-rose-500">*</span></label>
          <input v-model="form.country" type="text" placeholder="e.g. Jordan"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Time Zone <span class="text-rose-500">*</span></label>
          <input v-model="form.timezone" type="text" placeholder="e.g. Asia/Amman"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
            Currency <span class="text-rose-500">*</span>
            <span v-if="isLocked" class="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              <Lock class="w-2.5 h-2.5" /> Locked after activation
            </span>
          </label>
          <input v-model="form.currency" type="text" placeholder="e.g. JOD" :disabled="isLocked"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs disabled:opacity-50 disabled:bg-slate-50" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Academic Hemisphere</label>
          <select v-model="form.hemisphere" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-xs">
            <option value="Northern">Northern — August/September start</option>
            <option value="Southern">Southern — January/February start</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Default Language</label>
          <input v-model="form.default_language" type="text" placeholder="e.g. en"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Website <span class="text-slate-400 font-normal normal-case">optional</span></label>
          <input v-model="form.website" type="text" placeholder="e.g. alnoor.edu.jo"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
      </div>
    </div>

    <div class="theme-card rounded p-5 border border-slate-200 bg-white shadow-xs space-y-4">
      <h4 class="font-bold text-xs uppercase tracking-wider text-slate-600">Brand</h4>
      <p class="text-xs text-slate-500">Applied to the sidebar and parent-facing pages. Falls back to the platform default until set.</p>
      <div class="grid md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Logo URL <span class="text-slate-400 font-normal normal-case">optional</span></label>
          <input v-model="form.logo_url" type="text" placeholder="https://…"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Primary Colour <span class="text-slate-400 font-normal normal-case">optional</span></label>
          <input v-model="form.primary_color" type="text" placeholder="#1E4B8F"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { Building2, Lock } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Object, required: true },
  isLocked: { type: Boolean, default: false }
});
const emit = defineEmits(['update:modelValue']);

const form = reactive({ ...props.modelValue });
watch(form, (val) => emit('update:modelValue', { ...val }), { deep: true });
</script>
