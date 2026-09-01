<template>
  <div
    v-if="modelValue"
    role="dialog"
    aria-modal="true"
    aria-labelledby="import-modal-title"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
  >
    <div class="theme-card rounded p-6 w-full max-w-3xl border border-slate-200 bg-white shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
      <div class="flex items-center justify-between shrink-0 border-b border-slate-200 pb-3">
        <div>
          <h3 id="import-modal-title" class="text-base font-bold text-slate-900 flex items-center gap-2">
            <Upload class="w-5 h-5 text-blue-600" />
            Import Grades &amp; Classes
          </h3>
          <span class="text-xs text-slate-500 font-medium mt-0.5 block">
            Upload a CSV or Excel (.xlsx) file to add or update grades and class sections in bulk.
          </span>
        </div>
        <button @click="handleClose" class="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Step 1: upload -->
      <div v-if="!preview" class="space-y-3 shrink-0">
        <div class="p-3.5 bg-slate-50 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex-1">
            <label class="text-[10px] uppercase font-bold text-slate-600 block mb-1">File (.csv or .xlsx)</label>
            <input
              ref="fileInputRef"
              type="file"
              accept=".csv,.xlsx"
              @change="handleFileSelected"
              class="w-full text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-slate-300 file:bg-white file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-50 file:cursor-pointer"
            />
          </div>
          <button
            type="button"
            @click="downloadTemplate"
            class="shrink-0 px-3.5 py-2 rounded text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download class="w-3.5 h-3.5" /> Download Template
          </button>
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            :disabled="!selectedFile || isPreviewing"
            @click="runPreview"
            class="btn-primary font-bold px-4 py-2 rounded text-xs text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-xs disabled:opacity-40"
          >
            <Loader2 v-if="isPreviewing" class="w-3.5 h-3.5 animate-spin" />
            <FileSearch v-else class="w-3.5 h-3.5" />
            {{ isPreviewing ? 'Validating…' : 'Preview Import' }}
          </button>
        </div>
      </div>

      <!-- Step 2: preview + confirm -->
      <div v-else class="flex-1 flex flex-col min-h-0 space-y-3">
        <div class="flex items-center gap-3 shrink-0 text-xs font-semibold">
          <span class="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">{{ preview.valid_rows }} valid</span>
          <span v-if="preview.error_rows > 0" class="px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-800">{{ preview.error_rows }} with errors</span>
          <span class="text-slate-500 font-medium">{{ preview.filename }} &bull; {{ preview.total_rows }} rows</span>
        </div>

        <div class="flex-1 overflow-y-auto border border-slate-200 rounded">
          <table class="w-full text-xs">
            <thead class="bg-slate-50 sticky top-0">
              <tr class="text-left text-[10px] uppercase font-bold text-slate-600">
                <th class="p-2">Row</th>
                <th class="p-2">Grade</th>
                <th class="p-2">Class</th>
                <th class="p-2">Action</th>
                <th class="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in preview.rows"
                :key="row.row_number"
                class="border-t border-slate-100"
                :class="row.status === 'error' ? 'bg-rose-50/60' : ''"
              >
                <td class="p-2 text-slate-500">{{ row.row_number }}</td>
                <td class="p-2 font-semibold text-slate-800">{{ row.grade_name }}</td>
                <td class="p-2 text-slate-700">{{ row.class_name || '—' }}</td>
                <td class="p-2 text-slate-600">{{ row.action }}</td>
                <td class="p-2">
                  <span v-if="row.status === 'valid'" class="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 class="w-3.5 h-3.5" /> Valid
                  </span>
                  <span v-else class="inline-flex items-center gap-1 text-rose-700 font-semibold">
                    <XCircle class="w-3.5 h-3.5" /> {{ row.errors.join('; ') }}
                  </span>
                  <div v-if="row.warnings.length" class="text-amber-700 flex items-center gap-1 mt-0.5">
                    <AlertTriangle class="w-3 h-3" /> {{ row.warnings.join('; ') }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between shrink-0 pt-2 border-t border-slate-200">
          <button type="button" @click="resetToUpload" class="px-3.5 py-2 rounded text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all">
            &larr; Choose a Different File
          </button>
          <button
            type="button"
            :disabled="preview.valid_rows === 0 || isCommitting"
            @click="runCommit"
            class="btn-primary font-bold px-4 py-2 rounded text-xs text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-xs disabled:opacity-40"
          >
            <Loader2 v-if="isCommitting" class="w-3.5 h-3.5 animate-spin" />
            <CheckCircle2 v-else class="w-3.5 h-3.5" />
            {{ isCommitting ? 'Importing…' : `Confirm Import (${preview.valid_rows} rows)` }}
          </button>
        </div>
      </div>

      <div v-if="errorMsg" class="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 font-semibold flex items-center gap-2 shrink-0">
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
        <span>{{ errorMsg }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  Upload, Download, X, Loader2, FileSearch, CheckCircle2, XCircle, AlertTriangle, AlertCircle
} from 'lucide-vue-next';
import { apiPreviewStructureImport, apiCommitStructureImport } from '../api';
import { useStructureStore } from '../store';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue', 'imported']);

const structureStore = useStructureStore();

const fileInputRef = ref(null);
const selectedFile = ref(null);
const preview = ref(null);
const isPreviewing = ref(false);
const isCommitting = ref(false);
const errorMsg = ref(null);

const setError = (msg) => {
  errorMsg.value = msg;
  setTimeout(() => { errorMsg.value = null; }, 6000);
};

const handleFileSelected = (event) => {
  selectedFile.value = event.target.files?.[0] || null;
};

const runPreview = async () => {
  if (!selectedFile.value) return;
  isPreviewing.value = true;
  try {
    preview.value = await apiPreviewStructureImport(selectedFile.value);
  } catch (err) {
    setError(err.message || 'Could not validate the file.');
  } finally {
    isPreviewing.value = false;
  }
};

const runCommit = async () => {
  if (!selectedFile.value) return;
  isCommitting.value = true;
  try {
    const result = await apiCommitStructureImport(selectedFile.value);
    await structureStore.reloadLiveStructure();
    emit('imported', result);
    handleClose();
  } catch (err) {
    setError(err.message || 'Could not apply the import.');
  } finally {
    isCommitting.value = false;
  }
};

const resetToUpload = () => {
  preview.value = null;
};

const handleClose = () => {
  selectedFile.value = null;
  preview.value = null;
  errorMsg.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
  emit('update:modelValue', false);
};

// Client-side only, no network call -- mirrors the CSV-export Blob pattern
// already used for the student roster export in StudentPlacementView.vue.
const downloadTemplate = () => {
  const headers = [
    'grade_name', 'grade_ordinal', 'grade_isced_level', 'grade_age_min', 'grade_age_max',
    'grade_active', 'class_name', 'class_capacity', 'class_active', 'head_teacher_email',
  ];
  const rows = [
    ['Grade 7', '7', '2', '11', '12', 'TRUE', 'Grade 7 - A', '28', 'TRUE', 'jane.smith@school.edu'],
    ['Grade 7', '7', '2', '11', '12', 'TRUE', 'Grade 7 - B', '28', 'TRUE', ''],
  ];
  const BOM = String.fromCharCode(0xFEFF);
  const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'grades_and_classes_import_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>
