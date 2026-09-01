<template>
  <div class="space-y-4">

    <!-- Alerts Banner -->
    <transition name="fade">
      <div v-if="successMsg" class="p-3.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-semibold flex items-center gap-2.5 shadow-xs">
        <CheckCircle class="w-4 h-4 shrink-0 text-emerald-600" />
        <span>{{ successMsg }}</span>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="errorMsg" class="p-3.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 font-semibold flex items-center gap-2.5 shadow-xs">
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
        <span>{{ errorMsg }}</span>
      </div>
    </transition>

    <!-- Load-failure banner: distinct from errorMsg above (auto-dismisses
         after an action) -- a failed hydration used to fall back to blank
         canonical defaults with no indication anything had gone wrong,
         which read as "my setup was lost" rather than "the load failed". -->
    <div v-if="structureStore.curriculumSetupError" class="p-3.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 font-semibold flex items-center justify-between gap-2.5 shadow-xs">
      <span class="flex items-center gap-2.5">
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
        Couldn't load your saved setup: {{ structureStore.curriculumSetupError }}. Showing defaults -- saving now may overwrite what you had.
      </span>
      <button @click="hydrateFromCurriculumSetup()" class="shrink-0 px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold transition-colors">
        Retry
      </button>
    </div>

    <div class="space-y-6 animation-fade-in">

      <!-- Stepper Header -->
      <div v-if="!embedded" class="flex items-center justify-between theme-card rounded p-3 shadow-xs border border-slate-200 bg-white">
        <div class="flex items-center gap-2 md:gap-4 w-full">
          <button v-for="(step, index) in steps" :key="index" @click="currentStep = index + 1"
            class="flex items-center gap-2 px-3.5 py-2 rounded transition-all flex-1 text-left"
            :class="[currentStep === index + 1 ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100']"
          >
            <div class="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0"
              :class="currentStep === index + 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'">
              {{ index + 1 }}
            </div>
            <div class="hidden md:block">
              <span class="text-[10px] uppercase font-bold text-slate-400 block leading-none">Step {{ index + 1 }}</span>
              <span class="text-xs font-semibold mt-0.5 block">{{ step.title }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Curriculum Lock Notice (system is frozen once the school is activated) -->
      <div v-if="isCurriculumLocked" class="p-3.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 font-semibold flex items-center gap-2.5 shadow-xs">
        <Lock class="w-4 h-4 shrink-0 text-amber-600" />
        <span>The curriculum system is locked after activation and cannot be changed. Grades and class sections can still be edited freely.</span>
      </div>

      <!-- Step 1: System Select (3 Core Standards: UK, International, Custom) -->
      <div v-if="currentStep === 1" class="space-y-6 animation-fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe class="w-5 h-5 text-blue-600" /> Select Curriculum Standard
            </h3>
            <p class="text-xs text-slate-500 mt-1">Choose between the 3 standard curriculum presets. You can customize display names and configure up to 25 sections in Step 2 & 3.</p>
          </div>
          <div class="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded flex items-center gap-2 self-start shrink-0 shadow-xs font-semibold">
            <CheckCircle class="w-4 h-4 text-blue-600" /> Selected Standard: <strong>{{ currentSystemName }}</strong>
          </div>
        </div>

        <!-- Already have grades/classes in a spreadsheet? Import writes
             directly to the database, unlike everything below on this page
             (which is a local draft only saved when the wizard is
             finished) -- so a successful import leaves the wizard rather
             than continuing into steps whose own "Finish" would otherwise
             overwrite what was just imported. -->
        <div class="p-3.5 bg-slate-50 rounded border border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p class="text-xs text-slate-600">
            Already have your grades and classes in a spreadsheet? Skip the builder below and import them directly.
          </p>
          <button
            type="button"
            @click="showImportModal = true"
            class="shrink-0 px-3.5 py-2 rounded text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Upload class="w-3.5 h-3.5" /> Import from File
          </button>
        </div>

        <!-- 3 Core System Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="sys in systems"
            :key="sys.id"
            @click="!isCurriculumLocked && selectSystem(sys.id)"
            class="p-5 rounded border transition-all relative overflow-hidden flex flex-col justify-between gap-4 group shadow-xs"
            :class="[
              structureState.system === sys.id ? 'bg-blue-50/50 border-2 border-blue-600' : 'bg-white border-slate-200 hover:border-blue-300',
              isCurriculumLocked ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
            ]"
          >
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div class="w-12 h-12 rounded flex items-center justify-center text-2xl border"
                  :class="structureState.system === sys.id ? 'bg-blue-100 border-blue-300' : 'bg-slate-100 border-slate-200'">
                  {{ sys.icon }}
                </div>
                <div v-if="structureState.system === sys.id" class="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white shadow-xs">
                  <CheckCircle class="w-3 h-3" /> Active
                </div>
              </div>

              <div>
                <h4 class="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{{ sys.name }}</h4>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ sys.desc }}</p>
              </div>

              <!-- Stages Pills -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span v-for="tag in sys.tags" :key="tag" class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span class="text-xs font-medium text-slate-500">14 Canonical Stages</span>
              <span class="text-xs font-bold transition-colors flex items-center gap-1"
                :class="structureState.system === sys.id ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-800'">
                {{ structureState.system === sys.id ? 'Selected' : 'Click to Select' }} &rarr;
              </span>
            </div>
          </div>
        </div>

        <!-- Complete Live Grade Hierarchy Preview Panel (All 14 Stages Fully Visible) -->
        <div class="theme-card rounded p-5 border border-slate-200 bg-white shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Eye class="w-4 h-4 text-blue-600" /> Complete Grade Hierarchy: {{ currentSystemName }}
              </h4>
              <p class="text-xs text-slate-500 mt-0.5">All 14 standard educational stages generated for {{ currentSystemName }}:</p>
            </div>
            <button @click="currentStep = 2" class="btn-primary text-xs font-bold px-4 py-2 rounded text-white flex items-center gap-1.5 self-start shadow-xs">
              Continue to Step 2: Ladder Editor <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Responsive 14-Card Grid (2 rows of 7) -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <div
              v-for="spine in canonicalSpineRaw"
              :key="spine.ord"
              class="p-3 rounded bg-slate-50 border border-slate-200 flex flex-col justify-between gap-1.5 shadow-xs"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  #{{ spine.ord }}
                </span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  ISCED {{ spine.isced_level }}
                </span>
              </div>
              <div>
                <div class="font-bold text-slate-900 text-xs truncate" :title="spine.names[structureState.system]">
                  {{ spine.names[structureState.system] || `Grade ${spine.ord}` }}
                </div>
                <div class="text-[10px] text-slate-500 mt-0.5">
                  {{ spine.age_band_min }}-{{ spine.age_band_max }} yrs
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Ladder Editor -->
      <div v-if="currentStep === 2" class="space-y-6 animation-fade-in">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GitCommit class="w-5 h-5 text-blue-600" /> Grade Ladder Editor
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Toggle active grades and customize localized display names. These names become the static prefix for class sections in Step 3.</p>
          </div>
          <button @click="resetGradeNamesToPreset" class="text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded border border-slate-300 hover:border-blue-300 transition-colors flex items-center gap-1.5 bg-white shadow-xs">
            <RotateCcw class="w-3.5 h-3.5" /> Reset Names to {{ currentSystemName }}
          </button>
        </div>

        <div class="theme-card rounded border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200 font-bold">
                  <th class="p-3.5 font-semibold w-16 text-center">Active</th>
                  <th class="p-3.5 font-semibold">Canonical Level (ISCED)</th>
                  <th class="p-3.5 font-semibold">Age Band</th>
                  <th class="p-3.5 font-semibold">Grade Display Name (Static Class Prefix)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="level in structureState.levels" :key="level.ordinal"
                  class="transition-colors hover:bg-slate-50"
                  :class="{'opacity-50': !level.is_active}">
                  <td class="p-3.5 text-center">
                    <input type="checkbox" v-model="level.is_active" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </td>
                  <td class="p-3.5">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Ord {{ level.ordinal }}</span>
                      <span class="text-xs font-bold text-slate-900">ISCED {{ level.isced_level }}</span>
                    </div>
                  </td>
                  <td class="p-3.5">
                    <span class="text-xs text-slate-600 font-medium">{{ level.age_band_min }} - {{ level.age_band_max }} yrs</span>
                  </td>
                  <td class="p-3.5">
                    <input type="text" v-model="level.name" :disabled="!level.is_active"
                      class="w-full bg-white border border-slate-300 text-slate-900 rounded px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-blue-600 transition-colors disabled:opacity-50" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Step 3: Class Sections (Static Grade Prefix + Custom Section Suffix, Max 25 Sections) -->
      <div v-if="currentStep === 3" class="space-y-6 animation-fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Network class="w-5 h-5 text-blue-600" /> Class Sections Generator
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Grade name is locked as the static prefix. Add up to 25 sections (A–Y or custom) per grade.</p>
          </div>
          <button @click="openBulkAddModal" class="btn-primary text-xs font-bold px-4 py-2 rounded text-white flex items-center gap-1.5 shadow-xs">
            <CopyPlus class="w-3.5 h-3.5" /> Bulk Generate Sections (A–Z)
          </button>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="level in activeLevels" :key="level.ordinal" class="theme-card rounded border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div class="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900 text-xs">{{ level.name }}</span>
                <span class="text-[10px] text-slate-500 font-semibold">({{ (level.sections || []).length }} / 25 Sections Max)</span>
              </div>
              <button
                @click="addSection(level)"
                :disabled="(level.sections || []).length >= 25"
                class="text-xs font-bold transition-colors flex items-center gap-1 disabled:opacity-40"
                :class="(level.sections || []).length >= 25 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:underline'"
              >
                <Plus class="w-3.5 h-3.5" /> Add Section
              </button>
            </div>

            <div v-if="(!level.sections || level.sections.length === 0)" class="text-center py-4 text-xs text-slate-400 italic">
              No sections configured. Click Add to create sections (max 25).
            </div>

            <div v-else class="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div v-for="(sec, sIdx) in level.sections" :key="sIdx" class="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <!-- Static Grade Name Prefix + Section Suffix Input -->
                <div class="flex items-center flex-1">
                  <span class="bg-slate-200/80 px-2 py-1 text-xs font-bold text-slate-700 rounded-l border-y border-l border-slate-300 select-none whitespace-nowrap">
                    {{ level.name }} -
                  </span>
                  <input
                    type="text"
                    v-model="sec.suffix"
                    @input="sec.name = `${level.name} - ${(sec.suffix || '').trim()}`"
                    placeholder="A"
                    class="w-full bg-white border border-slate-300 rounded-r px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <button @click="removeSection(level, sIdx)" class="text-rose-500 hover:text-rose-700 p-1" title="Remove Section">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Academic Calendar -->
      <div v-if="currentStep === 4" class="space-y-6 animation-fade-in">
        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays class="w-5 h-5 text-blue-600" /> Academic Calendar & Blocked Days
        </h3>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="theme-card rounded p-6 border border-slate-200 bg-white shadow-xs space-y-4">
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-600 mb-4">
              Base Calendar Setup
            </h4>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Academic Year</label>
                <input type="text" v-model="structureState.calendar.academic_year" placeholder="e.g. 2026-2027" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Start Month</label>
                <select v-model="structureState.calendar.start_month" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-xs">
                  <option v-for="(m, i) in months" :key="i" :value="i+1">{{ m }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Recurring Weekend Days</label>
                <div class="flex flex-wrap gap-2">
                  <label v-for="day in weekDays" :key="day" class="flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer transition-colors"
                    :class="structureState.calendar.weekend_days.includes(day) ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium'">
                    <input type="checkbox" :value="day" v-model="structureState.calendar.weekend_days" class="hidden" />
                    <span class="text-xs">{{ day }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="theme-card rounded p-6 border border-slate-200 bg-white shadow-xs flex flex-col">
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-600 mb-4">
              Non-Instructional Days
            </h4>

            <form @submit.prevent="addBlackoutDate" class="space-y-3 mb-4 bg-slate-50 p-4 rounded border border-slate-200">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Date</label>
                  <input type="date" v-model="newBlackout.date" required class="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Title</label>
                  <input type="text" v-model="newBlackout.title" required placeholder="e.g. Spring Break" class="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs" />
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">Category Tags</label>
                <div class="flex gap-2">
                  <select v-model="newBlackout.tag" class="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-xs">
                    <option value="Public Holiday">Public Holiday</option>
                    <option value="Assessment/Quiz Day">Assessment/Quiz Day</option>
                    <option value="Staff Training">Staff Training</option>
                    <option value="Other">Other</option>
                  </select>
                  <button type="submit" class="btn-primary px-3 py-1.5 rounded text-xs font-bold text-white transition-all active:scale-95 flex items-center gap-1 shadow-xs">
                    <Plus class="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </form>

            <div class="flex-1 overflow-y-auto max-h-48 space-y-2 pr-1">
              <div v-if="structureState.blackout_dates.length === 0" class="text-center py-4 text-xs text-slate-400 italic">
                No blackout dates configured.
              </div>
              <div v-for="(bd, idx) in structureState.blackout_dates" :key="idx" class="flex items-center justify-between p-3 bg-white rounded border border-slate-200 group shadow-xs">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-900">{{ bd.title }}</span>
                    <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">{{ bd.tags ? bd.tags[0] : 'Holiday' }}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Calendar class="w-3 h-3 text-slate-400" /> {{ bd.date }}
                  </div>
                </div>
                <button @click="removeBlackoutDate(idx)" class="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Setup Footer Actions Bar (own footer only when not embedded — the
           onboarding wizard drives navigation itself via defineExpose below).
           `sticky` instead of `fixed`: it stays pinned to the bottom of the
           scroll viewport while still occupying real space in the layout, so
           it never needs a guessed padding-bottom to keep it from covering
           the last card of a tall step. -->
      <div v-if="!embedded" class="sticky bottom-0 bg-white border-t border-slate-200 p-4 z-40 shadow-lg">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <button @click="currentStep--" :disabled="currentStep === 1" class="px-4 py-2 rounded font-semibold text-xs transition-all disabled:opacity-30 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200">
            Back
          </button>

          <div class="flex items-center gap-3">
            <button v-if="currentStep < 4" @click="currentStep++" class="btn-primary font-bold px-5 py-2 rounded text-xs text-white transition-all active:scale-95 flex items-center gap-2 shadow-xs">
              Continue <ArrowRight class="w-3.5 h-3.5" />
            </button>

            <button v-else @click="saveConfiguration" :disabled="isSaving" class="btn-primary font-bold px-6 py-2 rounded text-xs text-white transition-all active:scale-95 flex items-center gap-2 shadow-xs" :class="{'opacity-50 cursor-not-allowed': isSaving}">
              <Save class="w-3.5 h-3.5" v-if="!isSaving" />
              <Loader2 class="w-3.5 h-3.5 animate-spin" v-else />
              {{ isSaving ? 'Saving...' : 'Save & Synchronize Structure' }}
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- 4. Bulk Add Sections Modal (A–Z up to 25) -->
    <div
      v-if="showBulkModal"
      ref="bulkModalRef"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-modal-title"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
    >
      <div class="theme-card rounded p-6 w-full max-w-md border border-slate-200 bg-white shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 id="bulk-modal-title" class="text-base font-bold text-slate-900 flex items-center gap-2">
            <CopyPlus class="w-5 h-5 text-blue-600" />
            Bulk Generate Sections (A–Z)
          </h3>
          <button @click="showBulkModal = false" class="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <span class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Target ISCED Levels</span>
            <div class="flex gap-2">
              <label v-for="isc in [0, 1, 2, 3]" :key="isc" class="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-300 text-xs font-bold cursor-pointer transition-colors"
                :class="bulkForm.targetIsced.includes(isc) ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white text-slate-700 hover:bg-slate-50'">
                <input type="checkbox" :value="isc" v-model="bulkForm.targetIsced" class="hidden" />
                ISCED {{ isc }}
              </label>
            </div>
          </div>

          <div>
            <label for="bulk-form-count" class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Sections per Grade (1 to 25 Max)</label>
            <input id="bulk-form-count" type="number" v-model="bulkForm.count" min="1" max="25" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors shadow-xs font-bold" />
            <span class="text-[11px] text-slate-500 mt-1 block">Automatically creates sections named A, B, C... up to {{ letters[Math.min(24, Math.max(0, (bulkForm.count || 1) - 1))] }}</span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button @click="showBulkModal = false" class="px-4 py-2 rounded text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button @click="executeBulkAdd" class="btn-primary font-bold px-4 py-2 rounded text-xs text-white transition-all active:scale-95 shadow-xs">Generate Sections</button>
          </div>
        </div>
      </div>
    </div>

    <StructureImportModal v-model="showImportModal" @imported="handleImported" />

  </div>
</template>

<script setup>
import { ref, computed, onActivated, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  Globe, CheckCircle, ArrowRight, Eye, GitCommit, RotateCcw, Network, Plus,
  CopyPlus, Trash2, CalendarDays, Calendar, Save, Loader2, X, AlertCircle, Lock, Upload
} from 'lucide-vue-next';
import { useStructureStore, useSchoolStore } from '../store';
import StructureImportModal from './StructureImportModal.vue';

const props = defineProps({
  // When true, hides this component's own stepper header and fixed footer
  // and lets the parent (OnboardingWizardView) drive navigation via the
  // methods exposed at the bottom of this script block.
  embedded: { type: Boolean, default: false }
});
const emit = defineEmits(['saved']);

const router = useRouter();
const structureStore = useStructureStore();
const schoolStore = useSchoolStore();

// The curriculum SYSTEM (not grades/sections) is frozen once the school is
// activated — see domains/school/service.py::activate().
const isCurriculumLocked = computed(() => !!schoolStore.profile?.curriculum_locked_at);
schoolStore.ensureProfileLoaded().catch(() => {});

const successMsg = ref(null);
const errorMsg = ref(null);
const setSuccess = (msg) => {
  successMsg.value = msg;
  setTimeout(() => { successMsg.value = null; }, 5000);
};
const setError = (msg) => {
  errorMsg.value = msg;
  setTimeout(() => { errorMsg.value = null; }, 5000);
};

const isSaving = ref(false);

// Import writes directly to the database (unlike structureState below, a
// local draft only persisted when the wizard finishes) -- so a successful
// import leaves the wizard the same way finishWizard() below does, rather
// than letting the user continue into steps whose own save would apply
// structureState (likely still just the canonical template, untouched by
// the import) and, per save_academic_structure's delete-by-omission
// behavior, wipe out what was just imported.
const showImportModal = ref(false);
const handleImported = (result) => {
  setSuccess(
    `Import complete: ${result.created_grades} grade(s) created, ${result.updated_grades} updated, `
    + `${result.created_classes} class(es) created, ${result.updated_classes} updated.`
  );
  if (props.embedded) {
    emit('saved');
  } else {
    router.replace({ path: '/manage/structure' }).catch(() => {});
  }
};

// 25 letters sequence for up to 25 sections (A to Y)
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, 25);

