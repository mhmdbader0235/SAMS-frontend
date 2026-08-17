<template>
  <div class="min-h-screen pb-32 space-y-6 max-w-7xl mx-auto">
    
    <!-- Top Header & Domain Section Switcher -->
    <div class="theme-card rounded p-6 shadow-xs border border-slate-200 bg-white relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div class="flex items-center gap-4 relative z-10">
        <div class="w-12 h-12 rounded bg-blue-50 border border-blue-200 flex items-center justify-center relative z-10 shrink-0">
          <Layers class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-slate-900 tracking-tight">Academic Administration Hub</h2>
            <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {{ currentSystemName }} Standard
            </span>
          </div>
          <p class="text-xs text-slate-500 font-medium mt-1">Manage school grades, class sections (up to 25 per grade), student placements, and curriculum ladder</p>
        </div>
      </div>

      <!-- Main Domain Tabs Switcher -->
      <div class="flex items-center p-1 bg-slate-100 rounded border border-slate-200 relative z-10 self-start lg:self-auto flex-wrap gap-1">
        <button 
          @click="switchTab('manage')"
          class="px-3.5 py-2 rounded text-xs font-bold transition-all flex items-center gap-2"
          :class="activeMainTab === 'manage' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
        >
          <Building2 class="w-4 h-4 text-blue-600" /> Live Structure & Classes
        </button>
        <button 
          @click="switchTab('enrollment')"
          class="px-3.5 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 relative"
          :class="activeMainTab === 'enrollment' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
        >
          <UserPlus class="w-4 h-4 text-indigo-600" /> Student Class Placement
          <span v-if="unassignedStudentsCount > 0" class="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-400 text-slate-950 ml-1">
            {{ unassignedStudentsCount }}
          </span>
        </button>
        <button 
          @click="switchTab('setup')"
          class="px-3.5 py-2 rounded text-xs font-bold transition-all flex items-center gap-2"
          :class="activeMainTab === 'setup' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
        >
          <Sliders class="w-4 h-4 text-sky-600" /> Setup & Ladder Wizard
        </button>
      </div>
    </div>

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

    <!-- ========================================================================= -->
    <!-- DOMAIN SECTION 1: LIVE STRUCTURE & CLASSES MANAGER -->
    <!-- ========================================================================= -->
    <div v-if="activeMainTab === 'manage'" class="space-y-4 animation-fade-in">
      
      <!-- Stats Overview Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div class="theme-card p-3.5 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3">
          <div class="w-9 h-9 rounded bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <GitCommit class="w-4 h-4" />
          </div>
          <div>
            <div class="text-lg font-black text-slate-900">{{ liveLevels.length }}</div>
            <div class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Grades</div>
          </div>
        </div>

        <div class="theme-card p-3.5 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3">
          <div class="w-9 h-9 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Network class="w-4 h-4" />
          </div>
          <div>
            <div class="text-lg font-black text-slate-900">{{ liveClasses.length }}</div>
            <div class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Class Sections</div>
          </div>
        </div>

        <div class="theme-card p-3.5 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3 cursor-pointer hover:border-indigo-300 transition-colors" @click="switchTab('enrollment')">
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
            <div class="text-lg font-black text-slate-900">{{ assignedHeadTeachersCount }} / {{ liveClasses.length }}</div>
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
              ({{ selectedGradeIds.length }} of {{ liveLevels.length }} Selected)
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
              v-if="selectedGradeIds.length > 0 && selectedGradeIds.length < liveLevels.length"
              type="button"
              @click="selectedGradeIds = liveLevels.map(l => l.level_id)"
              class="text-xs text-blue-600 hover:underline font-semibold"
            >
              Reset Selection
            </button>
          </div>
        </div>

        <!-- 2-Line Responsive Grid (6 Columns per line for Grade 1-6 and Grade 7-12) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-2">
          <label 
            v-for="lvl in sortedLevelsByOrdinal" 
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
              {{ getClassesForLevel(lvl.level_id).length }}
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
      <div v-if="isLoading" class="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
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
        <button @click="selectedGradeIds = liveLevels.map(l => l.level_id); searchQuery = ''" class="btn-primary px-4 py-2 rounded text-xs font-bold text-white shadow-xs">
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
                  {{ getClassesForLevel(level.level_id).length }} Sections &bull; {{ getStudentsCountForLevel(level.level_id) }} Students Enrolled
                </span>
              </div>
            </div>

            <!-- Level Controls -->
            <div class="flex items-center gap-2">
              <button 
                @click="openAddClassModal(level.level_id)" 
                :disabled="getClassesForLevel(level.level_id).length >= 25"
                class="text-xs font-bold text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                :title="getClassesForLevel(level.level_id).length >= 25 ? 'Maximum 25 sections reached' : 'Add class section'"
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
            <div v-if="getClassesForLevel(level.level_id).length === 0" class="text-center py-5 border border-dashed border-slate-300 rounded text-slate-500 text-xs italic flex flex-col items-center gap-1.5">
              <span>No class sections in {{ level.name }} yet.</span>
              <button @click="openAddClassModal(level.level_id)" class="text-xs text-blue-600 font-bold hover:underline">
                + Create section (e.g. {{ level.name }} - A)
              </button>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div 
                v-for="cls in getClassesForLevel(level.level_id)" 
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
                      <option v-for="t in teachersList" :key="t.id" :value="t.id">
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

    <!-- ========================================================================= -->
    <!-- DOMAIN SECTION 2: STUDENT CLASS ENROLLMENT & PLACEMENT MANAGER -->
    <!-- ========================================================================= -->
    <div v-if="activeMainTab === 'enrollment'" class="space-y-6 animation-fade-in">
      
      <!-- Enrollment KPI Dashboard -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="theme-card p-4 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3.5">
          <div class="w-10 h-10 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <GraduationCap class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xl font-black text-slate-900">{{ allStudentsList.length }}</div>
            <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Total Registered Students</div>
          </div>
        </div>

        <div class="theme-card p-4 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3.5">
          <div class="w-10 h-10 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckSquare class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xl font-black text-slate-900">{{ assignedStudentsCount }}</div>
            <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Placed in Classes</div>
          </div>
        </div>

        <div class="theme-card p-4 rounded border border-slate-200 bg-white shadow-xs flex items-center gap-3.5" :class="{'ring-1 ring-amber-400 bg-amber-50/40': unassignedStudentsCount > 0}">
          <div class="w-10 h-10 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertCircle class="w-5 h-5" />
          </div>
          <div>
            <div class="text-xl font-black text-slate-900">{{ unassignedStudentsCount }}</div>
            <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Unassigned Students</div>
          </div>
        </div>
      </div>

      <!-- Filters & Multi-Enrollment Search Controls -->
      <div class="theme-card p-4 rounded border border-slate-200 bg-white shadow-xs space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <!-- Search & Status Pills -->
          <div class="flex flex-wrap items-center gap-3 flex-1">
            <div class="relative w-full sm:w-72">
              <input 
                type="text" 
                v-model="enrollSearchQuery" 
                placeholder="Search by student, email, parent..." 
                class="w-full bg-white border border-slate-300 rounded pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
              />
              <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <!-- Filter Status Badges -->
            <div class="flex items-center p-1 bg-slate-100 rounded border border-slate-200 text-xs font-semibold">
              <button 
                @click="enrollStatusFilter = 'all'"
                class="px-3 py-1.5 rounded transition-all font-bold"
                :class="enrollStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
              >
                All ({{ allStudentsList.length }})
              </button>
              <button 
                @click="enrollStatusFilter = 'unassigned'"
                class="px-3 py-1.5 rounded transition-all flex items-center gap-1.5 font-bold"
                :class="enrollStatusFilter === 'unassigned' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-amber-700 hover:text-amber-900'"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500" v-if="enrollStatusFilter !== 'unassigned'"></span>
                Unassigned ({{ unassignedStudentsCount }})
              </button>
              <button 
                @click="enrollStatusFilter = 'assigned'"
                class="px-3 py-1.5 rounded transition-all font-bold"
                :class="enrollStatusFilter === 'assigned' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'text-emerald-700 hover:text-emerald-900'"
              >
                Enrolled ({{ assignedStudentsCount }})
              </button>
            </div>

            <!-- Grade Level Filter -->
            <select 
              v-model="enrollLevelFilter"
              class="bg-white border border-slate-300 text-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600 shadow-xs"
            >
              <option value="all">All Grade Levels</option>
              <option v-for="lvl in sortedLevelsByOrdinal" :key="lvl.level_id" :value="lvl.level_id">
                {{ lvl.name }}
              </option>
            </select>
          </div>

          <!-- Select All / Unassigned Helper & CSV Export -->
          <div class="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button 
              @click="toggleSelectAllUnassigned" 
              class="px-3 py-2 rounded text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-xs"
            >
              {{ areAllUnassignedSelected ? 'Deselect Unassigned' : 'Select All Unassigned' }}
            </button>

            <!-- Export Filtered Students to CSV -->
            <button 
              @click="exportFilteredStudentsCSV"
              class="px-3.5 py-2 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
              :title="`Export ${filteredStudentsList.length} filtered students to CSV`"
            >
              <Download class="w-3.5 h-3.5" />
              <span>Export CSV ({{ filteredStudentsList.length }})</span>
            </button>

            <span class="text-xs text-slate-500 font-medium">{{ filteredStudentsList.length }} students listed</span>
          </div>
        </div>

        <!-- Floating Multi-Student Bulk Action Bar -->
        <transition name="fade">
          <div v-if="selectedStudentIds.length > 0" class="p-4 bg-indigo-50 border border-indigo-200 rounded flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {{ selectedStudentIds.length }}
              </div>
              <div>
                <div class="font-bold text-slate-900 text-xs">{{ selectedStudentIds.length }} Students Selected</div>
                <div class="text-[11px] text-slate-600">Choose a class section below to place all selected students in 1 click.</div>
              </div>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <select 
                v-model="targetBulkClassId" 
                class="bg-white border border-slate-300 text-slate-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 flex-1 sm:w-60 font-medium shadow-xs"
              >
                <option :value="null">-- Choose Target Class Section --</option>
                <optgroup v-for="lvl in sortedLevelsByOrdinal" :key="lvl.level_id" :label="lvl.name">
                  <option v-for="c in getClassesForLevel(lvl.level_id)" :key="c.id" :value="c.id">
                    {{ c.name }} ({{ c.student_count || 0 }} seats occupied)
                  </option>
                </optgroup>
              </select>

              <button 
                @click="executeBulkEnroll" 
                :disabled="!targetBulkClassId || isBulkSubmitting"
                class="btn-primary text-xs px-4 py-2 rounded font-bold text-white transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <Loader2 v-if="isBulkSubmitting" class="w-3.5 h-3.5 animate-spin" />
                <UserCheck v-else class="w-3.5 h-3.5" />
                Enroll Selected ({{ selectedStudentIds.length }})
              </button>

              <button 
                @click="selectedStudentIds = []" 
                class="p-2 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-200 transition-colors" 
                title="Clear Selection"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- Students Placement Directory Table -->
      <div class="theme-card rounded border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200 font-bold">
                <th class="p-3.5 w-12 text-center">
                  <input 
                    type="checkbox" 
                    :checked="isAllVisibleSelected" 
                    @change="toggleSelectAllVisible"
                    class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                  />
                </th>
                <th class="p-3.5 font-bold">Student Name & Info</th>
                <th class="p-3.5 font-bold">Linked Parent / Contact</th>
                <th class="p-3.5 font-bold">Current Class Status</th>
                <th class="p-3.5 font-bold w-72">Class Section Assignment</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-if="filteredStudentsList.length === 0">
                <td colspan="5" class="py-12 text-center text-slate-500 text-xs italic">
                  No students found matching current filters.
                </td>
              </tr>

              <tr 
                v-for="st in filteredStudentsList" 
                :key="st.id" 
                class="transition-colors hover:bg-slate-50/80"
                :class="{'bg-indigo-50/40': selectedStudentIds.includes(st.id)}"
              >
                <!-- Checkbox -->
                <td class="p-3.5 text-center">
                  <input 
                    type="checkbox" 
                    :value="st.id" 
                    v-model="selectedStudentIds" 
                    class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                  />
                </td>

                <!-- Student Info -->
                <td class="p-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                      :class="st.class_id ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-amber-50 text-amber-700 border border-amber-300'">
                      {{ st.name ? st.name.charAt(0).toUpperCase() : 'S' }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900 text-xs">{{ st.name }}</div>
                      <div class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>{{ st.email }}</span>
                        <span v-if="st.gender" class="text-slate-600 uppercase text-[9px] px-1.5 py-0.2 rounded bg-slate-100 font-bold border border-slate-200">{{ st.gender }}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Parent Info -->
                <td class="p-3.5">
                  <div v-if="st.parent_names" class="text-xs">
                    <span class="font-semibold text-slate-800 block">{{ st.parent_names }}</span>
                    <span class="text-[11px] text-slate-500">{{ st.parent_emails || 'No email' }}</span>
                  </div>
                  <span v-else class="text-[11px] text-slate-400 italic">No parent linked</span>
                </td>

                <!-- Current Class Badge -->
                <td class="p-3.5">
                  <div v-if="st.class_id" class="flex items-center gap-1.5">
                    <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle class="w-3 h-3" /> {{ st.class_name || 'Enrolled' }}
                    </span>
                  </div>
                  <div v-else>
                    <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 flex items-center gap-1">
                      <AlertCircle class="w-3 h-3" /> Unassigned
                    </span>
                  </div>
                </td>

                <!-- Direct Instant Class Selector -->
                <td class="p-3.5">
                  <div class="flex items-center gap-2">
                    <select 
                      :value="st.class_id || ''" 
                      @change="handleSingleStudentPlacement(st, $event.target.value)"
                      class="w-full bg-white border border-slate-300 text-slate-800 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
                      :class="{'border-amber-400 bg-amber-50/20': !st.class_id}"
                    >
                      <option value="">-- No Class (Unassigned) --</option>
                      <optgroup v-for="lvl in sortedLevelsByOrdinal" :key="lvl.level_id" :label="lvl.name">
                        <option v-for="c in getClassesForLevel(lvl.level_id)" :key="c.id" :value="c.id">
                          {{ c.name }} ({{ c.student_count || 0 }} seats occupied)
                        </option>
                      </optgroup>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- DOMAIN SECTION 3: SETUP WIZARD & GRADE LADDER BUILDER -->
    <!-- ========================================================================= -->
    <div v-if="activeMainTab === 'setup'" class="space-y-6 animation-fade-in">
      
      <!-- Stepper Header -->
      <div class="flex items-center justify-between theme-card rounded p-3 shadow-xs border border-slate-200 bg-white">
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

        <!-- 3 Core System Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            v-for="sys in systems" 
            :key="sys.id" 
            @click="selectSystem(sys.id)"
            class="p-5 rounded border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-4 group shadow-xs"
            :class="structureState.system === sys.id ? 'bg-blue-50/50 border-2 border-blue-600' : 'bg-white border-slate-200 hover:border-blue-300'"
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

      <!-- Setup Footer Actions Bar -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-lg">
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

    <!-- ========================================================================= -->
    <!-- MODALS (ADD/EDIT CLASS, ROSTER, ADD/EDIT LEVEL, BULK ADD) -->
    <!-- ========================================================================= -->
    
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
              <option v-for="l in sortedLevelsByOrdinal" :key="l.level_id" :value="l.level_id">
                {{ l.name }} ({{ getClassesForLevel(l.level_id).length }} / 25 Sections)
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
              <option v-for="t in teachersList" :key="t.id" :value="t.id">
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

    <!-- 4. Bulk Add Sections Modal (A–Z up to 25) -->
    <div v-if="showBulkModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div class="theme-card rounded p-6 w-full max-w-md border border-slate-200 bg-white shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <CopyPlus class="w-5 h-5 text-blue-600" />
            Bulk Generate Sections (A–Z)
          </h3>
          <button @click="showBulkModal = false" class="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Target ISCED Levels</label>
            <div class="flex gap-2">
              <label v-for="isc in [0, 1, 2, 3]" :key="isc" class="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-300 text-xs font-bold cursor-pointer transition-colors"
                :class="bulkForm.targetIsced.includes(isc) ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white text-slate-700 hover:bg-slate-50'">
                <input type="checkbox" :value="isc" v-model="bulkForm.targetIsced" class="hidden" />
                ISCED {{ isc }}
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Sections per Grade (1 to 25 Max)</label>
            <input type="number" v-model="bulkForm.count" min="1" max="25" class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors shadow-xs font-bold" />
            <span class="text-[11px] text-slate-500 mt-1 block">Automatically creates sections named A, B, C... up to {{ letters[Math.min(24, Math.max(0, (bulkForm.count || 1) - 1))] }}</span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button @click="showBulkModal = false" class="px-4 py-2 rounded text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button @click="executeBulkAdd" class="btn-primary font-bold px-4 py-2 rounded text-xs text-white transition-all active:scale-95 shadow-xs">Generate Sections</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Layers, Globe, GitCommit, Network, CalendarDays, ArrowRight, Save,
  CheckCircle, AlertCircle, ChevronDown, Plus, Trash2, Calendar, CopyPlus, Loader2,
  Edit3, RotateCcw, Building2, Sliders, Users, GraduationCap, UserCheck, Search, X, Eye,
  UserPlus, CheckSquare, Square, Download, Filter
} from 'lucide-vue-next';
import { 
  apiSaveStructureSetup, apiGetStructureSetup, apiLoadLevels, apiLoadClasses,
  apiCreateClass, apiUpdateClass, apiDeleteClass, apiGetClassStudents,
  apiReassignStudentClass, apiBulkAssignStudents, apiCreateLevel, apiUpdateLevel, apiDeleteLevel,
  apiLoadTeachers, apiLoadStudents
} from '../api';

