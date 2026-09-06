<template>
  <!-- Terminal state (e.g. rejected / cancelled): one high-contrast badge,
       no step track -- a step tracker implies forward progress, which a
       terminal state doesn't have. -->
  <span
    v-if="terminal"
    class="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
    :class="terminalToneClass"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="terminalDotClass"></span>
    {{ terminal }}
  </span>

  <!-- Compact: one inline line for a list row / table cell. -->
  <div v-else-if="size === 'compact'" class="flex items-center gap-1.5 min-w-0">
    <div class="flex items-center">
      <template v-for="(step, i) in steps" :key="step.key">
        <div
          class="h-1.5 w-1.5 rounded-full shrink-0"
          :class="dotClass(i)"
          :title="step.label"
        ></div>
        <div
          v-if="i < steps.length - 1"
          class="h-px w-3 shrink-0"
          :class="i < currentIndex ? lineFilledClass : 'bg-slate-200 dark:bg-slate-700'"
        ></div>
      </template>
    </div>
    <span class="text-[11px] font-semibold truncate" :class="labelClass">
      {{ currentStep?.label }}
    </span>
    <span v-if="subLabel" class="text-[10px] text-slate-400 dark:text-slate-500 truncate">· {{ subLabel }}</span>
  </div>

  <!-- Default: full step tracker with labels, used on detail/header views. -->
  <div v-else class="w-full">
    <div class="flex items-center">
      <template v-for="(step, i) in steps" :key="step.key">
        <div class="flex flex-col items-center gap-1.5" :class="i === 0 ? '' : 'flex-1'">
          <div class="flex items-center w-full">
            <div
              v-if="i > 0"
              class="h-px flex-1"
              :class="i <= currentIndex ? lineFilledClass : 'bg-slate-200 dark:bg-slate-700'"
            ></div>
            <div
              class="h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
              :class="circleClass(i)"
            >
              <Check v-if="i < currentIndex" class="h-3 w-3" />
              <span v-else>{{ i + 1 }}</span>
            </div>
          </div>
          <span
            class="text-[10px] font-bold uppercase tracking-wide text-center whitespace-nowrap"
            :class="i === currentIndex ? labelClass : 'text-slate-400 dark:text-slate-500'"
          >
            {{ step.label }}
          </span>
        </div>
      </template>
    </div>

    <div v-if="subLabel || holder || locked" class="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
      <span v-if="subLabel" class="font-semibold" :class="labelClass">{{ subLabel }}</span>
      <span v-if="holder" class="inline-flex items-center gap-1 rounded-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 font-semibold text-slate-600 dark:text-slate-300">
        <UserRound class="h-3 w-3" /> Holds action: {{ holder }}
      </span>
      <span v-if="locked" class="inline-flex items-center gap-1 rounded-sm border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 font-semibold text-amber-700 dark:text-amber-400">
        <Lock class="h-3 w-3" /> Locked
      </span>
      <span v-else-if="locked === false" class="inline-flex items-center gap-1 rounded-sm border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
        <PenLine class="h-3 w-3" /> Editable
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Check, UserRound, Lock, PenLine } from 'lucide-vue-next';

// Generic, theme-aware stage/step tracker used for both of SchoolDesk's
// lifecycle trackers (the internal planning workflow and the enrollment
// workflow). Callers own the domain mapping -- which raw backend status maps
// to which step index -- this component only draws the track.
const props = defineProps({
  // Ordered list of steps: [{ key, label }]
  steps: { type: Array, required: true },
  // 0-based index of the step currently active/reached.
  currentIndex: { type: Number, required: true },
  // Optional fine-grained sub-status text shown next to/under the active step
  // (e.g. the real backend status when it's more specific than the step label).
  subLabel: { type: String, default: '' },
  // Optional "who holds the action" text (default size only).
  holder: { type: String, default: '' },
  // true = locked/read-only, false = explicitly editable, null/undefined = not shown.
  locked: { type: Boolean, default: null },
  // 'default' | 'compact'
  size: { type: String, default: 'default' },
  // Accent family for completed/current steps.
  tone: { type: String, default: 'blue' }, // 'blue' | 'violet'
  // When set, renders a single terminal badge (e.g. "Rejected by Parent")
  // instead of the step track -- for states that ended the flow early.
  terminal: { type: String, default: '' },
});

const currentStep = computed(() => props.steps[props.currentIndex] ?? props.steps[props.steps.length - 1]);

const toneClasses = {
  blue: {
    filled: 'bg-blue-600 dark:bg-blue-500',
    line: 'bg-blue-600 dark:bg-blue-500',
    label: 'text-blue-700 dark:text-blue-400',
    circleActive: 'border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500 text-white',
    circleDone: 'border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500 text-white',
  },
  violet: {
    filled: 'bg-violet-600 dark:bg-violet-500',
    line: 'bg-violet-600 dark:bg-violet-500',
    label: 'text-violet-700 dark:text-violet-400',
    circleActive: 'border-violet-600 dark:border-violet-500 bg-violet-600 dark:bg-violet-500 text-white',
    circleDone: 'border-violet-600 dark:border-violet-500 bg-violet-600 dark:bg-violet-500 text-white',
  },
};

const t = computed(() => toneClasses[props.tone] || toneClasses.blue);
const lineFilledClass = computed(() => t.value.line);
const labelClass = computed(() => t.value.label);

const dotClass = (i) => {
  if (i < props.currentIndex) return t.value.filled;
  if (i === props.currentIndex) return `${t.value.filled} ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ${props.tone === 'violet' ? 'ring-violet-200 dark:ring-violet-900' : 'ring-blue-200 dark:ring-blue-900'}`;
  return 'bg-slate-300 dark:bg-slate-600';
};

const circleClass = (i) => {
  if (i < props.currentIndex) return t.value.circleDone;
  if (i === props.currentIndex) return `${t.value.circleActive} shadow-sm`;
  return 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900';
};

const terminalToneClass = computed(() => 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900');
const terminalDotClass = computed(() => 'bg-rose-600 dark:bg-rose-400');
</script>
