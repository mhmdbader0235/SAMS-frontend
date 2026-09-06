<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-bold theme-text-heading flex items-center gap-2">
        <CalendarDays class="w-5 h-5 text-emerald-400" />
        Step 1: Event Basics
      </h3>
      <p class="text-xs text-gray-500 mt-0.5">Provide general information about the event</p>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Event Title *</label>
        <input
          id="note-title"
          type="text"
          v-model="modelValue.title"
          required
          placeholder="e.g. Museum Field Trip"
          class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors"
        />
      </div>
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Location / Address *</label>
        <input
          type="text"
          v-model="modelValue.address"
          required
          placeholder="e.g. City Science Museum"
          class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors"
        />
      </div>
    </div>

    <div>
      <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Description / Details *</label>
      <textarea
        id="note-content"
        v-model="modelValue.description"
        required
        rows="3"
        placeholder="Describe event scheduling, requirements, etc."
        class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none placeholder-gray-400 transition-colors"
      ></textarea>
    </div>

    <div>
      <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Date & Time *</label>
      <input
        id="note-date"
        type="datetime-local"
        v-model="modelValue.date"
        required
        class="w-full theme-card shadow-xs focus:border-emerald-500 theme-text-heading rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors text-gray-500"
      />
      <p class="text-xs text-gray-500 mt-1">Times are in {{ schoolStore.timezone }}</p>
    </div>
  </div>
</template>

<script setup>
import { CalendarDays } from 'lucide-vue-next';
import { useSchoolStore } from '../../store';

const schoolStore = useSchoolStore();

defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});
</script>