const route = useRoute();
const router = useRouter();

// Main Domain Tabs: 'manage' (Live Structure) | 'enrollment' (Student Placement) | 'setup' (Wizard & Ladder)
const activeMainTab = ref('manage');

const switchTab = (tabName) => {
  activeMainTab.value = tabName;
  if (tabName === 'manage') {
    router.replace({ path: '/manage/structure' }).catch(() => {});
  } else if (tabName === 'enrollment') {
    router.replace({ path: '/manage/placement' }).catch(() => {});
  } else if (tabName === 'setup') {
    router.replace({ path: '/manage/ladder-wizard' }).catch(() => {});
  }
};

const isLoading = ref(true);
const isSaving = ref(false);
const successMsg = ref(null);
const errorMsg = ref(null);
const searchQuery = ref('');

// Multi-Grade Filter with Checkboxes
const selectedGradeIds = ref([]);

const setSuccess = (msg) => {
  successMsg.value = msg;
  setTimeout(() => { successMsg.value = null; }, 5000);
};

const setError = (msg) => {
  errorMsg.value = msg;
  setTimeout(() => { errorMsg.value = null; }, 5000);
};

// 25 letters sequence for up to 25 sections (A to Y)
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, 25);

// =============================================================================
// DOMAIN 1 STATE: LIVE STRUCTURE & CLASSES
// =============================================================================
const liveLevels = ref([]);
const liveClasses = ref([]);
const teachersList = ref([]);
const allStudentsList = ref([]);

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
  return liveLevels.value.length > 0 && selectedGradeIds.value.length === liveLevels.value.length;
});