const currentStep = ref(1);
const steps = [
  { title: 'System Standard' },
  { title: 'Grade Ladder' },
  { title: 'Class Sections' },
  { title: 'Academic Calendar' }
];

// Exactly 3 Curriculum Standards per user requirement
const systems = [
  {
    id: 'UK',
    name: 'UK National Curriculum',
    icon: '🇬🇧',
    desc: 'Year 1 to Year 13 organized across Key Stages (Reception to Sixth Form)',
    tags: ['Key Stages 1-5', 'GCSE / A-Levels', 'Age 4–18']
  },
  {
    id: 'International',
    name: 'International Standard',
    icon: '🌍',
    desc: 'Standardized ISCED 0-3 framework spanning Early Years, Primary, Middle, and High School',
    tags: ['Early Years', 'Primary (G1-5)', 'Middle (G6-8)', 'Secondary (G9-12)', 'Age 4–18']
  },
  {
    id: 'Custom',
    name: 'Customer / Custom Standard',
    icon: '⚙️',
    desc: 'Fully customizable grade ladder — tailor stage names, age spans, and section distributions',
    tags: ['Fully Customizable', 'Custom Grades', 'Flexible Structure', 'Age 4–18']
  }
];

const currentSystemName = computed(() => {
  const match = systems.find(s => s.id === structureState.value.system);
  return match ? match.name : 'UK National Curriculum';
});

