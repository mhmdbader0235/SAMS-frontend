<template>
  <div v-if="user" class="flex flex-col min-h-screen">

    <!-- Notification drawer -->
    <transition name="fade">
      <div v-if="showNotifs && notifications.length" class="fixed top-20 right-8 z-50 w-80 bg-white border border-slate-200 rounded shadow-xl overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span class="text-xs font-bold text-slate-900">Notifications</span>
          <button @click="showNotifs = false" class="text-slate-500 hover:text-slate-900 text-xs font-semibold">Close</button>
        </div>
        <div class="max-h-72 overflow-y-auto divide-y divide-slate-100">
          <div v-for="n in notifications" :key="n.id" class="px-4 py-3 hover:bg-slate-50 transition-colors group">
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-slate-900 leading-snug font-bold">{{ n.title }}</p>
                <p class="text-[11px] text-slate-500 leading-snug mt-0.5" v-if="n.description">{{ n.description }}</p>
                <p class="text-[10px] text-slate-400 mt-1.5">{{ formatDate(n.delivered_at) }}</p>
              </div>
              <button @click="markAsRead(n.id)" class="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-all shrink-0 font-semibold" title="Mark as read">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main content -->
    <div class="max-w-7xl mx-auto space-y-6">

      <template v-if="hasValidRole">
      <SetupChecklistCard v-if="authStore.hasAnyRole(['school_admin', 'super_admin', 'admin'])" />

      <!-- Page Title & Quick Actions Row -->
      <div class="flex items-center justify-between bg-white border border-slate-200 rounded p-6 shadow-xs">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p class="text-xs text-slate-500 mt-1 font-medium">{{ currentDate }}</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Notification bell -->
          <button @click="showNotifs = !showNotifs" class="relative p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all">
            <Bell class="w-5 h-5" />
            <span v-if="notifications.length" class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">{{ notifications.length }}</span>
          </button>
        </div>
      </div>

      <!-- Perspective Switcher (Multi-Role Users) -->
      <div v-if="authStore.hasMultipleRoles" class="theme-card rounded p-1.5 shadow-xs border border-slate-200 bg-white flex overflow-x-auto gap-1.5">
        <button @click="authStore.setActivePerspective('all')" class="px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap" :class="authStore.activePerspective === 'all' ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'">🌐 Unified Overview</button>
        <button v-if="authStore.hasRole('teacher')" @click="authStore.setActivePerspective('teacher')" class="px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap" :class="authStore.activePerspective === 'teacher' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'">👨‍🏫 Teacher Hub</button>
        <button v-if="authStore.hasRole('parent')" @click="authStore.setActivePerspective('parent')" class="px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap" :class="authStore.activePerspective === 'parent' ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'">👨‍👩‍👧 Parent Portal</button>
        <button v-if="authStore.hasRole('manager')" @click="authStore.setActivePerspective('manager')" class="px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap" :class="authStore.activePerspective === 'manager' ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'">📋 Manager Review</button>
        <button v-if="authStore.hasRole('finance')" @click="authStore.setActivePerspective('finance')" class="px-3.5 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap" :class="authStore.activePerspective === 'finance' ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'">💳 Finance</button>
      </div>

      <!-- Quick Management Navigation Bar -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <router-link to="/manage/users" class="theme-card p-4 rounded border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 transition-all group flex items-center gap-3 shadow-xs">
          <div class="w-9 h-9 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
            <Users class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <h4 class="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">Students & Parents</h4>
            <p class="text-[11px] text-slate-500 truncate">Create users & invite codes</p>
          </div>
        </router-link>

        <router-link to="/manage/structure" class="theme-card p-4 rounded border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/20 transition-all group flex items-center gap-3 shadow-xs">
          <div class="w-9 h-9 rounded bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold shrink-0">
            <Layers class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <h4 class="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors truncate">School Structure</h4>
            <p class="text-[11px] text-slate-500 truncate">Grades, sections & classes</p>
          </div>
        </router-link>

        <router-link to="/manage/placement" class="theme-card p-4 rounded border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 transition-all group flex items-center gap-3 shadow-xs">
          <div class="w-9 h-9 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold shrink-0">
            <UserPlus class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <h4 class="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">Student Class Placement</h4>
            <p class="text-[11px] text-slate-500 truncate">Roster & section placement</p>
          </div>
        </router-link>

        <router-link to="/manage/plan-event" class="theme-card p-4 rounded border border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/20 transition-all group flex items-center gap-3 shadow-xs">
          <div class="w-9 h-9 rounded bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold shrink-0">
            <CalendarDays class="w-4 h-4" />
          </div>
          <div class="min-w-0">
            <h4 class="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate">Plan New Event</h4>
            <p class="text-[11px] text-slate-500 truncate">Event wizard & budget</p>
          </div>
        </router-link>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="s in stats" :key="s.label" class="theme-card rounded p-4 border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all">
          <div class="flex items-center justify-between mb-2.5">
            <div class="w-9 h-9 rounded flex items-center justify-center border" :class="s.iconBg">
              <component :is="s.icon" class="w-4 h-4" :class="s.iconColor" />
            </div>
            <span class="text-2xl font-black text-slate-900 tracking-tight">{{ s.value }}</span>
          </div>
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ s.label }}</p>
        </div>
      </div>

      <!-- Grid layout -->
      <div class="grid lg:grid-cols-3 gap-8">

        <!-- Left 2 Columns: Main Workspaces (Option 1 Segmented Hub - Zero Scrolling) -->
        <div class="lg:col-span-2 space-y-4">

          <!-- Primary Workspace Segmented Tab Switcher -->
          <div class="theme-card rounded p-1.5 bg-slate-100 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
            <button 
              v-if="canViewPublished"
              @click="activeWorkspaceTab = 'published'"
              class="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all whitespace-nowrap shadow-xs cursor-pointer"
              :class="activeWorkspaceTab === 'published' ? 'bg-white text-blue-700 border border-slate-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
            >
              <CalendarDays class="w-4 h-4 text-blue-600" />
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
              <Clock class="w-4 h-4 text-amber-600" />
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
              <GraduationCap class="w-4 h-4 text-indigo-600" />
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
          <div class="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
            <div class="flex items-center gap-4">
              <button 
                @click="dashboardTab = 'active'" 
                class="text-xs font-bold pb-2 transition-all border-b-2 focus:outline-none cursor-pointer"
                :class="dashboardTab === 'active' ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'"
              >
                Active Events & Queue
              </button>
              <button 
                @click="dashboardTab = 'history'" 
                class="text-xs font-bold pb-2 transition-all border-b-2 focus:outline-none cursor-pointer"
                :class="dashboardTab === 'history' ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'"
              >
                Past Events History
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
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <CalendarDays class="w-4 h-4 text-blue-600" />
                {{ dashboardTab === 'active' ? 'Published Events & Trips' : 'Past Events History' }}
              </h3>
              <span class="text-xs text-slate-500 font-medium">{{ filteredPublishedEvents.length }} events</span>
            </div>

            <div v-if="!filteredPublishedEvents.length" class="theme-card border border-slate-200 border-dashed rounded p-12 text-center bg-white shadow-xs">
              <CalendarDays class="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p class="text-slate-700 font-bold text-xs">No events found</p>
              <p class="text-slate-500 text-xs mt-1">
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
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Clock class="w-4 h-4 text-amber-600" />
                Proposed Events Queue (Teacher Submissions Awaiting Approval)
              </h3>

              <div v-if="!managerEvents.filter(e => e.status === 'proposed').length" class="theme-card border border-slate-200 border-dashed rounded p-8 text-center text-xs text-slate-500 italic bg-white shadow-xs">
                No event proposals currently awaiting Manager review & approval.
              </div>

              <div
                v-for="ev in managerEvents.filter(e => e.status === 'proposed')"
                :key="ev.id"
                class="theme-card border border-slate-200 rounded p-5 bg-white shadow-xs space-y-4"
              >
                <div class="flex justify-between items-start gap-4">
                  <div>
                    <h4 class="text-sm font-bold text-slate-900">{{ ev.title }}</h4>
                    <p class="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>📅 {{ formatDate(ev.date) }}</span>
                      <span v-if="ev.address">📍 {{ ev.address }}</span>
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold uppercase">Proposed</span>
                    <button v-if="canDeleteEvent" @click.stop="handleDeleteEvent(ev.id)" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all" title="Delete Event">
                      <Trash class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">{{ ev.description || 'No description provided.' }}</p>

                <!-- Toggle details button -->
                <div class="flex justify-between items-center py-1">
                  <button @click="toggleEventExpand(ev.id)" class="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 focus:outline-none cursor-pointer">
                    <span>{{ expandedEventIds.has(ev.id) ? 'Hide Details' : 'Show Full Details & Financials' }}</span>
                    <component :is="expandedEventIds.has(ev.id) ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Collapsible Details -->
                <transition name="fade">
                  <div v-if="expandedEventIds.has(ev.id)" class="bg-slate-50 border border-slate-200 rounded p-4 space-y-4 text-xs">
                    <!-- Target Classes -->
                    <div class="space-y-2">
                      <h5 class="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Targeted Classes & Suggested Prices</h5>
                      <div class="grid sm:grid-cols-2 gap-2">
                        <div v-for="m in ev.class_mappings" :key="m.id" class="bg-white p-3 border border-slate-200 rounded flex flex-col justify-between shadow-xs">
                          <span class="text-slate-900 font-bold text-xs">{{ m.level_name }} - {{ m.class_name }}</span>
                          <div class="flex justify-between text-slate-500 mt-1">
                            <span>Students: {{ m.student_count || 0 }} (Est: {{ Math.round((m.student_count || 0) * 0.8) }})</span>
                            <span class="text-emerald-700 font-bold">Sug: {{ formatMoney(m.ticket_price, currency) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Resources requested -->
                    <div class="space-y-2">
                      <h5 class="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Requested Resources</h5>
                      <div v-if="!eventResourcesMap[ev.id]?.length" class="text-slate-400 italic">No resources added.</div>
                      <div class="grid sm:grid-cols-2 gap-2">
                        <div v-for="res in eventResourcesMap[ev.id]" :key="res.id" class="bg-white border border-slate-200 p-2.5 rounded flex justify-between shadow-xs">
                          <span class="text-slate-800 font-medium">{{ res.resource_type_name }}</span>
                          <span class="text-slate-500">Qty: {{ res.quantity }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Projected Financials + Manager Subsidy Override -->
                    <div class="border-t border-slate-200 pt-3">
                      <h5 class="font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-2">Projected Financial Overview</h5>
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                          <div class="flex justify-between text-slate-600">
                            <span>Est. Ticket Income:</span>
                            <span class="text-slate-900 font-bold">{{ formatMoney(getEventEstimatedRevenue(ev), currency) }}</span>
                          </div>
                          <!-- Manager subsidy override -->
                          <div class="flex items-center gap-2">
                            <span class="text-slate-600 text-xs whitespace-nowrap">School Subsidy:</span>
                            <div class="flex-1 relative">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                :value="managerSubsidyDraft[ev.id] ?? parseFloat(ev.school_subsidy || 0)"
                                @input="managerSubsidyDraft[ev.id] = parseFloat($event.target.value || 0)"
                                @blur="handleManagerSubsidyOverride(ev, $event.target.value)"
                                class="w-full bg-white border border-slate-300 text-slate-900 font-bold text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600 transition-all shadow-xs"
                                :title="`Override school subsidy (${currency})`"
                                placeholder="0.00"
                              />
                              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none font-bold">{{ currency }}</span>
                            </div>
                          </div>
                          <p class="text-[10px] text-amber-700 italic" v-if="ev.school_subsidy > 0">
                            Teacher proposed: {{ formatMoney(ev.school_subsidy, currency) }}
                          </p>
                        </div>
                        <div class="bg-white p-3 border border-slate-200 rounded flex flex-col justify-center items-center shadow-xs">
                          <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Est. Total Revenue</span>
                          <span class="text-base font-black text-emerald-700">{{ formatMoney(getEventEstimatedRevenue(ev) + parseFloat(managerSubsidyDraft[ev.id] ?? (ev.school_subsidy || 0)), currency) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>

                <!-- Review Actions & Decision Box -->
                <div class="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
                  <input
                    type="text"
                    placeholder="Rejection reason (required only if rejecting)..."
                    v-model="transitionReason[ev.id]"
                    class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
                  />
                  <div class="flex gap-2 justify-end">
                    <button
                      @click="handleManagerDecision(ev.id, 'reject')"
                      class="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
                    >
                      Reject (Return to Draft)
                    </button>
                    <button
                      @click="handleManagerDecision(ev.id, 'approve')"
                      class="px-4 py-2 btn-primary rounded text-xs font-bold text-white transition-all active:scale-95 shadow-xs cursor-pointer"
                    >
                      Approve Proposal
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Manager History -->
            <div v-else class="space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <CalendarDays class="w-4 h-4 text-blue-600" />
                Manager Event History
              </h3>

              <div v-if="!filteredManagerHistoryEvents.length" class="theme-card border border-slate-200 border-dashed rounded p-8 text-center text-xs text-slate-500 italic bg-white shadow-xs">
                No historical events recorded.
              </div>

              <div
                v-for="ev in filteredManagerHistoryEvents"
                :key="ev.id"
                class="theme-card border border-slate-200 rounded p-5 bg-white shadow-xs space-y-3"
              >
                <div class="flex justify-between items-start gap-4">
                  <div>
                    <h4 class="text-sm font-bold text-slate-900">{{ ev.title }}</h4>
                    <p class="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>📅 {{ formatDate(ev.date) }}</span>
                      <span v-if="ev.address">📍 {{ ev.address }}</span>
                    </p>
                  </div>
                  <span class="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase">{{ ev.status }}</span>
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
                <h4 class="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-rose-600" :class="{'animate-pulse': actionRequiredEvents.length}"></span>
                  Requires Attention (Drafts & Rejected Proposals)
                </h4>
                
                <div v-if="!actionRequiredEvents.length" class="p-4 bg-emerald-50 border border-emerald-200 rounded text-center text-xs text-emerald-800 font-semibold shadow-xs">
                  ✓ No events currently require your attention or revision.
                </div>

                <div
                  v-else
                  v-for="ev in actionRequiredEvents"
                  :key="ev.id"
                  class="theme-card border border-rose-200 bg-rose-50/20 rounded p-4 shadow-xs space-y-3"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-bold text-slate-900 truncate">
                        <span class="cursor-pointer hover:underline" @click="openEditWizard(ev.id)">{{ ev.title }}</span>
                        <span class="ml-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                          Draft / Rejected
                        </span>
                      </h4>
                      <div class="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span class="flex items-center gap-1"><Clock class="w-3 h-3" />{{ formatDate(ev.date) }}</span>
                        <span v-if="ev.address" class="flex items-center gap-1"><MapPin class="w-3 h-3" />{{ ev.address }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button @click.stop="openEditWizard(ev.id)" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded transition-all active:scale-95 shadow-xs cursor-pointer">
                        Edit & Resubmit ➔
                      </button>
                      <button v-if="canDeleteEvent" @click.stop="handleDeleteEvent(ev.id)" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all" title="Delete Event">
                        <Trash class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p class="text-xs text-slate-600">{{ ev.description || 'No description provided.' }}</p>
                </div>
              </div>

              <!-- Section: Active Events in Pipeline -->
              <div class="space-y-3 pt-2">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <CalendarDays class="w-4 h-4 text-indigo-600" />
                  Active Events in Pipeline
                </h4>

                <div v-if="!activeTeacherEvents.length" class="theme-card border border-slate-200 border-dashed rounded p-8 text-center text-xs text-slate-400 italic bg-white shadow-xs">
                  No active events currently in progress.
                </div>

                <div
                  v-for="ev in activeTeacherEvents"
                  :key="ev.id"
                  class="theme-card border border-slate-200 bg-white rounded p-4 shadow-xs space-y-3"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-bold text-slate-900 truncate">
                        <span class="cursor-pointer hover:underline" @click="openEditWizard(ev.id)">{{ ev.title }}</span>
                        <span v-if="ev.status" class="ml-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                          :class="ev.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'">
                          {{ ev.status === 'approved' ? 'Approved (Ready to Publish)' : ev.status }}
                        </span>
                      </h4>
                      <div class="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span class="flex items-center gap-1"><Clock class="w-3 h-3" />{{ formatDate(ev.date) }}</span>
                        <span v-if="ev.address" class="flex items-center gap-1"><MapPin class="w-3 h-3" />{{ ev.address }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        v-if="(ev.status === 'approved' || ev.status === 'ready_to_publish')"
                        @click.stop="handleTeacherPublish(ev.id)"
                        class="px-3.5 py-1.5 btn-primary text-white font-bold text-xs rounded shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        🚀 Publish Event
                      </button>
                      <button
                        @click.stop="openEventSettings(ev.id)"
                        class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      >
                        Settings & Roster
                      </button>
                      <button v-if="authStore.hasAnyRole(['school_admin', 'super_admin', 'teacher'])" @click.stop="handleDeleteEvent(ev.id)" class="p-1 text-slate-400 hover:text-rose-600 rounded transition-all" title="Delete Event">
                        <Trash class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p class="text-xs text-slate-600">{{ ev.description || 'No description provided.' }}</p>
                </div>
              </div>

            </div>

            <!-- Teacher History -->
            <div v-else class="space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <CalendarDays class="w-4 h-4 text-blue-600" />
                Teacher Past Event History
              </h3>

              <div v-if="!filteredTeacherEvents.length" class="theme-card border border-slate-200 border-dashed rounded p-8 text-center text-xs text-slate-500 italic bg-white shadow-xs">
                No past events recorded.
              </div>

              <div
                v-for="ev in filteredTeacherEvents"
                :key="ev.id"
                class="theme-card border border-slate-200 rounded p-4 bg-white shadow-xs space-y-2"
              >
                <div class="flex justify-between items-start gap-4">
                  <div>
                    <h4 class="text-sm font-bold text-slate-900">{{ ev.title }}</h4>
                    <p class="text-xs text-slate-500 mt-1">📅 {{ formatDate(ev.date) }}</p>
                  </div>
                  <span class="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase">{{ ev.status }}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Right 1 Column: Enrollments & Approvals Sidebar -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <ClipboardList class="w-4 h-4 text-blue-600" />
            {{ user.role === 'teacher' ? 'Pending Student Approvals' : 'My Active Enrollments' }}
          </h3>

          <div v-if="!enrollments.length" class="theme-card border border-slate-200 border-dashed rounded p-8 text-center bg-white shadow-xs">
            <ClipboardList class="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p class="text-slate-600 text-xs font-semibold">No enrollments yet</p>
          </div>

          <div v-for="en in enrollments" :key="en.id"
            class="theme-card border border-slate-200 bg-white rounded p-4 space-y-3 shadow-xs">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-slate-900 truncate">{{ en.event_title || 'Enrollment #' + en.id }}</p>
                <p class="text-[11px] text-slate-600 font-semibold mt-1" v-if="en.student_name">Student: {{ en.student_name }}</p>
                <p class="text-[10px] text-blue-600 font-medium mt-0.5" v-if="en.parent_id && user.role === 'student'">Enrolled by Parent</p>
                <p class="text-[10px] text-slate-400 mt-0.5">ID: #{{ en.id }}</p>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded" :class="getStateBadgeClass(en.state)">
                {{ formatState(en.state, user.role) }}
              </span>
            </div>

            <!-- Teacher actions -->
            <div v-if="user.role === 'teacher' && en.state === 'approved_by_parent'" class="flex gap-2">
              <button @click="approveEnrollment(en.id, 'approved_by_teacher')"
                class="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold rounded transition-all shadow-xs">
                ✓ Approve
              </button>
              <button @click="approveEnrollment(en.id, 'rejected_by_teacher')"
                class="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold rounded transition-all shadow-xs">
                ✗ Reject
              </button>
            </div>

            <!-- Parent actions -->
            <div v-if="user.role === 'parent' && en.state === 'requested_by_student'" class="flex gap-2">
              <button @click="approveEnrollment(en.id, 'approved_by_parent')"
                class="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold rounded transition-all shadow-xs">
                Approve
              </button>
              <button @click="approveEnrollment(en.id, 'rejected_by_parent')"
                class="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold rounded transition-all shadow-xs">
                Reject
              </button>
            </div>

            <!-- Pay button -->
            <div v-if="user.role === 'parent' && en.state === 'approved_by_teacher' && payments[en.id]?.status !== 'paid'"
              class="pt-2 border-t border-slate-200 flex gap-2">
              <button @click="payTicket(en.id)"
                class="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-all shadow-xs">
                Pay ${{ parseFloat(payments[en.id]?.amount || 0).toFixed(2) }}
              </button>
              <button @click="cancelEnrollment(en)"
                class="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded transition-all"
                title="Cancel enrollment">
                ✕ Cancel
              </button>
            </div>
            <div v-else-if="payments[en.id]?.status === 'paid'" class="pt-2 border-t border-slate-200">
              <span class="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <CheckCircle class="w-3.5 h-3.5" /> Payment Complete
              </span>
            </div>

            <!-- Cancel button: parent on non-paid states that can still be cancelled -->
            <div v-if="user.role === 'parent' && payments[en.id]?.status !== 'paid' && en.state !== 'approved_by_teacher'"
              class="pt-2 border-t border-slate-200">
              <button @click="cancelEnrollment(en)"
                id="cancel-enrollment-btn"
                class="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded transition-all flex items-center justify-center gap-1.5 shadow-xs">
                ✕ Cancel Enrollment
              </button>
            </div>

            <!-- Cancel button: student on their own pending enrollment -->
            <div v-if="user.role === 'student' && (en.state === 'requested_by_student')"
              class="pt-2 border-t border-slate-200">
              <button @click="cancelEnrollment(en)"
                id="cancel-student-enrollment-btn"
                class="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded transition-all flex items-center justify-center gap-1.5 shadow-xs">
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
              Welcome to SchoolDesk! Your account has been created. Please wait while an administrator reviews and grants you the necessary permissions.
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
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useAuthStore, useEventStore, useNotificationStore, useSchoolStore } from '../store';
import { formatMoney } from '../format';
import EventPublishedCard from './EventPublishedCard.vue';
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
  apiLoadFinanceQueue,
  apiLoadPublishedEvents,
  apiManagerDecision,
  apiFinalDecision,
  apiGetEventResources,
  apiUpdateResourceCost,
  apiUpdateResourceLine,
  apiFinanceSubmit,
  apiGetResourceTypes,
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
  ClipboardList, BookOpen, Users, UserPlus, Check, XCircle, AlertCircle, RefreshCw, ShieldAlert,
  ChevronDown, ChevronUp, DollarSign, Wallet, ShieldCheck, Layers, Trash, Plus, X, Settings, GraduationCap
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const eventStore = useEventStore();
const notifStore = useNotificationStore();
const schoolStore = useSchoolStore();
const currency = computed(() => schoolStore.currency);

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
  return authStore.hasAnyRole(['parent', 'student', 'manager', 'school_admin', 'super_admin', 'teacher', 'finance', 'event_teacher']);
});

const user = computed(() => authStore.user || {});
const enrollments = ref([]);
const linkedChildren = ref([]);
const publishedEvents = ref([]);
const managerEvents = ref([]);
const financeEvents = ref([]);
const resourceTypes = ref([]);
const managerSubsidyDraft = reactive({});
const transitionReason = reactive({});

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

const canDeleteEvent = computed(() => {
  return authStore.hasAnyRole(['school_admin', 'super_admin', 'manager', 'teacher']);
});

const teacherClassId = ref(null);
const payments = reactive({});
const feedbacks = reactive({});
const feedbackForms = reactive({});
const showNotifs = ref(false);

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
  await loadFinanceQueue();
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

const loadFinanceQueue = async () => {
  try {
    const list = await apiLoadFinanceQueue();
    financeEvents.value = Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to load finance queue:', err);
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
    await apiUpdateEnrollmentApproval(enrollmentId, targetState);
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
  if (!confirm('Are you sure you want to publish this approved event? Students and parents will be notified.')) return;
  try {
    await apiPublishEvent(eventId);
    await eventStore.loadEvents();
    await loadPublishedEvents();
    alert('Event successfully published!');
  } catch (err) {
    alert(err.message || 'Failed to publish event');
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
  const reason = transitionReason[eventId] || '';
  if (decision === 'reject' && !reason.trim()) {
    alert('A rejection reason is required to return this event to draft.');
    return;
  }
  try {
    await apiManagerDecision(eventId, decision, reason);
    delete transitionReason[eventId];
    await eventStore.loadEvents();
    await loadManagerQueue();
    await loadPublishedEvents();
  } catch (err) {
    alert(err.message || 'Failed to submit manager decision');
  }
};

const handleManagerSubsidyOverride = async (ev, val) => {
  const subsidyNum = parseFloat(val || 0);
  try {
    await apiUpdateEventSubsidy(ev.id, subsidyNum);
    ev.school_subsidy = subsidyNum;
  } catch (err) {
    console.error('Failed to override subsidy:', err);
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
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

const toggleEventExpand = async (eventId) => {
  if (expandedEventIds.value.has(eventId)) {
    expandedEventIds.value.delete(eventId);
  } else {
    expandedEventIds.value.add(eventId);
    await loadEventResources(eventId);
  }
};

const getEventEstimatedRevenue = (ev) => {
  if (!ev || !ev.class_mappings) return 0;
  return ev.class_mappings.reduce((acc, m) => {
    return acc + (parseFloat(m.ticket_price || 0) * 0.8 * (m.student_count || 0));
  }, 0);
};

const getEventNetBalance = (ev) => {
  if (!ev) return 0;
  const revenue = getEventEstimatedRevenue(ev);
  const subsidy = parseFloat(ev.school_subsidy || 0);
  const cost = parseFloat(ev.total_cost || 0);
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

const filteredManagerHistoryEvents = computed(() => {
  const all = events.value || [];
  return all.filter(e => new Date(e.date) < new Date());
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