const toggleSelectAllGrades = () => {
  if (isAllGradesChecked.value) {
    selectedGradeIds.value = [];
  } else {
    selectedGradeIds.value = liveLevels.value.map(l => l.level_id);
  }
};

const getGradeRank = (lvl) => {
  const name = (lvl.name || '').trim().toLowerCase();
  
  // Early years / Kindergarten / Reception
  if (name.includes('nursery') || name.includes('pre-k') || name.includes('kg 1') || name.includes('kg1') || name.includes('early years')) return 0;
  if (name.includes('kindergarten') || name.includes('kg 2') || name.includes('kg2') || name.includes('reception') || name === 'kg') return 0.5;
  
  // Extract numerical value (e.g. "Grade 1" -> 1, "Grade 10" -> 10, "Grade 12" -> 12)
  const match = name.match(/(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  // Fallback to ordinal if available
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

const sortedLevelsByOrdinal = computed(() => {
  return [...liveLevels.value].sort(compareGrades);
});

const sortedAndFilteredLevels = computed(() => {
  const activeSet = new Set(selectedGradeIds.value);
  let list = liveLevels.value.filter(l => activeSet.has(l.level_id));

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(l => {
      const matchName = (l.name || '').toLowerCase().includes(q);
      const hasMatchingClass = getClassesForLevel(l.level_id).some(c => (c.name || '').toLowerCase().includes(q));
      return matchName || hasMatchingClass;
    });
  }

  // Strict sorted order Grade 1 -> Grade 12
  return [...list].sort(compareGrades);
});

const getClassesForLevel = (levelId) => {
  const classes = liveClasses.value.filter(c => c.level_id === levelId);
  return classes.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' }));
};

const getStudentsCountForLevel = (levelId) => {
  const classes = getClassesForLevel(levelId);
  return classes.reduce((sum, c) => sum + (c.student_count || 0), 0);
};

const totalStudentsCount = computed(() => {
  return liveClasses.value.reduce((sum, c) => sum + (c.student_count || 0), 0);
});

const assignedHeadTeachersCount = computed(() => {
  return liveClasses.value.filter(c => !!c.head_teacher_id).length;
});

const getSelectedLevelName = (levelId) => {
  const lvl = liveLevels.value.find(l => l.level_id === levelId);
  return lvl ? lvl.name : 'Grade';
};

const onModalLevelChange = () => {
  const existing = getClassesForLevel(classForm.value.level_id);
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
    const matchedTeacher = teachersList.value.find(t => t.id === teacherIdParsed);
    cls.teacher_name = matchedTeacher ? matchedTeacher.name : null;
    setSuccess(`Assigned ${matchedTeacher ? matchedTeacher.name : 'No one'} as Head Teacher for ${cls.name}`);
  } catch (err) {
    setError(err.message || 'Failed to update Head Teacher');
  }
};

// Class CRUD (Enforces static Grade Name prefix + Max 25 sections)
const openAddClassModal = (levelId = null) => {
  editingClassId.value = null;
  const defaultLevel = levelId || (liveLevels.value[0] ? liveLevels.value[0].level_id : null);
  const existingInLevel = getClassesForLevel(defaultLevel);
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
      const existingInLevel = getClassesForLevel(classForm.value.level_id);
      if (existingInLevel.length >= 25) {
        throw new Error(`Maximum 25 class sections reached for ${lvlName}`);
      }
      await apiCreateClass(payload);
      setSuccess(`Created new class section ${finalName}.`);
    }
    showClassModal.value = false;
    await reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to save class section');
  }
};