// Grade/section names are free text and get interpolated into a RegExp
// below to strip a section's name prefix back down to its suffix -- a name
// containing a regex metacharacter (e.g. "Year 7 [IB]") throws a
// SyntaxError there otherwise, which used to crash wizard hydration itself
// (or, in StructureClassesView's copy of this same pattern, silently kill
// the Edit button's click handler before it could open the modal).
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// All 14 Canonical Stages
const canonicalSpineRaw = [
  { ord: 1, isced_level: 0, age_band_min: 4, age_band_max: 5, names: { UK: 'Reception', International: 'Early Years', Custom: 'KG 1' } },
  { ord: 2, isced_level: 0, age_band_min: 5, age_band_max: 6, names: { UK: 'Year 1', International: 'Kindergarten', Custom: 'KG 2' } },
  { ord: 3, isced_level: 1, age_band_min: 6, age_band_max: 7, names: { UK: 'Year 2', International: 'Grade 1', Custom: 'Grade 1' } },
  { ord: 4, isced_level: 1, age_band_min: 7, age_band_max: 8, names: { UK: 'Year 3', International: 'Grade 2', Custom: 'Grade 2' } },
  { ord: 5, isced_level: 1, age_band_min: 8, age_band_max: 9, names: { UK: 'Year 4', International: 'Grade 3', Custom: 'Grade 3' } },
  { ord: 6, isced_level: 1, age_band_min: 9, age_band_max: 10, names: { UK: 'Year 5', International: 'Grade 4', Custom: 'Grade 4' } },
  { ord: 7, isced_level: 2, age_band_min: 10, age_band_max: 11, names: { UK: 'Year 6', International: 'Grade 5', Custom: 'Grade 5' } },
  { ord: 8, isced_level: 2, age_band_min: 11, age_band_max: 12, names: { UK: 'Year 7', International: 'Grade 6', Custom: 'Grade 6' } },
  { ord: 9, isced_level: 2, age_band_min: 12, age_band_max: 13, names: { UK: 'Year 8', International: 'Grade 7', Custom: 'Grade 7' } },
  { ord: 10, isced_level: 2, age_band_min: 13, age_band_max: 14, names: { UK: 'Year 9', International: 'Grade 8', Custom: 'Grade 8' } },
  { ord: 11, isced_level: 3, age_band_min: 14, age_band_max: 15, names: { UK: 'Year 10', International: 'Grade 9', Custom: 'Grade 9' } },
  { ord: 12, isced_level: 3, age_band_min: 15, age_band_max: 16, names: { UK: 'Year 11', International: 'Grade 10', Custom: 'Grade 10' } },
  { ord: 13, isced_level: 3, age_band_min: 16, age_band_max: 17, names: { UK: 'Year 12', International: 'Grade 11', Custom: 'Grade 11' } },
  { ord: 14, isced_level: 3, age_band_min: 17, age_band_max: 18, names: { UK: 'Year 13', International: 'Grade 12', Custom: 'Grade 12' } }
];

