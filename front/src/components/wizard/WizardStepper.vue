<template>
  <div class="flex items-center justify-between w-full max-w-2xl mx-auto mb-8 px-4">
    <div
      v-for="(step, idx) in steps"
      :key="step.number"
      class="flex items-center flex-1 last:flex-initial"
    >
      <!-- Step Circle & Label -->
      <div class="flex flex-col items-center relative group">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 workflow-step-num"
          :class="[
            currentStep > step.number
              ? 'bg-emerald-600 border-emerald-600 theme-text-heading shadow-sm'
              : currentStep === step.number
              ? 'bg-emerald-500/10 border-emerald-600 text-emerald-400 shadow-xs scale-105'
              : 'theme-card border-gray-800 text-gray-500'
          ]"
        >
          <span v-if="currentStep > step.number">✓</span>
          <span v-else>{{ step.number }}</span>
        </div>
        <span
          class="absolute -bottom-6 text-xs font-bold whitespace-nowrap tracking-wide font-heading transition-colors duration-300"
          :class="currentStep === step.number ? 'text-emerald-400' : 'text-gray-500'"
        >
          {{ step.label }}
        </span>
      </div>

      <!-- Connector line -->
      <div
        v-if="idx < steps.length - 1"
        class="flex-1 h-0.5 mx-4 transition-all duration-500"
        :class="currentStep > step.number ? 'bg-emerald-600' : 'bg-slate-800 border border-gray-700/60'"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  steps: {
    type: Array,
    default: () => [
      { number: 1, label: 'Basics' },
      { number: 2, label: 'Audience' },
      { number: 3, label: 'Resources' },
      { number: 4, label: 'Review' }
    ]
  }
});
</script>