const confirmDeleteClass = async (cls) => {
  if (!confirm(`Are you sure you want to delete class section ${cls.name}? Any enrolled students will be unassigned.`)) return;
  try {
    await apiDeleteClass(cls.id);
    setSuccess(`Deleted class section ${cls.name}.`);
    await reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to delete class');
  }
};

// Level CRUD
const openAddLevelModal = () => {
  editingLevelId.value = null;
  const nextOrdinal = liveLevels.value.length + 1;
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
    await reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to save level');
  }
};

const confirmDeleteLevel = async (lvl) => {
  if (!confirm(`Are you sure you want to delete ${lvl.name} and all its class sections?`)) return;
  try {
    await apiDeleteLevel(lvl.level_id);
    setSuccess(`Deleted grade level ${lvl.name}.`);
    await reloadLiveStructure();
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
  return allStudentsList.value.filter(s => !currentIds.has(s.id));
});

const otherClassesForReassign = computed(() => {
  if (!activeRosterClass.value) return [];
  return liveClasses.value.filter(c => c.id !== activeRosterClass.value.id);
});

const transferStudentIntoCurrentClass = async () => {
  if (!selectedStudentToTransfer.value || !activeRosterClass.value) return;
  try {
    await apiReassignStudentClass(selectedStudentToTransfer.value, activeRosterClass.value.id);
    setSuccess('Student assigned to class successfully!');
    selectedStudentToTransfer.value = null;
    rosterStudents.value = await apiGetClassStudents(activeRosterClass.value.id);
    await reloadLiveStructure();
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
    await reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to reassign student');
  }
};