const structureState = ref({
  system: 'UK',
  levels: [],
  calendar: {
    academic_year: '2026-2027',
    start_month: 9,
    weekend_days: ['Saturday', 'Sunday']
  },
  blackout_dates: []
});

const initializeLevels = (sys = 'UK') => {
  structureState.value.levels = canonicalSpineRaw.map(s => ({
    ordinal: s.ord,
    isced_level: s.isced_level,
    age_band_min: s.age_band_min,
    age_band_max: s.age_band_max,
    name: s.names[sys] || s.names['UK'] || `Grade ${s.ord}`,
    is_active: true,
    sections: []
  }));
};

const selectSystem = (sysId) => {
  structureState.value.system = sysId;
  structureStore.setDraftCurriculumSystem(sysId);
  structureState.value.levels.forEach(lvl => {
    const spine = canonicalSpineRaw.find(s => s.ord === lvl.ordinal);
    if (spine && spine.names[sysId]) {
      lvl.name = spine.names[sysId];
    }
  });
};

const resetGradeNamesToPreset = () => {
  const sys = structureState.value.system;
  structureState.value.levels.forEach(lvl => {
    const spine = canonicalSpineRaw.find(s => s.ord === lvl.ordinal);
    if (spine && spine.names[sys]) {
      lvl.name = spine.names[sys];
    }
  });
  setSuccess(`Reset grade names to ${currentSystemName.value} standard.`);
};

