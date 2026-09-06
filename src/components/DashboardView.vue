<template>
  <div v-if="user" class="flex flex-col min-h-screen">

    <!-- Notification drawer -->
    <transition name="fade">
      <div v-if="showNotifs && notifications.length" class="fixed top-20 right-8 z-50 w-80 bg-white border border-slate-200 rounded shadow-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
          <span class="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
          <button @click="showNotifs = false" class="text-slate-500 hover:text-slate-900 text-xs font-semibold dark:text-slate-400 dark:hover:text-slate-100">Close</button>
        </div>
        <div class="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          <div v-for="n in notifications" :key="n.id" class="px-4 py-3 hover:bg-slate-50 transition-colors group dark:hover:bg-slate-800/60">
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-slate-900 leading-snug font-bold dark:text-slate-100">{{ n.title }}</p>
                <p class="text-[11px] text-slate-500 leading-snug mt-0.5 dark:text-slate-400" v-if="n.description">{{ n.description }}</p>
                <p class="text-[10px] text-slate-400 mt-1.5 dark:text-slate-500">{{ formatDate(n.delivered_at) }}</p>
              </div>
              <button @click="markAsRead(n.id)" class="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-all shrink-0 font-semibold dark:text-blue-400 dark:hover:text-blue-300 dark:bg-blue-950/40 dark:hover:bg-blue-900/40" title="Mark as read">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main content -->
    <div class="w-full max-w-[1800px] mx-auto space-y-6">

      <template v-if="hasValidRole">
      <SetupChecklistCard v-if="authStore.hasAnyRole(['school_admin', 'super_admin', 'admin'])" />

      <!-- Page Title & Quick Actions Row -->
      <div class="flex items-center justify-between bg-white border border-slate-200 rounded p-6 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight dark:text-slate-100">Dashboard Overview</h2>
          <p class="text-xs text-slate-500 mt-1 font-medium dark:text-slate-400">{{ currentDate }}</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Notification bell -->
          <button @click="showNotifs = !showNotifs" class="relative p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
            <Bell class="w-5 h-5" />
            <span v-if="notifications.length" class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">{{ notifications.length }}</span>
          </button>
        </div>
      </div>

      <!-- Perspective Switcher (Multi-Role Users) -->
      <div v-if="authStore.hasMultipleRoles" class="theme-card rounded p-1.5 shadow-xs border border-slate-200 bg-white flex overflow-x-auto gap-1.5 dark:border-slate-800 dark:bg-slate-900">
        <button @click="authStore.setActivePerspective('all')" class="px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap" :class="authStore.activePerspective === 'all' ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'">🌐 Unified Overview</button>
        <button v-if="authStore.hasRole('teacher')" @click="authStore.setActivePerspective('teacher')" class="px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap" :class="authStore.activePerspective === 'teacher' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'">👨‍🏫 Teacher Hub</button>
        <button v-if="authStore.hasRole('parent')" @click="authStore.setActivePerspective('parent')" class="px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap" :class="authStore.activePerspective === 'parent' ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'">👨‍👩‍👧 Parent Portal</button>
        <button v-if="authStore.hasRole('manager')" @click="authStore.setActivePerspective('manager')" class="px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap" :class="authStore.activePerspective === 'manager' ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'">📋 Manager Review</button>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="s in stats" :key="s.label" class="theme-card rounded p-4 border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
          <div class="flex items-center justify-between mb-2.5">
            <div class="w-9 h-9 rounded flex items-center justify-center border" :class="s.iconBg">
              <component :is="s.icon" class="w-4 h-4" :class="s.iconColor" />
            </div>
            <span class="text-2xl font-black text-slate-900 tracking-tight dark:text-slate-100">{{ s.value }}</span>
          </div>
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">{{ s.label }}</p>
        </div>
      </div>

      <!-- Grid layout -->
      <div class="grid lg:grid-cols-3 gap-8">

        <!-- Left 2 Columns: Main Workspaces (Option 1 Segmented Hub - Zero Scrolling) -->
        <div class="lg:col-span-2 space-y-4">

          <!-- Primary Workspace Segmented Tab Switcher -->
          <div class="theme-card rounded p-1.5 bg-slate-100 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto dark:bg-slate-800 dark:border-slate-800">
            <button 
              v-if="canViewPublished"
              @click="activeWorkspaceTab = 'published'"
              class="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all whitespace-nowrap shadow-xs cursor-pointer"
              :class="activeWorkspaceTab === 'published' ? 'bg-white text-blue-700 border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
            >
              <CalendarDays class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Published Trips & Activities</span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-black" :class="activeWorkspaceTab === 'published' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-200 text-slate-600'">
                {{ filteredPublishedEvents.length }}
              </span>
            </button>

            <button 
              v-if="canViewManager"
              @click="activeWorkspaceTab = 'manager'"
              class="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all whitespace-nowrap shadow-xs cursor-pointer relative"
              :class="activeWorkspaceTab === 'manager' ? 'bg-white text-amber-800 border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
            >
              <Clock class="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Manager Review Queue</span>
              <span v-if="proposedManagerCount > 0" class="px-1.5 py-0.2 rounded text-[10px] font-black bg-amber-400 text-slate-950">
                {{ proposedManagerCount }}
              </span>
              <span v-else class="px-1.5 py-0.2 rounded text-[10px] font-bold" :class="activeWorkspaceTab === 'manager' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-200 text-slate-600'">
                0
              </span>
            </button>

            <button 
              v-if="canViewTeacher"
              @click="activeWorkspaceTab = 'teacher'"
              class="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all whitespace-nowrap shadow-xs cursor-pointer relative"
              :class="activeWorkspaceTab === 'teacher' ? 'bg-white text-indigo-700 border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
            >
              <GraduationCap class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Teacher Workspace</span>
              <span v-if="actionRequiredEvents.length > 0" class="px-1.5 py-0.2 rounded text-[10px] font-black bg-rose-500 text-white">
                {{ actionRequiredEvents.length }}
              </span>
              <span v-else class="px-1.5 py-0.2 rounded text-[10px] font-bold" :class="activeWorkspaceTab === 'teacher' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-200 text-slate-600'">
                {{ filteredTeacherEvents.length }}
              </span>
            </button>
          </div>

          <!-- Sub-tab Switcher (Active Queue vs Event History) -->
          <div class="flex items-center justify-between border-b border-slate-200 pb-2 mb-4 dark:border-slate-800">
            <div class="flex items-center gap-4">
              <button 
                @click="dashboardTab = 'active'" 
                class="text-xs font-bold pb-2 transition-all border-b-2 focus:outline-none cursor-pointer"
                :class="dashboardTab === 'active' ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'"
              >
                {{ activeWorkspaceTab === 'manager' ? 'Review Queue' : 'Active Events & Queue' }}
              </button>
              <button 
                @click="dashboardTab = 'history'" 
                class="text-xs font-bold pb-2 transition-all border-b-2 focus:outline-none cursor-pointer"
                :class="dashboardTab === 'history' ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'"
              >
                {{ activeWorkspaceTab === 'manager' ? 'All Events' : 'Past Events History' }}
              </button>
            </div>

            <!-- Quick Action for Teachers -->
            <div v-if="activeWorkspaceTab === 'teacher'">
              <button
                @click="openCreateEventModal()"
                class="btn-primary px-3 py-1.5 rounded text-xs font-bold text-white flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-transform"
              >
                <Plus class="w-3.5 h-3.5" /> Create Event Proposal
              </button>
            </div>
          </div>

          <!-- ================================================================= -->
          <!-- 1. PARENT / STUDENT PUBLISHED VIEW -->
          <!-- ================================================================= -->
          <div v-if="activeWorkspaceTab === 'published' && canViewPublished" class="space-y-4 animation-fade-in">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 dark:text-slate-400">
                <CalendarDays class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {{ dashboardTab === 'active' ? 'Published Events & Trips' : 'Past Events History' }}
              </h3>
              <span class="text-xs text-slate-500 font-medium dark:text-slate-400">{{ filteredPublishedEvents.length }} events</span>
            </div>

            <div v-if="!filteredPublishedEvents.length" class="theme-card border border-slate-200 border-dashed rounded p-12 text-center bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <CalendarDays class="w-10 h-10 text-slate-400 mx-auto mb-3 dark:text-slate-500" />
              <p class="text-slate-700 font-bold text-xs dark:text-slate-400">No events found</p>
              <p class="text-slate-500 text-xs mt-1 dark:text-slate-400">
                {{ dashboardTab === 'active' ? 'There are no finalized school events for your classes at this time.' : 'There are no past events in your history.' }}
              </p>
            </div>

            <EventPublishedCard
              v-for="ev in filteredPublishedEvents"
              :key="ev.id"
              :event="ev"
              :user-role="user.roles || [user.role]"
              :enrollments="enrollments"
              :children="authStore.hasRole('parent') ? linkedChildren : [authStore.profile].filter(Boolean)"
              @enroll="requestEnrollment"
              @parent-enroll="payload => handleParentEnroll(payload)"
              @delete="handleDeleteEvent"
              @open-settings="eventId => openEventSettings(eventId)"
            />
          </div>

          <!-- ================================================================= -->
          <!-- 2. MANAGER REVIEW & APPROVAL QUEUE -->
          <!-- ================================================================= -->
          <div v-if="activeWorkspaceTab === 'manager' && canViewManager" class="space-y-4 animation-fade-in">
            
            <div v-if="dashboardTab === 'active'" class="space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 dark:text-slate-400">
                <Clock class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Proposed Events Queue (Teacher Submissions Awaiting Approval)
              </h3>

              <div v-if="!proposedEventsByLevel.length" class="theme-card border border-slate-200 border-dashed rounded p-8 text-center text-xs text-slate-500 italic bg-white shadow-xs dark:border-slate-800 dark:text-slate-400 dark:bg-slate-900">
                No event proposals currently awaiting Manager review & approval.
              </div>

              <!-- Grouped by grade level: a proposal targeting several levels
                   (e.g. a school-wide trip) appears once under each level it
                   targets, so a level's reviewer sees every proposal that
                   touches their level without hunting through the others. -->
              <div v-for="group in proposedEventsByLevel" :key="group.level" class="space-y-3">
                <h4 class="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 dark:text-slate-400">
                  <Layers class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {{ group.level }}
                  <span class="px-1.5 py-0.2 rounded-sm text-[10px] font-black bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{{ group.events.length }}</span>
                </h4>

              <div
                v-for="ev in group.events"
                :key="ev.id"
                class="theme-card border border-slate-200 rounded p-5 bg-white shadow-xs space-y-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div class="flex justify-between items-start gap-4">
                  <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ ev.title }}</h4>
                    <p class="text-xs text-slate-500 mt-1 flex items-center gap-2 dark:text-slate-400">
                      <span>📅 {{ formatDate(ev.date) }}</span>
                      <span v-if="ev.address">📍 {{ ev.address }}</span>
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <StageStepper :steps="internalPhases" :current-index="internalStageFor(ev.status).index" :sub-label="internalStageFor(ev.status).subLabel" size="compact" />
                    <button v-if="canDeleteEvent" @click.stop="handleDeleteEvent(ev.id)" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-950/40" title="Delete Event">
                      <Trash class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed dark:text-slate-400">{{ ev.description || 'No description provided.' }}</p>

                <!-- Toggle details button -->
                <div class="flex justify-between items-center py-1">
                  <button @click="toggleEventExpand(ev.id)" class="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 focus:outline-none cursor-pointer dark:text-blue-400">
                    <span>{{ expandedEventIds.has(ev.id) ? 'Hide Details' : 'Show Full Details & Financials' }}</span>
                    <component :is="expandedEventIds.has(ev.id) ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Collapsible Details -->
                <transition name="fade">
                  <div v-if="expandedEventIds.has(ev.id)" class="bg-slate-50 border border-slate-200 rounded p-4 space-y-4 text-xs dark:bg-slate-800/60 dark:border-slate-800">
                    <!-- Target Classes & Ticket Pricing -->
                    <div class="space-y-2">
                      <div class="flex items-center justify-between gap-2">
                        <h5 class="font-bold text-slate-600 uppercase tracking-wider text-[10px] dark:text-slate-400">Targeted Classes & Ticket Prices</h5>
                        <div class="flex border border-slate-300 rounded overflow-hidden shrink-0 dark:border-slate-700">
                          <button
                            type="button"
                            @click="setTicketPriceMode(ev, 'calculated')"
                            class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer"
                            :class="ticketPriceMode[ev.id] !== 'manual' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400'"
                          >Calculate</button>
                          <button
                            type="button"
                            @click="setTicketPriceMode(ev, 'manual')"
                            class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border-l border-slate-300 transition-all cursor-pointer dark:border-slate-700"
                            :class="ticketPriceMode[ev.id] === 'manual' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400'"
                          >Manual</button>
                        </div>
                      </div>

                      <!-- Calculated: resource cost minus subsidy, spread over predicted attendance, plus
                           an optional surplus the manager wants to keep for the school's general budget
                           (money the event doesn't need, as opposed to the event's own running cost). -->
                      <div v-if="ticketPriceMode[ev.id] !== 'manual'" class="bg-white p-3 border border-slate-200 rounded space-y-2.5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
                        <div class="flex items-center gap-2">
                          <span class="text-slate-600 text-xs whitespace-nowrap dark:text-slate-400">Net to School Budget (optional):</span>
                          <div class="flex-1 relative">
                            <input
                              type="number"
                              step="0.01"
                              :value="desiredNetDraft[ev.id] ?? 0"
                              @input="desiredNetDraft[ev.id] = parseFloat($event.target.value || 0)"
                              class="w-full bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                              title="Extra amount to collect for the school's general budget, on top of covering resource cost. Leave at 0 to just break even."
                              placeholder="0.00"
                            />
                            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none font-bold dark:text-slate-500">{{ currency }}</span>
                          </div>
                        </div>
                        <div class="flex items-center justify-between gap-3">
                          <div>
                            <span class="text-slate-500 dark:text-slate-400">Suggested price per student (cost − subsidy{{ (desiredNetDraft[ev.id] || 0) > 0 ? ' + net' : '' }}, ÷ students):</span>
                            <div class="text-sm font-black text-slate-900 dark:text-slate-100">{{ formatMoney(getCalculatedTicketPrice(ev), currency) }}</div>
                          </div>
                          <button
                            type="button"
                            @click="applyCalculatedTicketPrice(ev)"
                            :disabled="savingTicketPrices[ev.id]"
                            class="px-3 py-1.5 btn-primary rounded text-[10px] font-bold text-white transition-all active:scale-95 shadow-xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none shrink-0"
                          >{{ savingTicketPrices[ev.id] ? 'Applying...' : 'Apply to All Classes' }}</button>
                        </div>
                      </div>

                      <!-- Manual: per-class editable price -->
                      <div v-else class="space-y-2">
                        <div class="grid sm:grid-cols-2 gap-2">
                          <div v-for="m in ev.class_mappings" :key="m.id" class="bg-white p-3 border border-slate-200 rounded flex flex-col justify-between shadow-xs dark:bg-slate-900 dark:border-slate-800">
                            <span class="text-slate-900 font-bold text-xs dark:text-slate-100">{{ m.level_name }} - {{ m.class_name }}</span>
                            <div class="flex justify-between items-center text-slate-500 mt-1 gap-2 dark:text-slate-400">
                              <span class="whitespace-nowrap">Students: {{ m.student_count || 0 }} (Est: {{ Math.round((m.student_count || 0) * 0.8) }})</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                :value="getTicketPriceDraft(ev, m)"
                                @input="updateManualTicketPriceDraft(ev, m, $event.target.value)"
                                class="w-24 bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded px-2 py-1 text-right focus:outline-none focus:border-blue-600 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                              />
                            </div>
                          </div>
                        </div>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            @click="saveTicketPrices(ev)"
                            :disabled="savingTicketPrices[ev.id]"
                            class="px-3 py-1.5 btn-primary rounded text-[10px] font-bold text-white transition-all active:scale-95 shadow-xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                          >{{ savingTicketPrices[ev.id] ? 'Saving...' : 'Save Ticket Prices' }}</button>
                        </div>
                      </div>
                    </div>

                    <!-- Resources requested -- editable by the reviewing manager/admin -->
                    <div class="space-y-2">
                      <div class="flex items-center justify-between gap-2">
                        <h5 class="font-bold text-slate-600 uppercase tracking-wider text-[10px] dark:text-slate-400">Requested Resources</h5>
                        <button
                          type="button"
                          @click="openCustomTypeModal(ev.id)"
                          class="text-[10px] font-bold text-blue-600 hover:underline dark:text-blue-400"
                        >+ Add Custom Type</button>
                      </div>
                      <div v-if="!eventResourcesMap[ev.id]?.length" class="text-slate-400 italic dark:text-slate-500">No resources added.</div>
                      <div class="space-y-2">
                        <div v-for="res in eventResourcesMap[ev.id]" :key="res.id" class="bg-white border border-slate-200 p-2.5 rounded space-y-1.5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
                          <div class="flex items-center gap-2">
                            <select
                              :value="res.resource_type_id"
                              @change="updateResourceLineType(ev, res, $event.target.value)"
                              class="flex-1 min-w-0 bg-white border border-slate-300 text-slate-800 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-blue-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                            >
                              <option v-for="rt in resourceTypes" :key="rt.id" :value="rt.id">{{ rt.name }}</option>
                            </select>
                            <button
                              type="button"
                              @click="removeResourceLine(ev, res)"
                              title="Remove resource"
                              class="p-1 text-slate-400 hover:text-rose-600 rounded transition-all shrink-0 dark:text-slate-500 dark:hover:text-rose-400"
                            >
                              <X class="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div class="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                            <span class="whitespace-nowrap">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              :value="res.quantity"
                              @change="updateResourceLineQuantity(ev, res, $event.target.value)"
                              title="Quantity"
                              class="w-12 bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded px-1.5 py-1 text-center focus:outline-none focus:border-blue-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                            />
                            <span class="whitespace-nowrap">Unit Price:</span>
                            <div class="relative">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                :value="res.unit_price"
                                @change="updateResourceLineCost(ev, res, $event.target.value)"
                                title="Unit price"
                                placeholder="0.00"
                                class="w-20 bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded pl-1.5 pr-6 py-1 text-right focus:outline-none focus:border-blue-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                              />
                              <span class="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px] pointer-events-none">{{ currency }}</span>
                            </div>
                            <span class="ml-auto text-slate-700 font-bold whitespace-nowrap dark:text-slate-300">= {{ formatMoney(res.total_cost || 0, currency) }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Add a new resource line -->
                      <div class="space-y-1.5 pt-1">
                        <select
                          v-model="getNewResourceDraft(ev.id).resource_type_id"
                          class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-blue-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                        >
                          <option value="">Select resource type...</option>
                          <option v-for="rt in resourceTypes" :key="rt.id" :value="rt.id">{{ rt.name }}</option>
                        </select>
                        <div class="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <span class="whitespace-nowrap">Qty:</span>
                          <input
                            type="number"
                            min="1"
                            v-model.number="getNewResourceDraft(ev.id).quantity"
                            title="Quantity"
                            class="w-12 bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded px-1.5 py-1 text-center focus:outline-none focus:border-blue-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                          />
                          <span class="whitespace-nowrap">Unit Price:</span>
                          <div class="relative">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              v-model.number="getNewResourceDraft(ev.id).unit_price"
                              title="Unit price (optional)"
                              placeholder="0.00"
                              class="w-20 bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded pl-1.5 pr-6 py-1 text-right focus:outline-none focus:border-blue-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                            />
                            <span class="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px] pointer-events-none">{{ currency }}</span>
                          </div>
                          <button
                            type="button"
                            @click="addResourceLine(ev)"
                            :disabled="!getNewResourceDraft(ev.id).resource_type_id || addingResourceLine[ev.id]"
                            class="ml-auto px-2.5 py-1.5 btn-primary rounded text-[10px] font-bold text-white transition-all active:scale-95 shadow-xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none shrink-0"
                          >{{ addingResourceLine[ev.id] ? 'Adding...' : 'Add' }}</button>
                        </div>
                      </div>
                    </div>

                    <!-- Projected Financials + Manager Subsidy Override -->
                    <div class="border-t border-slate-200 pt-3 dark:border-slate-800">
                      <h5 class="font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-2 dark:text-slate-400">Projected Financial Overview</h5>
                      <div class="grid sm:grid-cols-3 gap-3">
                        <div class="space-y-2">
                          <div class="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Est. Ticket Income:</span>
                            <span class="text-slate-900 font-bold dark:text-slate-100">{{ formatMoney(getEventEstimatedRevenue(ev), currency) }}</span>
                          </div>
                          <!-- Manager subsidy override -->
                          <div class="flex items-center gap-2">
                            <span class="text-slate-600 text-xs whitespace-nowrap dark:text-slate-400">School Subsidy:</span>
                            <div class="flex-1 relative">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                :value="managerSubsidyDraft[ev.id] ?? parseFloat(ev.school_subsidy || 0)"
                                @input="managerSubsidyDraft[ev.id] = parseFloat($event.target.value || 0)"
                                @blur="handleManagerSubsidyOverride(ev, $event.target.value)"
                                class="w-full bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600 transition-all shadow-xs dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                                :title="`Override school subsidy (${currency})`"
                                placeholder="0.00"
                              />
                              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none font-bold dark:text-slate-500">{{ currency }}</span>
                            </div>
                          </div>
                          <p class="text-[10px] text-amber-700 italic dark:text-amber-400" v-if="ev.school_subsidy > 0">
                            Manager-set subsidy (saved): {{ formatMoney(ev.school_subsidy, currency) }}
                          </p>
                        </div>
                        <div class="bg-white p-3 border border-slate-200 rounded flex flex-col justify-center items-center shadow-xs dark:bg-slate-900 dark:border-slate-800">
                          <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold dark:text-slate-400">Est. Total Revenue</span>
                          <span class="text-base font-black text-emerald-700 dark:text-emerald-400">{{ formatMoney(getEventEstimatedRevenue(ev) + parseFloat(managerSubsidyDraft[ev.id] ?? (ev.school_subsidy || 0)), currency) }}</span>
                        </div>
                        <div class="bg-white p-3 border border-slate-200 rounded flex flex-col justify-center items-center shadow-xs dark:bg-slate-900 dark:border-slate-800" :title="`Ticket income + school subsidy, minus total resource cost (${formatMoney(getLiveEventTotalCost(ev), currency)})`">
                          <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold dark:text-slate-400">Net to School</span>
                          <span class="text-base font-black" :class="getEventNetBalance(ev) >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'">{{ formatMoney(getEventNetBalance(ev), currency) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>

                <!-- Review Actions & Decision Box -->
                <div class="pt-3 border-t border-slate-200 flex flex-col gap-2.5 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Rejection reason (required only if rejecting)..."
                    v-model="transitionReason[ev.id]"
                    class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                  <div class="flex gap-2 justify-end">
                    <button
                      @click="handleManagerDecision(ev.id, 'reject')"
                      :disabled="isEventProcessing(ev.id)"
                      class="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/40"
                    >
                      {{ isEventProcessing(ev.id) ? 'Working...' : 'Reject (Return to Draft)' }}
                    </button>
                    <button
                      @click="handleManagerDecision(ev.id, 'approve')"
                      :disabled="isEventProcessing(ev.id)"
                      class="px-4 py-2 btn-primary rounded text-xs font-bold text-white transition-all active:scale-95 shadow-xs cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {{ isEventProcessing(ev.id) ? 'Working...' : 'Approve Proposal' }}
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </div>

            <!-- All Events -- every event a manager can see, grouped by status.
                 Was: date-filtered "history" list with plain, non-clickable cards
                 (no @click/router-link at all) -- a manager had no way to open a
                 published event from here. Fixed 2026-08-31: now sourced from
                 the same events list check_event_permission already allows a
                 manager to read (proposed/approved/published), grouped so the
                 pipeline is obvious at a glance, and every card opens the event. -->
            <div v-else class="space-y-6">
              <div v-if="!managerAllEvents.length" class="theme-card border border-slate-200 border-dashed rounded p-8 text-center text-xs text-slate-500 italic bg-white shadow-xs dark:border-slate-800 dark:text-slate-400 dark:bg-slate-900">
                No events in your school yet.
              </div>

              <div v-for="group in managerEventGroups" :key="group.status" v-show="group.events.length" class="space-y-3">
                <h3 class="text-xs font-bold uppercase tracking-wider flex items-center gap-2" :class="group.headingClass">
                  <component :is="group.icon" class="w-4 h-4" />
                  {{ group.label }}
                  <span class="px-1.5 py-0.2 rounded text-[10px] font-black bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400">{{ group.events.length }}</span>
                </h3>

                <div
                  v-for="ev in group.events"
                  :key="ev.id"
                  @click="openEventSettings(ev.id)"
                  class="theme-card border border-slate-200 rounded p-4 bg-white shadow-xs flex items-center justify-between gap-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
                  role="button"
                  tabindex="0"
                  @keyup.enter="openEventSettings(ev.id)"
                >
                  <div class="min-w-0">
                    <h4 class="text-sm font-bold text-slate-900 truncate dark:text-slate-100">{{ ev.title }}</h4>
                    <p class="text-xs text-slate-500 mt-1 flex items-center gap-2 dark:text-slate-400">
                      <span>📅 {{ formatDate(ev.date) }}</span>
                      <span v-if="ev.address" class="truncate">📍 {{ ev.address }}</span>
                    </p>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <!-- Manager publish override: an approved event's teacher hasn't
                         published it yet -- the manager doesn't have to wait on them. -->
                    <button
                      v-if="group.status === 'approved'"
                      @click.stop="handleTeacherPublish(ev.id)"
                      :disabled="isEventProcessing(ev.id)"
                      class="px-3 py-1.5 btn-primary text-white text-xs font-bold rounded shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      🚀 {{ isEventProcessing(ev.id) ? 'Publishing...' : 'Publish' }}
                    </button>
                    <StageStepper :steps="internalPhases" :current-index="internalStageFor(ev.status).index" :sub-label="internalStageFor(ev.status).subLabel" size="compact" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- ================================================================= -->
          <!-- 3. TEACHER / STAFF WORKSPACE -->
          <!-- ================================================================= -->
          <div v-if="activeWorkspaceTab === 'teacher' && canViewTeacher" class="space-y-4 animation-fade-in">
            
            <div v-if="dashboardTab === 'active'" class="space-y-6">
              
              <!-- Section: Requires Attention (Drafts & Rejected Proposals) -->
              <div class="space-y-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-2 dark:text-rose-400">
                  <span class="w-2 h-2 rounded-full bg-rose-600" :class="{'animate-pulse': actionRequiredEvents.length}"></span>
                  Requires Attention (Drafts & Rejected Proposals)
                </h4>
                
                <div v-if="!actionRequiredEvents.length" class="p-4 bg-emerald-50 border border-emerald-200 rounded text-center text-xs text-emerald-800 font-semibold shadow-xs dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                  ✓ No events currently require your attention or revision.
                </div>

                <div
                  v-else
                  v-for="ev in actionRequiredEvents"
                  :key="ev.id"
                  class="theme-card border border-rose-200 bg-rose-50/20 rounded p-4 shadow-xs space-y-3 dark:border-rose-800"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-bold text-slate-900 truncate dark:text-slate-100">
                        <span class="cursor-pointer hover:underline" @click="openEditWizard(ev.id)">{{ ev.title }}</span>
                        <span class="ml-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700">
                          Draft / Rejected
                        </span>
                      </h4>
                      <div class="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span class="flex items-center gap-1"><Clock class="w-3 h-3" />{{ formatDate(ev.date) }}</span>
                        <span v-if="ev.address" class="flex items-center gap-1"><MapPin class="w-3 h-3" />{{ ev.address }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button @click.stop="openEditWizard(ev.id)" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded transition-all active:scale-95 shadow-xs cursor-pointer">
                        Edit & Resubmit ➔
                      </button>
                      <button v-if="canDeleteEvent" @click.stop="handleDeleteEvent(ev.id)" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-950/40" title="Delete Event">
                        <Trash class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400">{{ ev.description || 'No description provided.' }}</p>
                </div>
              </div>

              <!-- Section: Active Events in Pipeline -->
              <div class="space-y-3 pt-2">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 dark:text-slate-400">
                  <CalendarDays class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Active Events in Pipeline
                </h4>

                <div v-if="!activeTeacherEvents.length" class="theme-card border border-slate-200 border-dashed rounded p-8 text-center text-xs text-slate-400 italic bg-white shadow-xs dark:border-slate-800 dark:text-slate-500 dark:bg-slate-900">
                  No active events currently in progress.
                </div>

                <div
                  v-for="ev in activeTeacherEvents"
                  :key="ev.id"
                  class="theme-card border border-slate-200 bg-white rounded p-4 shadow-xs space-y-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-bold text-slate-900 truncate dark:text-slate-100">
                        <span class="cursor-pointer hover:underline" @click="openEditWizard(ev.id)">{{ ev.title }}</span>
                        <StageStepper v-if="ev.status" class="ml-2 inline-flex" :steps="internalPhases" :current-index="internalStageFor(ev.status).index" :sub-label="internalStageFor(ev.status).subLabel" size="compact" />
                      </h4>
                      <div class="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span class="flex items-center gap-1"><Clock class="w-3 h-3" />{{ formatDate(ev.date) }}</span>
                        <span v-if="ev.address" class="flex items-center gap-1"><MapPin class="w-3 h-3" />{{ ev.address }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        v-if="(ev.status === 'approved' || ev.status === 'ready_to_publish')"
                        @click.stop="handleTeacherPublish(ev.id)"
                        :disabled="isEventProcessing(ev.id)"
                        class="px-3.5 py-1.5 btn-primary text-white font-bold text-xs rounded shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                      >
                        🚀 {{ isEventProcessing(ev.id) ? 'Publishing...' : 'Publish Event' }}
                      </button>
                      <button
                        @click.stop="openEventSettings(ev.id)"
                        class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center gap-1 transition-colors shadow-xs cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400"
                      >
                        Settings & Roster
                      </button>
                      <button v-if="authStore.hasAnyRole(['school_admin', 'super_admin', 'teacher'])" @click.stop="handleDeleteEvent(ev.id)" class="p-1 text-slate-400 hover:text-rose-600 rounded transition-all dark:text-slate-500 dark:hover:text-rose-400" title="Delete Event">
                        <Trash class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400">{{ ev.description || 'No description provided.' }}</p>
                </div>
              </div>

            </div>

            <!-- Teacher History -->
            <div v-else class="space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 dark:text-slate-400">
                <CalendarDays class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Teacher Past Event History
              </h3>

              <div v-if="!filteredTeacherEvents.length" class="theme-card border border-slate-200 border-dashed rounded p-8 text-center text-xs text-slate-500 italic bg-white shadow-xs dark:border-slate-800 dark:text-slate-400 dark:bg-slate-900">
                No past events recorded.
              </div>

              <div
                v-for="ev in filteredTeacherEvents"
                :key="ev.id"
                class="theme-card border border-slate-200 rounded p-4 bg-white shadow-xs space-y-2 dark:border-slate-800 dark:bg-slate-900"
              >
                <div class="flex justify-between items-start gap-4">
                  <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ ev.title }}</h4>
                    <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">📅 {{ formatDate(ev.date) }}</p>
                  </div>
                  <StageStepper :steps="internalPhases" :current-index="internalStageFor(ev.status).index" :sub-label="internalStageFor(ev.status).subLabel" size="compact" />
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Right 1 Column: Enrollments & Approvals Sidebar -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 dark:text-slate-400">
            <ClipboardList class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {{ user.role === 'teacher' ? 'Pending Student Approvals' : 'My Active Enrollments' }}
          </h3>

          <div v-if="!enrollments.length" class="theme-card border border-slate-200 border-dashed rounded p-8 text-center bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <ClipboardList class="w-8 h-8 text-slate-400 mx-auto mb-2 dark:text-slate-500" />
            <p class="text-slate-600 text-xs font-semibold dark:text-slate-400">No enrollments yet</p>
          </div>

          <div v-for="en in enrollments" :key="en.id"
            class="theme-card border border-slate-200 bg-white rounded p-4 space-y-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-slate-900 truncate dark:text-slate-100">{{ en.event_title || 'Enrollment #' + en.id }}</p>
                <p class="text-[11px] text-slate-600 font-semibold mt-1 dark:text-slate-400" v-if="en.student_name">Student: {{ en.student_name }}</p>
                <p class="text-[10px] text-blue-600 font-medium mt-0.5 dark:text-blue-400" v-if="en.parent_id && user.role === 'student'">Enrolled by Parent</p>
                <p class="text-[10px] text-slate-400 mt-0.5 dark:text-slate-500">ID: #{{ en.id }}</p>
              </div>
              <StageStepper :steps="enrollmentSteps" :current-index="enrollmentStageFor(en.state).index" :terminal="enrollmentStageFor(en.state).terminal" size="compact" tone="violet" />
            </div>

            <!-- Teacher actions -->
            <div v-if="user.role === 'teacher' && en.state === 'approved_by_parent'" class="flex gap-2">
              <button @click="approveEnrollment(en.id, 'approved_by_teacher')"
                class="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold rounded transition-all shadow-xs dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-700">
                ✓ Approve
              </button>
              <button @click="approveEnrollment(en.id, 'rejected_by_teacher')"
                class="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold rounded transition-all shadow-xs dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-400 dark:border-rose-700">
                ✗ Reject
              </button>
            </div>

            <!-- Teacher's own direct enroll (no parent_id -- they enrolled the
                 student themselves) -- let them cancel it outright. -->
            <div v-if="user.role === 'teacher' && en.state === 'approved_by_teacher' && !en.parent_id"
              class="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button @click="cancelEnrollment(en)"
                class="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded transition-all flex items-center justify-center gap-1.5 shadow-xs dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800">
                ✕ Cancel Enrollment
              </button>
            </div>

            <!-- Parent actions -->
            <div v-if="user.role === 'parent' && en.state === 'requested_by_student'" class="flex gap-2">
              <button @click="approveEnrollment(en.id, 'approved_by_parent')"
                class="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold rounded transition-all shadow-xs dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-700">
                Approve
              </button>
              <button @click="approveEnrollment(en.id, 'rejected_by_parent')"
                class="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold rounded transition-all shadow-xs dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-400 dark:border-rose-700">
                Reject
              </button>
            </div>

            <!-- Pay button -->
            <div v-if="user.role === 'parent' && en.state === 'approved_by_teacher' && payments[en.id]?.status !== 'paid'"
              class="pt-2 border-t border-slate-200 flex gap-2 dark:border-slate-800">
              <button @click="payTicket(en.id)"
                class="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-all shadow-xs">
                Pay ${{ parseFloat(payments[en.id]?.amount || 0).toFixed(2) }}
              </button>
              <button @click="cancelEnrollment(en)"
                class="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded transition-all dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800"
                title="Cancel enrollment">
                ✕ Cancel
              </button>
            </div>
            <div v-else-if="payments[en.id]?.status === 'paid'" class="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span class="flex items-center gap-1.5 text-xs text-emerald-700 font-bold dark:text-emerald-400">
                <CheckCircle class="w-3.5 h-3.5" /> Payment Complete
              </span>
            </div>

            <!-- Cancel button: parent on non-paid states that can still be cancelled -->
            <div v-if="user.role === 'parent' && payments[en.id]?.status !== 'paid' && en.state !== 'approved_by_teacher'"
              class="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button @click="cancelEnrollment(en)"
                id="cancel-enrollment-btn"
                class="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded transition-all flex items-center justify-center gap-1.5 shadow-xs dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800">
                ✕ Cancel Enrollment
              </button>
            </div>

            <!-- Cancel button: student on their own pending enrollment -->
            <div v-if="user.role === 'student' && (en.state === 'requested_by_student')"
              class="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button @click="cancelEnrollment(en)"
                id="cancel-student-enrollment-btn"
                class="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded transition-all flex items-center justify-center gap-1.5 shadow-xs dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800">
                ✕ Cancel Request
              </button>
            </div>
          </div>
        </div>

      </div>
      </template>

      <!-- NO ROLE STATE -->
      <div v-else class="flex items-center justify-center min-h-[70vh]">
        <div class="theme-card rounded p-12 max-w-lg text-center flex flex-col items-center justify-center space-y-6 shadow-xl border border-slate-200 bg-white">
          <div class="w-20 h-20 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center relative text-blue-600">
             <ShieldAlert class="w-10 h-10" />
          </div>
          <div class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900 tracking-tight">Awaiting Role Assignment</h2>
            <p class="text-xs text-slate-500 font-medium leading-relaxed">
              Welcome to SAMS! Your account has been created. Please wait while an administrator reviews and grants you the necessary permissions.
            </p>
          </div>
          <button @click="authStore.logout()" class="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold rounded text-xs transition-colors shadow-xs mt-2">
            Sign Out For Now
          </button>
        </div>
      </div>

    </div>

    <!-- Create Event Draft Modal -->
    <transition name="fade">
      <div v-if="showCreateEventModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="theme-card border border-slate-200 bg-white rounded p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl relative">
          <div class="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays class="w-5 h-5 text-blue-600" />
              {{ editingEventId ? 'Edit & Resubmit Event Proposal' : 'Create Event Proposal' }}
            </h3>
            <button @click="showCreateEventModal = false; editingEventId = null;" class="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>
          <EventWizard :key="editingEventId || 'new'" :edit-event-id="editingEventId" @completed="showCreateEventModal = false; editingEventId = null; eventStore.loadEvents(); loadManagerQueue();" />
        </div>
      </div>
    </transition>

    <!-- Create Custom Resource Type Modal (manager review queue) -->
    <transition name="fade">
      <div v-if="customTypeModalEventId" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4" @click.self="customTypeModalEventId = null">
        <div class="theme-card border border-slate-200 bg-white rounded p-6 max-w-md w-full space-y-4 shadow-2xl">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Create Custom Resource Type</h3>
            <button @click="customTypeModalEventId = null" class="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors">
              <X class="w-4 h-4" />
            </button>
          </div>
          <p v-if="customTypeError" class="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-800">{{ customTypeError }}</p>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 dark:text-slate-400">Type Name</label>
            <input
              type="text"
              v-model="customTypeForm.name"
              placeholder="e.g. Tour Guide, Museum Entry Fee"
              class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 dark:text-slate-400">Category</label>
            <select
              v-model="customTypeForm.category"
              class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
            >
              <option value="transport">Transport</option>
              <option value="staffing">Staffing</option>
              <option value="meals">Meals</option>
              <option value="other">Other Support</option>
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="customTypeModalEventId = null" class="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded text-xs font-bold hover:bg-slate-100 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">Cancel</button>
            <button
              type="button"
              @click="handleCreateCustomResourceType"
              :disabled="!customTypeForm.name.trim() || creatingCustomType"
              class="px-3.5 py-2 btn-primary rounded text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >{{ creatingCustomType ? 'Creating...' : 'Create & Select' }}</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useAuthStore, useEventStore, useNotificationStore, useSchoolStore } from '../store';
import { formatMoney, formatDate as formatDateTz } from '../format';
import EventPublishedCard from './EventPublishedCard.vue';
import StageStepper from './ui/StageStepper.vue';
import { INTERNAL_PHASES, ENROLLMENT_STEPS, internalStageFor, enrollmentStageFor } from '../workflow';
import EventWizard from './wizard/EventWizard.vue';
import SetupChecklistCard from './SetupChecklistCard.vue';
import { 
  apiCreateEnrollment, 
  apiLoadEnrollments,
  apiCancelEnrollment,
  apiPayEnrollment, 
  apiUpdateEnrollmentApproval, 
  apiLoadLinkedStudents, 
  apiGetPayment,
  apiCreateFeedback,
  apiLoadFeedbacks,
  apiLoadClasses,
  apiLoadManagerQueue,
  apiLoadPublishedEvents,
  apiManagerDecision,
  apiGetEventResources,
  apiUpdateResourceCost,
  apiUpdateResourceLine,
  apiAddResourceLine,
  apiDeleteResourceLine,
  apiGetResourceTypes,
  apiCreateResourceType,
  apiUpdateTicketPrices,
  apiUpdateEventSubsidy,
  apiCloneEvent,
  apiEventTeacherDecision,
  apiDeleteEvent,
  apiSubmitEvent,
  apiPublishEvent
} from '../api';
import {
  Bell, CalendarDays, Clock, MapPin, CheckCircle, Star,
  ClipboardList, BookOpen, Users, Check, XCircle, AlertCircle, RefreshCw, ShieldAlert,
  ChevronDown, ChevronUp, DollarSign, Wallet, ShieldCheck, Trash, Plus, X, Settings, GraduationCap, Layers
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const eventStore = useEventStore();
const notifStore = useNotificationStore();
const schoolStore = useSchoolStore();
const currency = computed(() => schoolStore.currency);
const internalPhases = INTERNAL_PHASES;
const enrollmentSteps = ENROLLMENT_STEPS;

const showCreateEventModal = ref(false);
const editingEventId = ref(null);

// Option 1: Segmented Workspace Switcher State
const activeWorkspaceTab = ref('published'); // 'published' | 'manager' | 'teacher'

const canViewPublished = computed(() => {
  return authStore.can('enrollment:parent_approve') || authStore.can('enrollment:request') || authStore.hasAnyRole(['parent', 'student', 'school_admin', 'super_admin']);
});

const canViewManager = computed(() => {
  return authStore.can('event:review') || authStore.hasAnyRole(['manager', 'school_admin', 'super_admin']);
});

const canViewTeacher = computed(() => {
  return authStore.can('event:create') || authStore.hasAnyRole(['teacher', 'school_admin', 'super_admin']);
});

const hasValidRole = computed(() => {
  return authStore.hasAnyRole(['parent', 'student', 'manager', 'school_admin', 'super_admin', 'teacher', 'event_teacher']);
});

const user = computed(() => authStore.user || {});
const enrollments = ref([]);
const linkedChildren = ref([]);
const publishedEvents = ref([]);
const managerEvents = ref([]);
const resourceTypes = ref([]);
const managerSubsidyDraft = reactive({});
// 'calculated' (default) shows a uniform break-even suggestion the manager applies
// to every mapped class in one click; 'manual' unlocks per-class editable prices.
const ticketPriceMode = reactive({});
const ticketPriceDrafts = reactive({});
const savingTicketPrices = reactive({});
// Extra amount, on top of break-even, the manager wants the calculated price to
// raise for the school's general budget rather than the event's own running cost.
const desiredNetDraft = reactive({});
const transitionReason = reactive({});
const processingEventIds = reactive({});
const isEventProcessing = (eventId) => !!processingEventIds[eventId];

watch(() => authStore.user, async (newVal) => {
  if (newVal && authStore.hasRole('parent') && linkedChildren.value.length === 0) {
    try {
      linkedChildren.value = await apiLoadLinkedStudents();
    } catch (err) {
      console.warn('Failed to load linked children:', err);
    }
  }
}, { immediate: true });

// Sync workspace tab when user switches activePerspective
watch(() => authStore.activePerspective, (newVal) => {
  if (newVal === 'parent') activeWorkspaceTab.value = 'published';
  else if (newVal === 'manager') activeWorkspaceTab.value = 'manager';
  else if (newVal === 'teacher') activeWorkspaceTab.value = 'teacher';
});

const events = computed(() => eventStore.events);
const notifications = computed(() => notifStore.notifications);

const proposedManagerCount = computed(() => {
  return (managerEvents.value || []).filter(e => e.status === 'proposed').length;
});

// Manager Review Queue, grouped by grade level rather than a flat list. A
// proposal can target several levels at once (school-wide trips, etc.) via
// its class_mappings -- it appears once under every level it touches, so a
// level's reviewer sees the full set of proposals affecting their level.
// class_mappings only carries level_name (not level_id) from the backend
// (ClassMappingResponse), so that's the grouping key; level names are unique
// per tenant in practice. A proposal with no resolvable level (shouldn't
// happen -- submission requires at least one class mapping) falls into
// "Other" rather than being silently dropped from the queue.
const proposedEventsByLevel = computed(() => {
  const proposed = (managerEvents.value || []).filter(e => e.status === 'proposed');
  const groups = new Map();
  for (const ev of proposed) {
    const levelNames = [...new Set((ev.class_mappings || [])
      .map(m => m.level_name)
      .filter(Boolean))];
    const targets = levelNames.length ? levelNames : ['Other'];
    for (const level of targets) {
      if (!groups.has(level)) groups.set(level, []);
      groups.get(level).push(ev);
    }
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }))
    .map(([level, events]) => ({ level, events }));
});

const canDeleteEvent = computed(() => {
  return authStore.hasAnyRole(['school_admin', 'super_admin', 'manager', 'teacher']);
});

const teacherClassId = ref(null);
const payments = reactive({});
const feedbacks = reactive({});
const feedbackForms = reactive({});
const showNotifs = ref(false);

const currentDate = computed(() => {
  return formatDateTz(new Date().toISOString(), {
    timeZone: schoolStore.timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

const stats = computed(() => [
  { label: 'Total Events', value: events.value.length, icon: CalendarDays, iconBg: 'bg-blue-50 border-blue-200', iconColor: 'text-blue-600' },
  { label: 'Enrollments', value: enrollments.value.length, icon: BookOpen, iconBg: 'bg-purple-50 border-purple-200', iconColor: 'text-purple-600' },
  { label: 'Notifications', value: notifications.value.length, icon: Bell, iconBg: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-600' },
  { label: 'Linked Children', value: linkedChildren.value.length, icon: Users, iconBg: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600' },
]);

onMounted(async () => {
  await eventStore.loadEvents();
  await notifStore.loadNotifications();
  await loadEnrollments();
  await loadPublishedEvents();
  await loadManagerQueue();
  await loadResourceTypes();

  // Smart initial workspace tab selection based on roles
  if (authStore.hasRole('parent') || authStore.hasRole('student')) {
    activeWorkspaceTab.value = 'published';
  } else if (authStore.hasRole('manager')) {
    activeWorkspaceTab.value = 'manager';
  } else if (authStore.hasRole('teacher')) {
    activeWorkspaceTab.value = 'teacher';
  } else {
    activeWorkspaceTab.value = proposedManagerCount.value > 0 ? 'manager' : 'published';
  }

  if (authStore.hasRole('parent') || user.value?.role === 'parent') {
    try {
      linkedChildren.value = await apiLoadLinkedStudents();
    } catch (err) {
      console.warn('Failed to load linked children:', err);
    }
  }

  events.value.forEach(ev => {
    feedbackForms[ev.id] = { rating: 5, comments: '' };
    loadFeedbacksForEvent(ev.id);
  });
});

const loadEnrollments = async () => {
  try {
    const list = await apiLoadEnrollments();
    enrollments.value = Array.isArray(list) ? list : [];
    if (authStore.hasRole('parent') || user.value?.role === 'parent') {
      list?.forEach(async (en) => {
        try { payments[en.id] = await apiGetPayment(en.id); } catch {}
      });
    }
  } catch (err) { console.error(err); }
};

const loadPublishedEvents = async () => {
  try {
    const list = await apiLoadPublishedEvents();
    publishedEvents.value = Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to load published events:', err);
  }
};

const loadManagerQueue = async () => {
  try {
    const list = await apiLoadManagerQueue();
    managerEvents.value = Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to load manager queue:', err);
  }
};

const loadResourceTypes = async () => {
  try {
    const list = await apiGetResourceTypes();
    resourceTypes.value = Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to load resource types:', err);
  }
};

const loadFeedbacksForEvent = async (eventId) => {
  try { feedbacks[eventId] = await apiLoadFeedbacks(eventId); } catch {}
};

const isStudentEnrolled = (mapId) => enrollments.value.some(en => en.event_class_map_id === mapId);
const isParentEnrolled = (mapId) => {
  const childIds = linkedChildren.value.map(c => c.id);
  return enrollments.value.some(en => en.event_class_map_id === mapId && childIds.includes(en.student_id));
};
const getChildEnrollment = (mapId, childId) => {
  return enrollments.value.find(en => en.event_class_map_id === mapId && en.student_id === childId);
};
const getUnenrolledChildren = (mapId, classId) => {
  return linkedChildren.value.filter(child => 
    child.class_id === classId && 
    !enrollments.value.some(en => en.event_class_map_id === mapId && en.student_id === child.id)
  );
};

const requestEnrollment = async (mapId) => {
  const tempId = 'temp-' + Date.now();
  const tempEntry = {
    id: tempId,
    event_class_map_id: mapId,
    student_id: parseInt(user.value.user_id),
    state: 'requested_by_student'
  };
  enrollments.value.push(tempEntry);

  try {
    await apiCreateEnrollment({ student_id: parseInt(user.value.user_id), event_class_map_id: mapId });
    await loadEnrollments();
  } catch (err) {
    enrollments.value = enrollments.value.filter(e => e.id !== tempId);
    alert(err.message || 'Failed to request enrollment');
  }
};

const handleParentEnroll = async (data, mapIdParam) => {
  let childId = null;
  let mapId = mapIdParam;

  if (typeof data === 'object' && data !== null) {
    childId = data.studentId;
    mapId = data.mapId || mapIdParam;
  } else {
    childId = data;
  }

  if (!childId) return;

  const tempId = 'temp-' + Date.now();
  const tempEntry = {
    id: tempId,
    event_class_map_id: mapId,
    student_id: childId,
    state: 'approved_by_parent'
  };
  enrollments.value.push(tempEntry);

  try {
    await apiCreateEnrollment({ student_id: childId, event_class_map_id: mapId, approved_by_parent: true });
    await loadEnrollments();
  } catch (err) {
    enrollments.value = enrollments.value.filter(e => e.id !== tempId);
    alert(err.message || 'Failed to enroll child');
  }
};

const approveEnrollment = async (enrollmentId, targetState) => {
  try {
    // EnrollmentStateUpdateRequest on the backend expects a JSON object
    // ({ state: "..." }), not a bare string -- sending the string directly
    // used to trip Pydantic's body validation (422), whose error detail is
    // an array of objects, which then rendered as "[object Object]" in the
    // alert() below instead of a real message. This is what made Approve/
    // Reject look broken for both the teacher and the parent.
    await apiUpdateEnrollmentApproval(enrollmentId, { state: targetState });
    await loadEnrollments();
  } catch (err) {
    alert(err.message || 'Failed to update enrollment');
  }
};

const cancelEnrollment = async (en) => {
  const label = en.student_name ? `${en.student_name}'s enrollment` : `enrollment #${en.id}`;
  if (!confirm(`Are you sure you want to cancel ${label} from "${en.event_title || 'this event'}"?\n\nThe head teacher will be notified.`)) return;
  
  const originalList = [...enrollments.value];
  enrollments.value = enrollments.value.filter(e => e.id !== en.id);

  try {
    await apiCancelEnrollment(en.id);
    await loadEnrollments();
  } catch (err) {
    enrollments.value = originalList;
    alert(err.message || 'Failed to cancel enrollment.');
  }
};

const payTicket = async (id) => {
  try {
    await apiPayEnrollment(id);
    payments[id] = await apiGetPayment(id);
    await loadEnrollments();
  } catch (err) { alert(err.message); }
};

const handleTeacherPublish = async (eventId) => {
  if (isEventProcessing(eventId)) return;
  if (!confirm('Are you sure you want to publish this approved event? Students and parents will be notified.')) return;
  processingEventIds[eventId] = true;
  try {
    await apiPublishEvent(eventId);
    await eventStore.loadEvents();
    await loadPublishedEvents();
    alert('Event successfully published!');
  } catch (err) {
    alert(err.message || 'Failed to publish event');
  } finally {
    delete processingEventIds[eventId];
  }
};

const handleDeleteEvent = async (eventId) => {
  if (!confirm('Are you sure you want to permanently delete this event? This cannot be undone.')) return;
  try {
    await apiDeleteEvent(eventId);
    await eventStore.loadEvents();
    await loadPublishedEvents();
    await loadManagerQueue();
  } catch (err) {
    alert(err.message || 'Failed to delete event');
  }
};

const handleManagerDecision = async (eventId, decision) => {
  if (isEventProcessing(eventId)) return;
  const reason = transitionReason[eventId] || '';
  if (decision === 'reject' && !reason.trim()) {
    alert('A rejection reason is required to return this event to draft.');
    return;
  }
  processingEventIds[eventId] = true;
  try {
    await apiManagerDecision(eventId, decision, reason);
    delete transitionReason[eventId];
    await eventStore.loadEvents();
    await loadManagerQueue();
    await loadPublishedEvents();
  } catch (err) {
    alert(err.message || 'Failed to submit manager decision');
  } finally {
    delete processingEventIds[eventId];
  }
};

const handleManagerSubsidyOverride = async (ev, val) => {
  const subsidyNum = parseFloat(val || 0);
  try {
    await apiUpdateEventSubsidy(ev.id, subsidyNum);
    ev.school_subsidy = subsidyNum;
  } catch (err) {
    console.error('Failed to override subsidy:', err);
    alert(err.message || 'Failed to update the subsidy amount');
  }
};

const submitFeedback = async (eventId) => {
  const form = feedbackForms[eventId];
  try {
    await apiCreateFeedback(eventId, { rating: form.rating, comments: form.comments || null });
    form.comments = '';
    await loadFeedbacksForEvent(eventId);
  } catch (err) { alert(err.message); }
};

const shouldShowMapping = (m) => {
  if (user.value?.role === 'school_admin' || user.value?.role === 'teacher') {
    return true;
  }
  if (user.value?.role === 'student') {
    return m.class_id === authStore.profile?.class_id;
  }
  if (user.value?.role === 'parent') {
    return linkedChildren.value.some(child => child.class_id === m.class_id);
  }
  return false;
};

const canTeacherManage = (ev) => {
  if (authStore.hasAnyRole(['school_admin', 'super_admin'])) return true;
  if (authStore.hasRole('teacher') || user.value?.role === 'teacher') {
    if (ev.created_by && String(ev.created_by) === String(user.value?.user_id || user.value?.id)) return true;
    if (!teacherClassId.value) return true;
    return ev.class_mappings?.some(m => m.class_id === teacherClassId.value);
  }
  return false;
};

const getEnrollmentByMapId = (mapId) => {
  return enrollments.value.find(en => en.event_class_map_id === mapId);
};

const markAsRead = async (id) => { await notifStore.markAsRead(id); };

const formatDate = (iso) => {
  if (!iso) return '';
  return formatDateTz(iso, {
    timeZone: schoolStore.timezone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatState = (state, role) => {
  if (state === 'approved_by_parent') {
    return role === 'teacher' ? 'Pending Approval' : 'Pending Teacher';
  }
  const map = {
    'requested_by_student': role === 'parent' ? 'Pending Action' : 'Pending Parent',
    'approved_by_teacher': 'Approved',
    'rejected_by_parent': 'Rejected by Parent',
    'rejected_by_teacher': 'Rejected by Teacher',
  };
  return map[state] || state;
};

const getStateBadgeClass = (state) => {
  switch (state) {
    case 'requested_by_student': return 'bg-amber-50 text-amber-700 border border-amber-300';
    case 'approved_by_parent': return 'bg-blue-50 text-blue-700 border border-blue-300';
    case 'approved_by_teacher': return 'bg-emerald-50 text-emerald-700 border border-emerald-300';
    case 'rejected_by_parent':
    case 'rejected_by_teacher': return 'bg-rose-50 text-rose-700 border border-rose-300';
    default: return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
};

// =============================================================================
// Event Workflow Reactive State & Methods
// =============================================================================
const dashboardTab = ref('active');
const expandedEventIds = ref(new Set());

const openCreateEventModal = () => {
  editingEventId.value = null;
  showCreateEventModal.value = true;
};

const openEventSettings = (eventId) => {
  router.push(`/events/${eventId}`);
};

const openEditWizard = (eventId) => {
  const ev = (events.value || []).find(e => e.id === eventId) || (publishedEvents.value || []).find(e => e.id === eventId);
  if (ev && ev.status === 'published') {
    router.push(`/events/${eventId}`);
  } else {
    editingEventId.value = eventId;
    showCreateEventModal.value = true;
  }
};

const eventResourcesMap = reactive({});

const loadEventResources = async (eventId) => {
  if (eventResourcesMap[eventId]) return;
  try {
    const data = await apiGetEventResources(eventId);
    eventResourcesMap[eventId] = data.resources || [];
  } catch (err) {
    console.error('Failed to load resources for event:', eventId, err);
  }
};

// =============================================================================
// Manager Resource Editing (add/edit/remove resource lines, custom types)
// =============================================================================
const newResourceDrafts = reactive({});
const addingResourceLine = reactive({});
const customTypeModalEventId = ref(null);
const customTypeForm = reactive({ name: '', category: 'other' });
const customTypeError = ref(null);
const creatingCustomType = ref(false);

const getNewResourceDraft = (eventId) => {
  if (!newResourceDrafts[eventId]) {
    newResourceDrafts[eventId] = { resource_type_id: '', quantity: 1, unit_price: 0 };
  }
  return newResourceDrafts[eventId];
};

const addResourceLine = async (ev) => {
  const draft = getNewResourceDraft(ev.id);
  if (!draft.resource_type_id || addingResourceLine[ev.id]) return;
  addingResourceLine[ev.id] = true;
  try {
    const resourceTypeId = parseInt(draft.resource_type_id, 10);
    const quantity = draft.quantity || 1;
    const unitPrice = parseFloat(draft.unit_price || 0);
    const created = await apiAddResourceLine(ev.id, { resource_type_id: resourceTypeId, quantity });
    const rt = resourceTypes.value.find(t => t.id === resourceTypeId);
    if (!eventResourcesMap[ev.id]) eventResourcesMap[ev.id] = [];
    const newLine = {
      id: created.id,
      resource_type_id: resourceTypeId,
      resource_type_name: rt?.name || '',
      quantity,
      unit_price: 0,
      total_cost: 0,
    };
    eventResourcesMap[ev.id].push(newLine);
    newResourceDrafts[ev.id] = { resource_type_id: '', quantity: 1, unit_price: 0 };
    if (unitPrice > 0) {
      try {
        await apiUpdateResourceCost(created.id, { unit_price: unitPrice, currency: currency.value });
        newLine.unit_price = unitPrice;
        newLine.total_cost = unitPrice * quantity;
      } catch (err) {
        alert(err.message || 'Resource was added, but its price could not be set');
      }
    }
  } catch (err) {
    alert(err.message || 'Failed to add resource');
  } finally {
    delete addingResourceLine[ev.id];
  }
};

const updateResourceLineQuantity = async (ev, res, val) => {
  const quantity = parseInt(val || 1, 10);
  if (!quantity || quantity < 1) return;
  const previous = res.quantity;
  res.quantity = quantity;
  if (res.unit_price) res.total_cost = parseFloat(res.unit_price) * quantity;
  try {
    await apiUpdateResourceLine(res.id, { quantity });
  } catch (err) {
    res.quantity = previous;
    alert(err.message || 'Failed to update resource quantity');
  }
};

const updateResourceLineCost = async (ev, res, val) => {
  const unitPrice = parseFloat(val || 0);
  if (Number.isNaN(unitPrice) || unitPrice < 0) return;
  const previous = { unit_price: res.unit_price, total_cost: res.total_cost };
  res.unit_price = unitPrice;
  res.total_cost = unitPrice * (res.quantity || 0);
  try {
    await apiUpdateResourceCost(res.id, { unit_price: unitPrice, currency: currency.value });
  } catch (err) {
    res.unit_price = previous.unit_price;
    res.total_cost = previous.total_cost;
    alert(err.message || 'Failed to update resource price');
  }
};

const updateResourceLineType = async (ev, res, val) => {
  const resourceTypeId = parseInt(val, 10);
  const previous = { resource_type_id: res.resource_type_id, resource_type_name: res.resource_type_name };
  const rt = resourceTypes.value.find(t => t.id === resourceTypeId);
  res.resource_type_id = resourceTypeId;
  res.resource_type_name = rt?.name || res.resource_type_name;
  try {
    await apiUpdateResourceLine(res.id, { resource_type_id: resourceTypeId });
  } catch (err) {
    res.resource_type_id = previous.resource_type_id;
    res.resource_type_name = previous.resource_type_name;
    alert(err.message || 'Failed to update resource type');
  }
};

const removeResourceLine = async (ev, res) => {
  if (!confirm(`Remove "${res.resource_type_name}" from this event?`)) return;
  const list = eventResourcesMap[ev.id];
  const idx = list ? list.findIndex(r => r.id === res.id) : -1;
  if (idx === -1) return;
  const [removed] = list.splice(idx, 1);
  try {
    await apiDeleteResourceLine(res.id);
  } catch (err) {
    list.splice(idx, 0, removed);
    alert(err.message || 'Failed to remove resource');
  }
};

const openCustomTypeModal = (eventId) => {
  customTypeModalEventId.value = eventId;
  customTypeForm.name = '';
  customTypeForm.category = 'other';
  customTypeError.value = null;
};

const handleCreateCustomResourceType = async () => {
  if (!customTypeForm.name.trim() || creatingCustomType.value) return;
  creatingCustomType.value = true;
  try {
    const newType = await apiCreateResourceType({
      name: customTypeForm.name.trim(),
      category: customTypeForm.category,
    });
    resourceTypes.value.push(newType);
    const eventId = customTypeModalEventId.value;
    if (eventId) {
      getNewResourceDraft(eventId).resource_type_id = newType.id;
    }
    customTypeModalEventId.value = null;
  } catch (err) {
    customTypeError.value = err.message || 'Could not create the custom resource type.';
  } finally {
    creatingCustomType.value = false;
  }
};

const toggleEventExpand = async (eventId) => {
  if (expandedEventIds.value.has(eventId)) {
    expandedEventIds.value.delete(eventId);
  } else {
    initTicketPriceState(eventId);
    expandedEventIds.value.add(eventId);
    await loadEventResources(eventId);
  }
};

// Seeds the calculate/manual toggle and per-class price drafts the first time
// a manager expands an event, from whatever ticket prices are already saved.
const initTicketPriceState = (eventId) => {
  const ev = (managerEvents.value || []).find(e => e.id === eventId);
  if (!ev) return;
  if (!ticketPriceMode[eventId]) ticketPriceMode[eventId] = 'calculated';
  if (!ticketPriceDrafts[eventId]) {
    ticketPriceDrafts[eventId] = {};
    (ev.class_mappings || []).forEach(m => {
      ticketPriceDrafts[eventId][m.id] = parseFloat(m.ticket_price || 0);
    });
  }
};

const setTicketPriceMode = (ev, mode) => {
  initTicketPriceState(ev.id);
  ticketPriceMode[ev.id] = mode;
};

const getTicketPriceDraft = (ev, m) => {
  const draft = ticketPriceDrafts[ev.id]?.[m.id];
  return draft !== undefined ? draft : parseFloat(m.ticket_price || 0);
};

const updateManualTicketPriceDraft = (ev, m, val) => {
  initTicketPriceState(ev.id);
  ticketPriceDrafts[ev.id][m.id] = parseFloat(val || 0);
};

const getEventPredictedAttendance = (ev) => {
  if (!ev || !ev.class_mappings) return 0;
  return ev.class_mappings.reduce((acc, m) => acc + Math.round((m.student_count || 0) * 0.8), 0);
};

// event.total_cost is a snapshot column that's only ever meant to be written by
// the (currently unreachable) finance-submit step, so it's stale/zero on almost
// every real event. Once the resource lines are loaded, sum their priced cost
// directly instead -- that reflects manager edits (add/remove/quantity) live.
const getLiveEventTotalCost = (ev) => {
  if (!ev) return 0;
  const resources = eventResourcesMap[ev.id];
  if (!resources) return parseFloat(ev.total_cost || 0);
  return resources.reduce((acc, r) => acc + parseFloat(r.total_cost || 0), 0);
};

// Uniform per-student price that covers total resource cost net of the
// (possibly still-draft) school subsidy, plus any surplus the manager wants
// to raise for the school's general budget, spread over predicted attendance.
const getCalculatedTicketPrice = (ev) => {
  if (!ev) return 0;
  const cost = getLiveEventTotalCost(ev);
  const subsidy = parseFloat(managerSubsidyDraft[ev.id] ?? (ev.school_subsidy || 0));
  const desiredNet = parseFloat(desiredNetDraft[ev.id] || 0);
  const attendance = getEventPredictedAttendance(ev);
  if (attendance <= 0) return 0;
  return Math.max(0, Math.round(((cost - subsidy + desiredNet) / attendance) * 100) / 100);
};

const applyCalculatedTicketPrice = async (ev) => {
  initTicketPriceState(ev.id);
  const price = getCalculatedTicketPrice(ev);
  (ev.class_mappings || []).forEach(m => {
    ticketPriceDrafts[ev.id][m.id] = price;
  });
  await saveTicketPrices(ev);
};

const saveTicketPrices = async (ev) => {
  if (savingTicketPrices[ev.id]) return;
  initTicketPriceState(ev.id);
  const drafts = ticketPriceDrafts[ev.id];
  const mappings = (ev.class_mappings || []).map(m => ({
    class_map_id: m.id,
    ticket_price: parseFloat(drafts[m.id] ?? m.ticket_price ?? 0),
  }));
  savingTicketPrices[ev.id] = true;
  try {
    await apiUpdateTicketPrices(ev.id, mappings);
    ev.class_mappings.forEach(m => {
      m.ticket_price = drafts[m.id] ?? m.ticket_price;
    });
  } catch (err) {
    alert(err.message || 'Failed to update ticket prices');
  } finally {
    delete savingTicketPrices[ev.id];
  }
};

const getEventEstimatedRevenue = (ev) => {
  if (!ev || !ev.class_mappings) return 0;
  return ev.class_mappings.reduce((acc, m) => {
    const price = ticketPriceDrafts[ev.id]?.[m.id] ?? m.ticket_price ?? 0;
    return acc + (parseFloat(price || 0) * 0.8 * (m.student_count || 0));
  }, 0);
};

// Ticket income plus school subsidy, minus the resources' total cost -- what the
// event actually nets the school once its price/subsidy inputs are applied.
const getEventNetBalance = (ev) => {
  if (!ev) return 0;
  const revenue = getEventEstimatedRevenue(ev);
  const subsidy = parseFloat(managerSubsidyDraft[ev.id] ?? (ev.school_subsidy || 0));
  const cost = getLiveEventTotalCost(ev);
  return revenue + subsidy - cost;
};

const filteredTeacherEvents = computed(() => {
  const all = events.value || [];
  if (user.value?.role === 'event_teacher') {
    return all.filter(e => e.status === 'resource_planning');
  }
  const currentUserId = user.value?.user_id;
  const isTeacherOrAdmin = authStore.hasAnyRole(['teacher', 'school_admin']);

  if (dashboardTab.value === 'active') {
    return all.filter(e => {
      const isFutureOrActive = !e.date || new Date(e.date) >= new Date();
      if (e.status === 'published') return isFutureOrActive;
      if (isTeacherOrAdmin && (e.created_by == currentUserId || authStore.hasRole('school_admin'))) {
        return e.status === 'draft' || e.status === 'proposed' || e.status === 'approved' || e.status === 'ready_to_publish' || e.status === 'resource_planning' || e.status === 'finance_approval' || e.status === 'final_review';
      }
      return false;
    });
  } else {
    return all.filter(e => e.date && new Date(e.date) < new Date());
  }
});

const actionRequiredEvents = computed(() => {
  return filteredTeacherEvents.value.filter(e => e.status === 'draft');
});

const activeTeacherEvents = computed(() => {
  return filteredTeacherEvents.value.filter(e => e.status !== 'draft');
});

// Every event a manager is allowed to read (proposed/approved/published --
// enforced server-side by TenantService.get_events_for_user +
// check_event_permission, not re-decided here), newest first.
const managerAllEvents = computed(() => {
  return [...(events.value || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
});

const managerEventGroups = computed(() => {
  const byStatus = { proposed: [], approved: [], published: [] };
  for (const ev of managerAllEvents.value) {
    if (byStatus[ev.status]) byStatus[ev.status].push(ev);
  }
  return [
    { status: 'proposed', label: 'Awaiting Your Review', icon: Clock, events: byStatus.proposed, headingClass: 'text-amber-700', badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200' },
    { status: 'approved', label: 'Approved -- Not Yet Published', icon: ShieldCheck, events: byStatus.approved, headingClass: 'text-blue-700', badgeClass: 'bg-blue-50 text-blue-800 border border-blue-200' },
    { status: 'published', label: 'Published', icon: CalendarDays, events: byStatus.published, headingClass: 'text-emerald-700', badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200' },
  ];
});

const filteredPublishedEvents = computed(() => {
  const all = (publishedEvents.value && publishedEvents.value.length)
    ? publishedEvents.value
    : (events.value || []).filter(e => e.status === 'published');
  if (dashboardTab.value === 'active') {
    return all.filter(e => !e.date || new Date(e.date) >= new Date());
  } else {
    return all.filter(e => e.date && new Date(e.date) < new Date());
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