// =============================================================================
// DOMAIN 2 STATE: STUDENT CLASS ENROLLMENT & PLACEMENT
// =============================================================================
const enrollSearchQuery = ref('');
const enrollStatusFilter = ref('all');
const enrollLevelFilter = ref('all');
const selectedStudentIds = ref([]);
const targetBulkClassId = ref(null);
const isBulkSubmitting = ref(false);

const assignedStudentsCount = computed(() => {
  return allStudentsList.value.filter(s => !!s.class_id).length;
});

const unassignedStudentsCount = computed(() => {
  return allStudentsList.value.filter(s => !s.class_id).length;
});

const filteredStudentsList = computed(() => {
  let list = allStudentsList.value;

  if (enrollStatusFilter.value === 'unassigned') {
    list = list.filter(s => !s.class_id);
  } else if (enrollStatusFilter.value === 'assigned') {
    list = list.filter(s => !!s.class_id);
  }

  if (enrollLevelFilter.value !== 'all') {
    const targetLevelId = parseInt(enrollLevelFilter.value);
    const classesInLevel = new Set(liveClasses.value.filter(c => c.level_id === targetLevelId).map(c => c.id));
    list = list.filter(s => s.class_id && classesInLevel.has(s.class_id));
  }

  if (enrollSearchQuery.value.trim()) {
    const q = enrollSearchQuery.value.toLowerCase();
    list = list.filter(s => {
      const matchName = (s.name || '').toLowerCase().includes(q);
      const matchEmail = (s.email || '').toLowerCase().includes(q);
      const matchParent = (s.parent_names || '').toLowerCase().includes(q);
      const matchClass = (s.class_name || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchParent || matchClass;
    });
  }

  return list;
});

const isAllVisibleSelected = computed(() => {
  if (filteredStudentsList.value.length === 0) return false;
  return filteredStudentsList.value.every(s => selectedStudentIds.value.includes(s.id));
});

const toggleSelectAllVisible = () => {
  if (isAllVisibleSelected.value) {
    const visibleIds = new Set(filteredStudentsList.value.map(s => s.id));
    selectedStudentIds.value = selectedStudentIds.value.filter(id => !visibleIds.has(id));
  } else {
    const visibleIds = filteredStudentsList.value.map(s => s.id);
    selectedStudentIds.value = Array.from(new Set([...selectedStudentIds.value, ...visibleIds]));
  }
};

const areAllUnassignedSelected = computed(() => {
  const unassigned = allStudentsList.value.filter(s => !s.class_id);
  if (unassigned.length === 0) return false;
  return unassigned.every(s => selectedStudentIds.value.includes(s.id));
});

const toggleSelectAllUnassigned = () => {
  const unassignedIds = allStudentsList.value.filter(s => !s.class_id).map(s => s.id);
  if (areAllUnassignedSelected.value) {
    const unSet = new Set(unassignedIds);
    selectedStudentIds.value = selectedStudentIds.value.filter(id => !unSet.has(id));
  } else {
    selectedStudentIds.value = Array.from(new Set([...selectedStudentIds.value, ...unassignedIds]));
  }
};

const exportFilteredStudentsCSV = () => {
  const list = filteredStudentsList.value;
  if (!list || list.length === 0) {
    setError('No students available to export with current filters.');
    return;
  }

  const headers = [
    'Student ID', 'Student Name', 'Email', 'Gender', 'Birth Date',
    'Enrollment Status', 'Class Section', 'Parent Names', 'Parent Emails', 'Created At'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = list.map(s => [
    escapeCSV(s.id),
    escapeCSV(s.name || ''),
    escapeCSV(s.email || ''),
    escapeCSV(s.gender || ''),
    escapeCSV(s.birth_data || ''),
    escapeCSV(s.class_id ? 'Enrolled' : 'Unassigned'),
    escapeCSV(s.class_name || 'Unassigned'),
    escapeCSV(s.parent_names || (s.parents ? s.parents.map(p => p.name).join(', ') : '')),
    escapeCSV(s.parent_emails || (s.parents ? s.parents.map(p => p.email).join(', ') : '')),
    escapeCSV(s.created_at ? new Date(s.created_at).toLocaleDateString() : '')
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filterLabel = enrollStatusFilter.value || 'all';
  link.setAttribute('href', url);
  link.setAttribute('download', `Students_Roster_${filterLabel}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  setSuccess(`Exported ${list.length} students to CSV successfully.`);
};

// Direct Single Student Placement (Unrestricted)
const handleSingleStudentPlacement = async (student, targetClassVal) => {
  const previousClassId = student.class_id;
  const previousClassName = student.class_name;
  const newClassId = targetClassVal ? parseInt(targetClassVal) : null;
  const targetClassObj = liveClasses.value.find(c => c.id === newClassId);

  student.class_id = newClassId;
  student.class_name = targetClassObj ? targetClassObj.name : null;

  try {
    await apiReassignStudentClass(student.id, newClassId);
    setSuccess(`Student ${student.name} placed in ${targetClassObj ? targetClassObj.name : 'Unassigned'} successfully.`);
    await reloadLiveStructure();
  } catch (err) {
    student.class_id = previousClassId;
    student.class_name = previousClassName;
    setError(err.message || 'Failed to place student');
  }
};

// Bulk Placement Handler
const executeBulkEnroll = async () => {
  if (!targetBulkClassId.value || selectedStudentIds.value.length === 0) return;
  const targetClassObj = liveClasses.value.find(c => c.id === targetBulkClassId.value);
  isBulkSubmitting.value = true;

  try {
    await apiBulkAssignStudents(selectedStudentIds.value, targetBulkClassId.value);
    setSuccess(`Successfully enrolled ${selectedStudentIds.value.length} students into ${targetClassObj ? targetClassObj.name : 'selected class'}!`);
    selectedStudentIds.value = [];
    targetBulkClassId.value = null;
    await reloadLiveStructure();
  } catch (err) {
    setError(err.message || 'Failed to bulk enroll students');
  } finally {
    isBulkSubmitting.value = false;
  }
};

// =============================================================================
// DOMAIN 3 STATE: SETUP WIZARD (3 CORE STANDARDS: UK, INTERNATIONAL, CUSTOM)
// =============================================================================
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
const openAccordions = ref([1, 2, 3]);

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
    capacity: 1000
  });
  if (!openAccordions.value.includes(level.ordinal)) {
    openAccordions.value.push(level.ordinal);
  }
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

const executeBulkAdd = () => {
  const maxAllowed = Math.min(25, Math.max(1, bulkForm.value.count || 1));
  activeLevels.value.forEach(level => {
    if (bulkForm.value.targetIsced.includes(level.isced_level)) {
      level.sections = [];
      for (let i = 0; i < maxAllowed; i++) {
        const suffix = letters[i] || `${i + 1}`;
        level.sections.push({
          name: `${level.name} - ${suffix}`,
          suffix: suffix,
          capacity: 1000
        });
      }
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
  structureState.value.blackout_dates.sort((a,b) => new Date(a.date) - new Date(b.date));
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
    payload.levels = payload.levels.filter(l => l.is_active).map(lvl => {
      // Ensure all sections have full names with static prefix
      lvl.sections = (lvl.sections || []).map(sec => ({
        name: sec.name || `${lvl.name} - ${sec.suffix || 'A'}`,
        capacity: 1000
      }));
      return lvl;
    });
    
    await apiSaveStructureSetup(payload);
    setSuccess('Academic Structure & Calendar saved and synchronized successfully!');
    await reloadLiveStructure();
    activeMainTab.value = 'manage';
  } catch (err) {
    setError(err.message || 'Failed to save configuration');
  } finally {
    isSaving.value = false;
  }
};

const reloadLiveStructure = async () => {
  try {
    const [lvls, clss, tchs, stds] = await Promise.all([
      apiLoadLevels(),
      apiLoadClasses(),
      apiLoadTeachers(),
      apiLoadStudents()
    ]);
    liveLevels.value = lvls || [];
    liveClasses.value = clss || [];
    teachersList.value = tchs || [];
    allStudentsList.value = stds || [];

    // Initialize or keep selectedGradeIds in sync
    if (selectedGradeIds.value.length === 0 || selectedGradeIds.value.length > liveLevels.value.length) {
      selectedGradeIds.value = liveLevels.value.map(l => l.level_id);
    }
  } catch (err) {
    console.warn('Could not reload structure:', err);
  }
};

const syncTabWithRoute = () => {
  const p = (route.path || '').toLowerCase();
  const q = route.query.tab;
  if (p.includes('placement') || p.includes('enrollment') || q === 'enrollment') {
    activeMainTab.value = 'enrollment';
  } else if (p.includes('ladder') || p.includes('wizard') || p.includes('setup') || q === 'setup') {
    activeMainTab.value = 'setup';
  } else {
    activeMainTab.value = 'manage';
  }
};

const loadInitialData = async () => {
  isLoading.value = true;
  try {
    syncTabWithRoute();

    await reloadLiveStructure();
    
    const setupData = await apiGetStructureSetup();
    if (setupData && setupData.has_structure) {
      structureState.value.system = ['UK', 'International', 'Custom'].includes(setupData.system) ? setupData.system : 'UK';
      if (setupData.calendar) structureState.value.calendar = setupData.calendar;
      if (setupData.blackout_dates) structureState.value.blackout_dates = setupData.blackout_dates;
      
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
                suffix = sec.name.replace(new RegExp(`^${existing.name}\\s*-\\s*`), '').trim();
              }
              return {
                id: sec.id,
                name: sec.name,
                suffix: suffix || 'A',
                capacity: 1000
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
  } catch (err) {
    console.warn('Initial load warning:', err);
    initializeLevels('UK');
  } finally {
    isLoading.value = false;
  }
};

watch(() => [route.path, route.query.tab], () => {
  syncTabWithRoute();
});

onMounted(() => {
  loadInitialData();
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