const activeLevels = computed(() => structureState.value.levels.filter(l => l.is_active));

const addSection = (level) => {
  if (!level.sections) level.sections = [];
  if (level.sections.length >= 25) {
    setError(`Maximum 25 sections allowed for ${level.name}`);
    return;
  }
  const currentCount = level.sections.length;
  const suffix = currentCount < letters.length ? letters[currentCount] : `${currentCount + 1}`;
  level.sections.push({
    name: `${level.name} - ${suffix}`,
    suffix: suffix,
    capacity: 25
  });
};

const removeSection = (level, index) => {
  level.sections.splice(index, 1);
};

// Bulk Add in Wizard (Max 25)
const showBulkModal = ref(false);
const bulkForm = ref({ targetIsced: [0, 1, 2, 3], count: 2 });

const openBulkAddModal = () => {
  showBulkModal.value = true;
};

// Focus trap + Escape-to-close + return-focus-to-trigger -- same pattern as
// StructureClassesView.vue's copy (this codebase has no composables/
// folder, so it's duplicated per component rather than shared). Without
// it, tabbing past the last field in this modal left it entirely, into the
// page underneath, with no way to close it but the mouse.
const bulkModalRef = ref(null);
const BULK_MODAL_FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
{
  let previouslyFocused = null;
  const handleBulkModalKeydown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      showBulkModal.value = false;
      return;
    }
    if (e.key !== 'Tab' || !bulkModalRef.value) return;
    const focusable = bulkModalRef.value.querySelectorAll(BULK_MODAL_FOCUSABLE_SELECTOR);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  watch(showBulkModal, async (isOpen) => {
    if (isOpen) {
      previouslyFocused = document.activeElement;
      await nextTick();
      const focusable = bulkModalRef.value?.querySelectorAll(BULK_MODAL_FOCUSABLE_SELECTOR);
      (focusable && focusable[0] ? focusable[0] : bulkModalRef.value)?.focus();
      document.addEventListener('keydown', handleBulkModalKeydown);
    } else {
      document.removeEventListener('keydown', handleBulkModalKeydown);
      previouslyFocused?.focus?.();
      previouslyFocused = null;
    }
  });
}

