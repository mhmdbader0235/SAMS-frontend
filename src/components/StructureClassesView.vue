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

    <div class="space-y-4 animation-fade-in">

      <!-- Stats Overview Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div class="theme-card p-3.5 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3">
          <div class="w-9 h-9 rounded bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <GitCommit class="w-4 h-4" />
          </div>
          <div>
            <div class="text-lg font-black text-slate-900">{{ structureStore.liveLevels.length }}</div>
            <div class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Grades</div>
          </div>
        </div>

        <div class="theme-card p-3.5 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3">
          <div class="w-9 h-9 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Network class="w-4 h-4" />
          </div>
          <div>
            <div class="text-lg font-black text-slate-900">{{ structureStore.liveClasses.length }}</div>
            <div class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Class Sections</div>
          </div>
        </div>

        <div class="theme-card p-3.5 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3 cursor-pointer hover:border-indigo-300 transition-colors" @click="router.replace('/manage/placement')">
          <div class="w-9 h-9 rounded bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <GraduationCap class="w-4 h-4" />
          </div>
          <div>
            <div class="text-lg font-black text-slate-900">{{ totalStudentsCount }}</div>
            <div class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Enrolled Students &rarr;</div>
          </div>
        </div>

        <div class="theme-card p-3.5 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3">
          <div class="w-9 h-9 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <UserCheck class="w-4 h-4" />
          </div>
          <div>
            <div class="text-lg font-black text-slate-900">{{ assignedHeadTeachersCount }} / {{ structureStore.liveClasses.length }}</div>
            <div class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Head Teachers Assigned</div>
          </div>
        </div>
      </div>

      <!-- 2-Line Checkbox Grade Filter Navigator (Sorted Ordinally) -->
      <div class="theme-card rounded p-3.5 bg-white border border-slate-200 shadow-xs space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Filter class="w-3.5 h-3.5 text-blue-600" /> Filter by Grade Level:
            </span>
            <span class="text-[11px] text-slate-500 font-medium">
              ({{ selectedGradeIds.length }} of {{ structureStore.liveLevels.length }} Selected)
            </span>
          </div>

          <!-- Select / Deselect All Controls -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="toggleSelectAllGrades"
              class="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <input
                type="checkbox"
                :checked="isAllGradesChecked"
                class="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
              />
              <span>{{ isAllGradesChecked ? 'Deselect All' : 'Select All' }}</span>
            </button>

            <button
              v-if="selectedGradeIds.length > 0 && selectedGradeIds.length < structureStore.liveLevels.length"
              type="button"
              @click="selectedGradeIds = structureStore.liveLevels.map(l => l.level_id)"
              class="text-xs text-blue-600 hover:underline font-semibold"
            >
              Reset Selection
            </button>
          </div>
        </div>

        <!-- 2-Line Responsive Grid (6 Columns per line for Grade 1-6 and Grade 7-12) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-2">
          <label
            v-for="lvl in structureStore.sortedLevelsByOrdinal"
            :key="lvl.level_id"
            class="flex items-center gap-2 p-2 rounded border cursor-pointer transition-all shadow-xs text-xs font-semibold select-none"
            :class="selectedGradeIds.includes(lvl.level_id) ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            <input
              type="checkbox"
              :value="lvl.level_id"
              v-model="selectedGradeIds"
              class="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
            />
            <span class="truncate flex-1 text-[11px]">{{ lvl.name }}</span>
            <span class="px-1.5 py-0.2 rounded text-[10px] shrink-0" :class="selectedGradeIds.includes(lvl.level_id) ? 'bg-blue-200/80 text-blue-800 font-bold' : 'bg-slate-100 text-slate-500'">
              {{ structureStore.getClassesForLevel(lvl.level_id).length }}
            </span>
          </label>
        </div>
      </div>

      <!-- Actions Header (Search + Action Buttons) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div class="flex items-center gap-3">
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search classes or grades..."
              class="w-64 bg-white border border-slate-300 rounded pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
            />
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <span class="text-xs text-slate-500 font-medium">{{ sortedAndFilteredLevels.length }} grades matching</span>
        </div>

        <div class="flex items-center gap-2">
          <button @click="openAddLevelModal" class="px-3.5 py-2 rounded text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs">
            <Plus class="w-3.5 h-3.5" /> Add Grade Level
          </button>
          <button @click="openAddClassModal(null)" class="btn-primary font-bold px-4 py-2 rounded text-xs text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-xs">
            <Plus class="w-3.5 h-3.5" /> Create Class Section
          </button>
        </div>
      </div>

      <!-- Levels & Classes List -->
      <div v-if="structureStore.liveStructureLoading" class="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
        <Loader2 class="w-8 h-8 animate-spin text-blue-600" />
        <span class="text-xs font-medium">Loading school structure & classes...</span>
      </div>

      <div v-else-if="sortedAndFilteredLevels.length === 0" class="theme-card rounded p-12 text-center border border-slate-200 bg-white space-y-4 shadow-xs">
        <div class="w-14 h-14 rounded bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
          <Layers class="w-7 h-7" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900">No Grades Displayed</h3>
          <p class="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Check one or more grade boxes above or clear your search query to view grades and sections.
          </p>
        </div>
        <button @click="selectedGradeIds = structureStore.liveLevels.map(l => l.level_id); searchQuery = ''" class="btn-primary px-4 py-2 rounded text-xs font-bold text-white shadow-xs">
          Select All Grades
        </button>
      </div>

      <!-- Sorted Compact Grades Stack (Ordinally Sorted #1 -> #14) -->
      <div v-else class="space-y-4">
        <div
          v-for="level in sortedAndFilteredLevels"
          :key="level.level_id"
          class="theme-card rounded border border-slate-200 bg-white overflow-hidden shadow-xs transition-all hover:border-slate-300"
        >
          <!-- Level Header Row -->
          <div class="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-emerald-700 text-xs">
                {{ level.ordinal || '#' }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-slate-900 text-sm">{{ level.name }}</h3>
                  <span v-if="level.isced_level !== undefined" class="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    ISCED {{ level.isced_level }}
                  </span>
                  <span v-if="level.age_band_min && level.age_band_max" class="text-[10px] font-medium text-slate-500">
                    ({{ level.age_band_min }}-{{ level.age_band_max }} yrs)
                  </span>
                </div>
                <span class="text-[11px] text-slate-500 block">
                  {{ structureStore.getClassesForLevel(level.level_id).length }} Sections &bull; {{ getStudentsCountForLevel(level.level_id) }} Students Enrolled
                </span>
              </div>
            </div>

            <!-- Level Controls -->
            <div class="flex items-center gap-2">
              <button
                @click="openAddClassModal(level.level_id)"
                :disabled="structureStore.getClassesForLevel(level.level_id).length >= 25"
                class="text-xs font-bold text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                :title="structureStore.getClassesForLevel(level.level_id).length >= 25 ? 'Maximum 25 sections reached' : 'Add class section'"
              >
                <Plus class="w-3.5 h-3.5" /> Add Section
              </button>
              <button
                @click="openEditLevelModal(level)"
                class="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                title="Edit Level"
              >
                <Edit3 class="w-3.5 h-3.5" />
              </button>
              <button
                @click="confirmDeleteLevel(level)"
                class="p-1.5 rounded text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                title="Delete Level"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Compact Class Sections Grid (Sorted Alphabetically A-Z) -->
          <div class="p-4">
            <div v-if="structureStore.getClassesForLevel(level.level_id).length === 0" class="text-center py-5 border border-dashed border-slate-300 rounded text-slate-500 text-xs italic flex flex-col items-center gap-1.5">
              <span>No class sections in {{ level.name }} yet.</span>
              <button @click="openAddClassModal(level.level_id)" class="text-xs text-blue-600 font-bold hover:underline">
                + Create section (e.g. {{ level.name }} - A)
              </button>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div
                v-for="cls in structureStore.getClassesForLevel(level.level_id)"
                :key="cls.id"
                class="p-3.5 bg-white rounded border border-slate-200 flex flex-col justify-between gap-3 hover:border-blue-300 transition-all shadow-xs group"
              >
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h4 class="font-bold text-slate-900 text-xs truncate" :title="cls.name">{{ cls.name }}</h4>
                      <span class="text-[10px] text-slate-400 block">ID: #{{ cls.id }}</span>
                    </div>
                    <div class="flex items-center gap-0.5 shrink-0">
                      <button @click="openEditClassModal(cls)" class="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors" title="Edit Section">
                        <Edit3 class="w-3 h-3" />
                      </button>
                      <button @click="confirmDeleteClass(cls)" class="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors" title="Delete Section">
                        <Trash2 class="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <!-- Head Teacher Selector -->
                  <div class="mt-2.5 pt-2 border-t border-slate-200">
                    <label class="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Head Teacher
                    </label>
                    <select
                      :value="cls.head_teacher_id || ''"
                      @change="handleHeadTeacherChange(cls, $event.target.value)"
                      class="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-600 transition-colors truncate"
                    >
                      <option value="">-- Unassigned --</option>
                      <option v-for="t in structureStore.teachersList" :key="t.id" :value="t.id">
                        {{ t.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Enrolled Students Counter Badge -->
                  <div class="mt-2 flex items-center justify-between text-[11px]">
                    <span class="text-slate-500 font-medium">Students:</span>
                    <span class="font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">
                      {{ cls.student_count || 0 }} Enrolled
                    </span>
                  </div>
                </div>

                <!-- Footer Action: Manage Students Roster -->
                <button
                  @click="openClassRosterModal(cls)"
                  class="w-full py-1.5 px-2.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-blue-300 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 mt-1 shadow-xs"
                >
                  <Users class="w-3 h-3" /> Class Roster ({{ cls.student_count || 0 }})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 1. Class Add / Edit Modal (With Locked Static Grade Prefix & Max 25 Check) -->
    <div v-if="showClassModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div class="theme-card rounded p-6 w-full max-w-lg border border-slate-200 bg-white shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 class="w-5 h-5 text-blue-600" />
            {{ editingClassId ? 'Edit Class Section' : 'Create New Class Section' }}
          </h3>
          <button @click="showClassModal = false" class="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="saveClassForm" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Grade Level</label>
            <select
              v-model="classForm.level_id"
              required
              @change="onModalLevelChange"
              class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
            >
              <option v-for="l in structureStore.sortedLevelsByOrdinal" :key="l.level_id" :value="l.level_id">
                {{ l.name }} ({{ structureStore.getClassesForLevel(l.level_id).length }} / 25 Sections)
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Class Section Identifier</label>
            <div class="flex items-center">
              <span class="bg-slate-100 border border-r-0 border-slate-300 rounded-l px-3 py-2 text-xs font-bold text-slate-700 select-none whitespace-nowrap">
                {{ getSelectedLevelName(classForm.level_id) }} -
              </span>
              <input
                type="text"
                v-model="classForm.section_suffix"
                required
                placeholder="e.g. A, B, 1, 2"
                class="w-full bg-white border border-slate-300 rounded-r px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
              />
            </div>
            <span class="text-[11px] text-slate-500 mt-1 block">The grade name prefix is static; enter the section name/letter (e.g. A-Z).</span>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Head Teacher (Optional)</label>
            <select
              v-model="classForm.head_teacher_id"
              class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
            >
              <option :value="null">-- None / Assign Later --</option>
              <option v-for="t in structureStore.teachersList" :key="t.id" :value="t.id">
                {{ t.name }} ({{ t.email }})
              </option>
            </select>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button type="button" @click="showClassModal = false" class="px-4 py-2 rounded text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" class="btn-primary font-bold px-4 py-2 rounded text-xs text-white transition-all active:scale-95 shadow-xs">
              {{ editingClassId ? 'Update Section' : 'Create Section' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 2. Class Roster & Student Reassignment Modal -->
    <div v-if="showRosterModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div class="theme-card rounded p-6 w-full max-w-2xl border border-slate-200 bg-white shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
        <div class="flex items-center justify-between shrink-0 border-b border-slate-200 pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users class="w-5 h-5 text-blue-600" />
              Class Roster: {{ activeRosterClass?.name }}
            </h3>
            <span class="text-xs text-slate-500 font-medium mt-0.5 block">
              Level: {{ activeRosterClass?.level_name }} &bull; {{ rosterStudents.length }} Students Enrolled
            </span>
          </div>
          <button @click="showRosterModal = false" class="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-3.5 bg-slate-50 rounded border border-slate-200 shrink-0 flex flex-col sm:flex-row items-center gap-3">
          <div class="flex-1 w-full">
            <label class="text-[10px] uppercase font-bold text-slate-600 block mb-1">Transfer / Assign Student into this Class</label>
            <select v-model="selectedStudentToTransfer" class="w-full bg-white border border-slate-300 text-slate-800 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-600 shadow-xs">
              <option :value="null">-- Select Student to Reassign --</option>
              <option v-for="s in eligibleStudentsForTransfer" :key="s.id" :value="s.id">
                {{ s.name }} (Current Class: {{ s.class_name || 'Unassigned' }})
              </option>
            </select>
          </div>
          <button
            @click="transferStudentIntoCurrentClass"
            :disabled="!selectedStudentToTransfer"
            class="btn-primary text-xs px-4 py-2 rounded font-bold text-white shrink-0 disabled:opacity-40 self-stretch sm:self-end shadow-xs"
          >
            Assign to {{ activeRosterClass?.name }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-2 pr-1">
          <div v-if="isRosterLoading" class="py-8 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 class="w-6 h-6 animate-spin text-blue-600" />
            <span class="text-xs">Loading class students...</span>
          </div>

          <div v-else-if="rosterStudents.length === 0" class="text-center py-8 text-slate-400 text-xs italic border border-dashed border-slate-300 rounded">
            No students currently enrolled in this class.
          </div>

          <div
            v-for="st in rosterStudents"
            :key="st.id"
            class="p-3 bg-white rounded border border-slate-200 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-xs shrink-0">
                {{ st.name ? st.name.charAt(0).toUpperCase() : 'S' }}
              </div>
              <div>
                <div class="font-bold text-slate-900 text-xs">{{ st.name }}</div>
                <div class="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>{{ st.email }}</span>
                  <span v-if="st.parent_names" class="text-slate-600">&bull; Parent: {{ st.parent_names }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <select
                :value="activeRosterClass?.id"
                @change="handleQuickReassign(st.id, $event.target.value)"
                class="bg-white border border-slate-300 text-slate-800 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-blue-600 shadow-xs"
                title="Move to another class"
              >
                <option :value="activeRosterClass?.id">{{ activeRosterClass?.name }} (Current)</option>
                <option v-for="c in otherClassesForReassign" :key="c.id" :value="c.id">
                  Move to {{ c.name }}
                </option>
                <option value="none">Unassign from Class</option>
              </select>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 flex justify-end shrink-0">
          <button @click="showRosterModal = false" class="px-4 py-2 rounded text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Close Roster
          </button>
        </div>
      </div>
    </div>

    <!-- 3. Add / Edit Level Modal -->
    <div v-if="showLevelModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div class="theme-card rounded p-6 w-full max-w-md border border-slate-200 bg-white shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitCommit class="w-5 h-5 text-blue-600" />
            {{ editingLevelId ? 'Edit Grade Level' : 'Add New Grade Level' }}
          </h3>
          <button @click="showLevelModal = false" class="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="saveLevelForm" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Grade Level Name</label>
            <input
              type="text"
              v-model="levelForm.name"
              required
              placeholder="e.g. Year 10 or Grade 10"
              class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">ISCED Level (0-3)</label>
              <input
                type="number"
                v-model="levelForm.isced_level"
                min="0"
                max="5"
                class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Ordinal</label>
              <input
                type="number"
                v-model="levelForm.ordinal"
                min="1"
                class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Min Age</label>
              <input
                type="number"
                v-model="levelForm.age_band_min"
                min="3"
                class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
              />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Max Age</label>
              <input
                type="number"
                v-model="levelForm.age_band_max"
                min="4"
                class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button type="button" @click="showLevelModal = false" class="px-4 py-2 rounded text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" class="btn-primary font-bold px-4 py-2 rounded text-xs text-white transition-all active:scale-95 shadow-xs">
              {{ editingLevelId ? 'Update Level' : 'Create Level' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  GitCommit, Network, GraduationCap, UserCheck, Filter, Search, Plus, Loader2,
  Layers, Edit3, Trash2, Users, Building2, X, CheckCircle, AlertCircle
} from 'lucide-vue-next';
import {
  apiCreateClass, apiUpdateClass, apiDeleteClass, apiGetClassStudents,
  apiReassignStudentClass, apiCreateLevel, apiUpdateLevel, apiDeleteLevel
} from '../api';
import { useStructureStore } from '../store';

const router = useRouter();
const structureStore = useStructureStore();
structureStore.ensureLiveStructureLoaded();

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

const searchQuery = ref('');

// Multi-Grade Filter with Checkboxes
const selectedGradeIds = ref([]);

// 25 letters sequence for up to 25 sections (A to Y)
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, 25);

// Modals State
const showClassModal = ref(false);
const editingClassId = ref(null);
const classForm = ref({ name: '', section_suffix: 'A', level_id: null, head_teacher_id: null, capacity: 50 });

const showLevelModal = ref(false);
const editingLevelId = ref(null);
const levelForm = ref({ name: '', isced_level: 1, age_band_min: 6, age_band_max: 7, ordinal: 1, is_active: true });

const showRosterModal = ref(false);
const isRosterLoading = ref(false);
const activeRosterClass = ref(null);
const rosterStudents = ref([]);
const selectedStudentToTransfer = ref(null);

const isAllGradesChecked = computed(() => {
  return structureStore.liveLevels.length > 0 && selectedGradeIds.value.length === structureStore.liveLevels.length;
});

const toggleSelectAllGrades = () => {
  if (isAllGradesChecked.value) {
    selectedGradeIds.value = [];
  } else {
    selectedGradeIds.value = structureStore.liveLevels.map(l => l.level_id);
  }
};

// Natural grade ranking for the search-filtered local sort below.
// (The store keeps its own copy for sortedLevelsByOrdinal — duplicated rather
// than exported, since this is a small stable helper, not shared state.)
const getGradeRank = (lvl) => {
  const name = (lvl.name || '').trim().toLowerCase();

  if (name.includes('nursery') || name.includes('pre-k') || name.includes('kg 1') || name.includes('kg1') || name.includes('early years')) return 0;
  if (name.includes('kindergarten') || name.includes('kg 2') || name.includes('kg2') || name.includes('reception') || name === 'kg') return 0.5;

  const match = name.match(/(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  if (lvl.ordinal && typeof lvl.ordinal === 'number') return lvl.ordinal;
  return 999;
};

const compareGrades = (a, b) => {
  const rankA = getGradeRank(a);
  const rankB = getGradeRank(b);
  if (rankA !== rankB) {
    return rankA - rankB;
  }
  return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' });
};

const sortedAndFilteredLevels = computed(() => {
  const activeSet = new Set(selectedGradeIds.value);
  let list = structureStore.liveLevels.filter(l => activeSet.has(l.level_id));

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(l => {
      const matchName = (l.name || '').toLowerCase().includes(q);
      const hasMatchingClass = structureStore.getClassesForLevel(l.level_id).some(c => (c.name || '').toLowerCase().includes(q));
      return matchName || hasMatchingClass;
    });
  }

  return [...list].sort(compareGrades);
});

const getStudentsCountForLevel = (levelId) => {
  const classes = structureStore.getClassesForLevel(levelId);
  return classes.reduce((sum, c) => sum + (c.student_count || 0), 0);
};

const totalStudentsCount = computed(() => {
  return structureStore.liveClasses.reduce((sum, c) => sum + (c.student_count || 0), 0);
});

const assignedHeadTeachersCount = computed(() => {
  return structureStore.liveClasses.filter(c => !!c.head_teacher_id).length;
});

const getSelectedLevelName = (levelId) => {
  const lvl = structureStore.liveLevels.find(l => l.level_id === levelId);
  return lvl ? lvl.name : 'Grade';
};

const onModalLevelChange = () => {
  const existing = structureStore.getClassesForLevel(classForm.value.level_id);
  if (!editingClassId.value) {
    classForm.value.section_suffix = letters[existing.length] || `${existing.length + 1}`;
  }
};

// Head Teacher Direct Assignment
const handleHeadTeacherChange = async (cls, newTeacherId) => {
  try {
    const teacherIdParsed = newTeacherId ? parseInt(newTeacherId) : null;
    await apiUpdateClass(cls.id, {
      name: cls.name,
      level_id: cls.level_id,
      head_teacher_id: teacherIdParsed,
      capacity: cls.capacity || 1000
    });
    cls.head_teacher_id = teacherIdParsed;
    const matchedTeacher = structureStore.teachersList.find(t => t.id === teacherIdParsed);
    cls.teacher_name = matchedTeacher ? matchedTeacher.name : null;
    setSuccess(`Assigned ${matchedTeacher ? matchedTeacher.name : 'No one'} as Head Teacher for ${cls.name}`);
  } catch (err) {
    setError(err.message || 'Failed to update Head Teacher');
  }
};

// Class CRUD (Enforces static Grade Name prefix + Max 25 sections)
const openAddClassModal = (levelId = null) => {
  editingClassId.value = null;
  const defaultLevel = levelId || (structureStore.liveLevels[0] ? structureStore.liveLevels[0].level_id : null);
  const existingInLevel = structureStore.getClassesForLevel(defaultLevel);
  if (existingInLevel.length >= 25) {
    setError(`This grade level already has the maximum of 25 sections.`);
    return;
  }
  const nextSuffix = letters[existingInLevel.length] || `${existingInLevel.length + 1}`;
  classForm.value = {
    name: '',
    section_suffix: nextSuffix,
    level_id: defaultLevel,
    head_teacher_id: null,
    capacity: 1000
  };
  showClassModal.value = true;
};

const openEditClassModal = (cls) => {
  editingClassId.value = cls.id;
  const lvlName = getSelectedLevelName(cls.level_id);
  let suffix = cls.name;
  if (cls.name.startsWith(lvlName)) {
    suffix = cls.name.replace(new RegExp(`^${lvlName}\\s*-\\s*`), '').trim();
  }
  classForm.value = {
    name: cls.name,
    section_suffix: suffix,
    level_id: cls.level_id,
    head_teacher_id: cls.head_teacher_id || null,
    capacity: cls.capacity || 1000
  };
  showClassModal.value = true;
};

const saveClassForm = async () => {
  try {
    const lvlName = getSelectedLevelName(classForm.value.level_id);
    const suffix = (classForm.value.section_suffix || '').trim();
    const finalName = suffix ? `${lvlName} - ${suffix}` : lvlName;

    const payload = {
      name: finalName,
      level_id: classForm.value.level_id,
      head_teacher_id: classForm.value.head_teacher_id,
      capacity: 1000 // Unrestricted capacity
    };

    if (editingClassId.value) {
      await apiUpdateClass(editingClassId.value, payload);
      setSuccess(`Updated class section ${finalName} successfully.`);
    } else {
      const existingInLevel = structureStore.getClassesForLevel(classForm.value.level_id);
      if (existingInLevel.length >= 25) {
        throw new Error(`Maximum 25 class sections reached for ${lvlName}`);
      }
      await apiCreateClass(payload);
      setSuccess(`Created new class section ${finalName}.`);
    }
    showClassModal.value = false;
    await structureStore.reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to save class section');
  }
};

const confirmDeleteClass = async (cls) => {
  if (!confirm(`Are you sure you want to delete class section ${cls.name}? Any enrolled students will be unassigned.`)) return;
  try {
    await apiDeleteClass(cls.id);
    setSuccess(`Deleted class section ${cls.name}.`);
    await structureStore.reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to delete class');
  }
};

// Level CRUD
const openAddLevelModal = () => {
  editingLevelId.value = null;
  const nextOrdinal = structureStore.liveLevels.length + 1;
  levelForm.value = { name: `Grade ${nextOrdinal}`, isced_level: 1, age_band_min: 5 + nextOrdinal, age_band_max: 6 + nextOrdinal, ordinal: nextOrdinal, is_active: true };
  showLevelModal.value = true;
};

const openEditLevelModal = (lvl) => {
  editingLevelId.value = lvl.level_id;
  levelForm.value = {
    name: lvl.name,
    isced_level: lvl.isced_level !== undefined ? lvl.isced_level : 1,
    age_band_min: lvl.age_band_min || 6,
    age_band_max: lvl.age_band_max || 7,
    ordinal: lvl.ordinal || 1,
    is_active: lvl.is_active !== undefined ? lvl.is_active : true
  };
  showLevelModal.value = true;
};

const saveLevelForm = async () => {
  try {
    if (editingLevelId.value) {
      await apiUpdateLevel(editingLevelId.value, levelForm.value);
      setSuccess(`Updated grade level ${levelForm.value.name}.`);
    } else {
      await apiCreateLevel(levelForm.value);
      setSuccess(`Created grade level ${levelForm.value.name}.`);
    }
    showLevelModal.value = false;
    await structureStore.reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to save level');
  }
};

const confirmDeleteLevel = async (lvl) => {
  if (!confirm(`Are you sure you want to delete ${lvl.name} and all its class sections?`)) return;
  try {
    await apiDeleteLevel(lvl.level_id);
    setSuccess(`Deleted grade level ${lvl.name}.`);
    await structureStore.reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to delete level');
  }
};

// Roster Modal Management
const openClassRosterModal = async (cls) => {
  activeRosterClass.value = cls;
  showRosterModal.value = true;
  isRosterLoading.value = true;
  try {
    rosterStudents.value = await apiGetClassStudents(cls.id);
  } catch (err) {
    console.error('Failed to load roster:', err);
    rosterStudents.value = [];
  } finally {
    isRosterLoading.value = false;
  }
};

const eligibleStudentsForTransfer = computed(() => {
  if (!activeRosterClass.value) return [];
  const currentIds = new Set(rosterStudents.value.map(s => s.id));
  return structureStore.allStudentsList.filter(s => !currentIds.has(s.id));
});

const otherClassesForReassign = computed(() => {
  if (!activeRosterClass.value) return [];
  return structureStore.liveClasses.filter(c => c.id !== activeRosterClass.value.id);
});

const transferStudentIntoCurrentClass = async () => {
  if (!selectedStudentToTransfer.value || !activeRosterClass.value) return;
  try {
    await apiReassignStudentClass(selectedStudentToTransfer.value, activeRosterClass.value.id);
    setSuccess('Student assigned to class successfully!');
    selectedStudentToTransfer.value = null;
    rosterStudents.value = await apiGetClassStudents(activeRosterClass.value.id);
    await structureStore.reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to assign student');
  }
};

const handleQuickReassign = async (studentId, targetClassVal) => {
  try {
    const targetClassId = targetClassVal === 'none' ? null : parseInt(targetClassVal);
    await apiReassignStudentClass(studentId, targetClassId);
    setSuccess('Student class updated.');
    if (activeRosterClass.value) {
      rosterStudents.value = await apiGetClassStudents(activeRosterClass.value.id);
    }
    await structureStore.reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to reassign student');
  }
};
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