const executeBulkAdd = () => {
  const maxAllowed = Math.min(25, Math.max(1, bulkForm.value.count || 1));
  const targetLevels = activeLevels.value.filter(level => bulkForm.value.targetIsced.includes(level.isced_level));
  const existingSectionCount = targetLevels.reduce((sum, level) => sum + (level.sections?.length || 0), 0);

  // This wholesale-replaces every targeted grade's sections -- with the
  // default ISCED selection that's every grade in the ladder. Confirm
  // before discarding hand-tuned names/capacities rather than silently
  // wiping them; the button read as purely additive.
  if (existingSectionCount > 0) {
    const proceed = confirm(
      `This will replace all ${existingSectionCount} existing section(s) across ${targetLevels.length} grade(s) with ${maxAllowed} freshly generated one(s) each. Any custom names or capacities you've set will be lost. Continue?`
    );
    if (!proceed) return;
  }

  targetLevels.forEach(level => {
    level.sections = [];
    for (let i = 0; i < maxAllowed; i++) {
      const suffix = letters[i] || `${i + 1}`;
      level.sections.push({
        name: `${level.name} - ${suffix}`,
        suffix: suffix,
        capacity: 25
      });
    }
  });
  showBulkModal.value = false;
  setSuccess(`Generated ${maxAllowed} sections per grade (named A through ${letters[maxAllowed - 1] || maxAllowed}) across selected grades.`);
};

// Calendar
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const newBlackout = ref({ date: '', title: '', tag: 'Public Holiday' });

const addBlackoutDate = () => {
  if (!newBlackout.value.date || !newBlackout.value.title) return;
  structureState.value.blackout_dates.push({
    date: newBlackout.value.date,
    title: newBlackout.value.title,
    tags: [newBlackout.value.tag]
  });
  structureState.value.blackout_dates.sort((a, b) => new Date(a.date) - new Date(b.date));
  newBlackout.value = { date: '', title: '', tag: 'Public Holiday' };
};

const removeBlackoutDate = (idx) => {
  structureState.value.blackout_dates.splice(idx, 1);
};

const saveConfiguration = async () => {
  isSaving.value = true;
  errorMsg.value = null;
  try {
    const payload = JSON.parse(JSON.stringify(structureState.value));
    // Deactivated grades must still be sent -- the backend applies
    // is_active from whatever it's given, but a level dropped from this
    // list entirely is indistinguishable from one the wizard hasn't
    // loaded yet, so it's left untouched rather than deleted. Filtering
    // them out here was why turning a grade off in the wizard never
    // actually persisted.
    payload.levels = payload.levels.map(lvl => {
      // Ensure all sections have full names with static prefix, and keep
      // each section's id so the backend updates the existing row instead
      // of creating a duplicate under the new name.
      lvl.sections = (lvl.sections || []).map(sec => ({
        id: sec.id,
        name: sec.name || `${lvl.name} - ${sec.suffix || 'A'}`,
        capacity: sec.capacity || 25
      }));
      return lvl;
    });

    await structureStore.saveCurriculumSetup(payload);
    setSuccess('Academic Structure & Calendar saved and synchronized successfully!');
    if (props.embedded) {
      emit('saved');
    } else {
      router.replace({ path: '/manage/structure' }).catch(() => {});
    }
  } catch (err) {
    setError(err.message || 'Failed to save configuration');
    if (props.embedded) throw err;
  } finally {
    isSaving.value = false;
  }
};

// Exposed so the onboarding wizard shell can drive this component's internal
// 4-step navigation (System -> Ladder -> Sections -> Calendar) from its own
// footer instead of duplicating this UI.
defineExpose({
  currentStep,
  totalSteps: steps.length,
  goBack: () => { if (currentStep.value > 1) currentStep.value--; },
  goNext: () => { if (currentStep.value < steps.length) currentStep.value++; },
  isLastStep: computed(() => currentStep.value === steps.length),
  isSaving,
  save: saveConfiguration
});

// Hydrate the wizard's working state from the persisted curriculum setup
// (if any). Extracted into a named function (rather than an inline IIFE)
// so onActivated below can re-run it: ManageStructureView wraps this
// component in <KeepAlive>, which means switching to the "Live Structure"
// tab and back does NOT remount it -- this body would otherwise run
// exactly once per page load, never again, no matter what changed on the
// other tab in the meantime.
const hydrateFromCurriculumSetup = async () => {
  try {
    const setupData = await structureStore.ensureCurriculumSetupLoaded();
    // Calendar and blackout dates are hydrated whenever a prior save
    // exists at all -- has_structure only means "at least one active
    // level with sections", which has nothing to do with whether a
    // calendar was already configured. Gating this on has_structure meant
    // a school with, say, every grade currently deactivated would load
    // with an empty blackout_dates array; saving from that state (even a
    // save that only touched grades) then wiped every real holiday, since
    // the save endpoint takes this array as the caller's complete intent.
    if (setupData) {
      structureState.value.system = ['UK', 'International', 'Custom'].includes(setupData.system) ? setupData.system : 'UK';
      if (setupData.calendar) structureState.value.calendar = setupData.calendar;
      if (setupData.blackout_dates) structureState.value.blackout_dates = setupData.blackout_dates;
    }

    if (setupData && setupData.has_structure) {
      const savedLevels = setupData.levels || [];
      structureState.value.levels = canonicalSpineRaw.map(spine => {
        const existing = savedLevels.find(l => l.ordinal === spine.ord || l.name.toLowerCase() === (spine.names[structureState.value.system] || '').toLowerCase());
        if (existing) {
          return {
            level_id: existing.level_id,
            ordinal: spine.ord,
            isced_level: existing.isced_level !== undefined ? existing.isced_level : spine.isced_level,
            age_band_min: existing.age_band_min || spine.age_band_min,
            age_band_max: existing.age_band_max || spine.age_band_max,
            name: existing.name,
            is_active: existing.is_active !== undefined ? existing.is_active : true,
            sections: (existing.sections || []).map(sec => {
              let suffix = sec.name;
              if (sec.name.startsWith(existing.name)) {
                suffix = sec.name.replace(new RegExp(`^${escapeRegExp(existing.name)}\\s*-\\s*`), '').trim();
              }
              return {
                id: sec.id,
                name: sec.name,
                suffix: suffix || 'A',
                capacity: sec.capacity || 25
              };
            })
          };
        }
        return {
          ordinal: spine.ord,
          isced_level: spine.isced_level,
          age_band_min: spine.age_band_min,
          age_band_max: spine.age_band_max,
          name: spine.names[structureState.value.system] || `Grade ${spine.ord}`,
          is_active: true,
          sections: []
        };
      });
    } else {
      initializeLevels('UK');
    }
    // Default the academic year's start month from the school's hemisphere
    // (Southern-hemisphere schools typically start in Jan/Feb, not
    // September) -- but only when there is no already-saved calendar to
    // override; a school with a real saved start_month must not have it
    // silently replaced by this guess just because has_structure is false.
    if (!setupData?.calendar && schoolStore.profile?.hemisphere === 'Southern') {
      structureState.value.calendar.start_month = 1;
    }
  } catch (err) {
    console.warn('Initial load warning:', err);
    initializeLevels('UK');
  }
};

// onActivated also fires on this component's initial mount (documented Vue
// behavior, true whether or not a <KeepAlive> ancestor exists), so this is
// the only hydration call needed. hasHydratedOnce is local to THIS
// component instance, separate from the store's (global, session-wide)
// curriculumSetupLoaded flag -- needed because a genuine remount (e.g.
// navigating away to an unrelated route and back, which destroys
// <KeepAlive>'s cache along with its parent) must always re-hydrate this
// fresh instance's local structureState even if the store still thinks the
// data is loaded from an earlier visit; a mere re-activation of a
// preserved instance must not, or every glance at the other tab would
// silently discard whatever the admin had mid-edit in the wizard.
const hasHydratedOnce = ref(false);
onActivated(() => {
  if (!hasHydratedOnce.value || !structureStore.curriculumSetupLoaded) {
    hydrateFromCurriculumSetup();
    hasHydratedOnce.value = true;
  }
});
</script>

<style scoped>
.animation-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
