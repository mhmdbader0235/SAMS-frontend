import { defineStore } from 'pinia';
import {
  apiLogin,
  apiRegister,
  apiGetMe,
  apiGetProfile,
  apiUpdateProfile,
  apiLoadEvents,
  apiLoadNotifications,
  apiMarkNotificationRead,
  apiLoadLevels,
  apiLoadClasses,
  apiLoadTeachers,
  apiLoadStudents,
  apiGetStructureSetup,
  apiSaveStructureSetup,
  apiGetSchoolSetupState,
  apiGetSchoolProfile,
  apiUpdateSchoolProfile,
  apiUpsertSchoolCampus,
  apiCreateSchoolContact,
  apiUpdateSchoolContact,
  apiDeleteSchoolContact,
  apiCommitSchoolProfile,
  apiActivateSchool
} from './api';
import keycloak from './keycloak';

const CURRICULUM_SYSTEM_NAMES = {
  UK: 'UK National Curriculum',
  International: 'International Standard',
  Custom: 'Customer / Custom Standard'
};

// Natural grade ranking shared by every getter below (module-private, not exported —
// StructureClassesView.vue keeps its own copy for its search-filtered sort).
function getGradeRank(lvl) {
  const name = (lvl.name || '').trim().toLowerCase();
  if (name.includes('nursery') || name.includes('pre-k') || name.includes('kg 1') || name.includes('kg1') || name.includes('early years')) return 0;
  if (name.includes('kindergarten') || name.includes('kg 2') || name.includes('kg2') || name.includes('reception') || name === 'kg') return 0.5;
  const match = name.match(/(\d+)/);
  if (match && match[1]) return parseInt(match[1], 10);
  if (lvl.ordinal && typeof lvl.ordinal === 'number') return lvl.ordinal;
  return 999;
}

function compareGrades(a, b) {
  const rankA = getGradeRank(a);
  const rankB = getGradeRank(b);
  if (rankA !== rankB) return rankA - rankB;
  return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' });
}

const COMPOSITE_ROLE_PERMISSIONS = {
  super_admin: ['*'],
  admin: ['*'],
  school_admin: ['school:*', 'level:*', 'class:*', 'user:*', 'teacher:*', 'student:*', 'event:*', 'resource:*', 'enrollment:*', 'billing:audit', 'billing:invoice', 'subsidy:manage', 'health:*', 'safety:manage', 'announcement:manage', 'audit:view'],
  manager: ['school:read', 'level:read', 'class:read', 'teacher:read', 'parent:read', 'student:read', 'user:view', 'event:read', 'event:view', 'event:review', 'event:publish', 'event:view_draft', 'event:audience_predict', 'resource:view', 'resource:price', 'resource:set_cost', 'resource_type:read', 'billing:invoice', 'billing:pay', 'billing:refund', 'billing:audit', 'billing:view_payment', 'subsidy:manage', 'enrollment:view_roster', 'enrollment:read', 'announcement:manage', 'notification:send', 'feedback:view'],
  teacher: ['school:read', 'level:read', 'class:read', 'teacher:read', 'student:read', 'user:view', 'event:create', 'event:read', 'event:view', 'event:edit', 'event:patch', 'event:delete', 'event:clone', 'event:propose', 'event:submit', 'event:view_draft', 'event:audience_edit', 'event:audience_predict', 'resource:create', 'resource:view', 'resource:edit', 'resource:update', 'resource:delete', 'resource_type:create', 'resource_type:read', 'enrollment:teacher_approve', 'enrollment:view_roster', 'enrollment:read', 'health:view', 'notification:read', 'feedback:view', 'feedback:create'],
  parent: ['school:read', 'user:profile_read', 'user:profile_edit', 'student:view_linked', 'event:read', 'event:view', 'enrollment:parent_approve', 'enrollment:cancel', 'enrollment:read', 'billing:pay', 'billing:view_payment', 'health:manage_child', 'notification:read', 'feedback:create'],
  student: ['school:read', 'user:profile_read', 'user:profile_edit', 'event:read', 'event:view', 'enrollment:request', 'enrollment:read', 'notification:read', 'feedback:create'],
  finance: ['resource:price', 'billing:invoice', 'billing:pay', 'billing:refund', 'billing:audit', 'billing:view_payment', 'subsidy:manage', 'event:read']
};

function resolveCapabilities(roles, userPermissions) {
  const caps = new Set(userPermissions || []);
  for (const role of roles) {
    if (COMPOSITE_ROLE_PERMISSIONS[role]) {
      for (const p of COMPOSITE_ROLE_PERMISSIONS[role]) {
        caps.add(p);
      }
    }
  }
  return caps;
}

function matchPermission(caps, action) {
  if (caps.has('*')) return true;
  if (caps.has(action)) return true;
  const [domain] = action.split(':');
  if (caps.has(`${domain}:*`)) return true;
  return false;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('sd_token') || null,
    user: null,
    profile: null,
    loading: false,
    error: null,
    activePerspective: 'all', // 'all', 'teacher', 'parent', 'manager', 'finance', 'admin'
  }),
  getters: {
    activeRoles: (state) => {
      if (!state.user) return [];
      const roles = new Set(state.user.roles || []);
      if (state.user.role) roles.add(state.user.role);
      const all = Array.from(roles)
        .map(r => String(r).toLowerCase())
        .filter(r => !r.includes(':') && r !== '*');
      
      const realRoles = all.filter(r => r !== 'pending' && r !== 'none' && r !== 'unassigned');
      return realRoles.length > 0 ? realRoles : all;
    },
    hasMultipleRoles() {
      return this.activeRoles.length > 1;
    },
    capabilities() {
      return resolveCapabilities(this.activeRoles, this.user?.permissions || []);
    },
    can() {
      return (action) => {
        if (!this.user) return false;
        if (this.activeRoles.includes('super_admin') || this.activeRoles.includes('admin')) return true;
        return matchPermission(this.capabilities, action);
      };
    },
    hasRole: (state) => (role) => {
      if (!state.user) return false;
      const userRoles = (state.user.roles || [state.user.role]).map(r => String(r || '').toLowerCase());
      const primaryRole = String(state.user.role || '').toLowerCase();
      if (userRoles.includes('super_admin') || primaryRole === 'super_admin') {
        return true;
      }
      const targetRole = String(role || '').toLowerCase();
      if (targetRole === 'school_admin' || targetRole === 'admin') {
        return userRoles.includes('school_admin') || userRoles.includes('admin') || primaryRole === 'school_admin' || primaryRole === 'admin';
      }
      return userRoles.includes(targetRole) || primaryRole === targetRole;
    },
    hasAnyRole(state) {
      return (rolesArray) => {
        return rolesArray.some(role => this.hasRole(role));
      };
    }
  },
  actions: {
    setActivePerspective(mode) {
      this.activePerspective = mode;
    },
    async login({ email, password, tenant_id }) {
      this.loading = true;
      this.error = null;
      try {
        const token = await apiLogin({ email, password, tenant_id });
        this.token = token;
        localStorage.setItem('sd_token', token);
        await this.fetchMe();
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async register({ email, password, tenant_id, role, invite_code }) {
      this.loading = true;
      this.error = null;
      try {
        const token = await apiRegister({ email, password, tenant_id, role, invite_code });
        this.token = token;
        localStorage.setItem('sd_token', token);
        await this.fetchMe();
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchMe() {
      if (!this.token && !(keycloak && keycloak.authenticated)) return;
      try {
        const data = await apiGetMe();
        this.user = data;
        await this.fetchProfile();
      } catch (err) {
        if (err?.status === 401 || err?.response?.status === 401) {
          console.warn('Authentication token expired or unauthorized:', err);
          this.logout();
        } else {
          console.warn('Could not load user me context:', err);
        }
      }
    },
    async fetchProfile() {
      try {
        const data = await apiGetProfile();
        this.profile = data;
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    },
    async updateProfile(payload) {
      this.loading = true;
      try {
        await apiUpdateProfile(payload);
        await this.fetchProfile();
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      this.profile = null;
      localStorage.removeItem('sd_token');
      sessionStorage.clear();
      if (keycloak && (keycloak.authenticated || keycloak.token)) {
        keycloak.logout({ redirectUri: window.location.origin + '/auth' });
      } else {
        window.location.href = '/auth';
      }
    }
  }
});

export const useEventStore = defineStore('events', {
  state: () => ({
    events: [],
    loading: false,
    error: null,
  }),
  actions: {
    async loadEvents() {
      this.loading = true;
      this.error = null;
      try {
        const data = await apiLoadEvents();
        this.events = data;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
});

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    loading: false,
  }),
  actions: {
    async loadNotifications() {
      this.loading = true;
      try {
        const data = await apiLoadNotifications();
        this.notifications = data;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async markAsRead(notifId) {
      try {
        await apiMarkNotificationRead(notifId);
        this.notifications = this.notifications.filter(n => n.id !== notifId);
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Shared "live structure" data (grades, classes, teachers, students) and the
// curriculum/ladder setup, used by StructureClassesView, StudentPlacementView,
// LadderWizardView, and the ManageStructureView shell. Centralizing this here
// (instead of component-local state) is what keeps tab-switching between those
// three instant with zero refetch, matching the pre-split behavior.
export const useStructureStore = defineStore('structure', {
  state: () => ({
    liveLevels: [],
    liveClasses: [],
    teachersList: [],
    allStudentsList: [],
    liveStructureLoaded: false,
    liveStructureLoading: false,
    _liveStructurePromise: null,

    curriculumSetup: null,
    curriculumSetupLoaded: false,
    _curriculumSetupPromise: null,

    // Unsaved wizard selection — lets the header badge live-preview a system
    // change before Save, matching the original single-component behavior.
    draftSystem: null,
  }),
  getters: {
    sortedLevelsByOrdinal: (state) => [...state.liveLevels].sort(compareGrades),
    getClassesForLevel: (state) => (levelId) =>
      state.liveClasses
        .filter(c => c.level_id === levelId)
        .sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })),
    assignedStudentsCount: (state) => state.allStudentsList.filter(s => !!s.class_id).length,
    unassignedStudentsCount: (state) => state.allStudentsList.filter(s => !s.class_id).length,
    currentSystemId: (state) => {
      const id = state.draftSystem || state.curriculumSetup?.system;
      return ['UK', 'International', 'Custom'].includes(id) ? id : 'UK';
    },
    currentSystemName() {
      return CURRICULUM_SYSTEM_NAMES[this.currentSystemId];
    },
  },
  actions: {
    async ensureLiveStructureLoaded(force = false) {
      if (this.liveStructureLoaded && !force) return;
      if (this._liveStructurePromise && !force) return this._liveStructurePromise;

      this.liveStructureLoading = true;
      this._liveStructurePromise = (async () => {
        try {
          const [lvls, clss, tchs, stds] = await Promise.all([
            apiLoadLevels(),
            apiLoadClasses(),
            apiLoadTeachers(),
            apiLoadStudents()
          ]);
          this.liveLevels = lvls || [];
          this.liveClasses = clss || [];
          this.teachersList = tchs || [];
          this.allStudentsList = stds || [];
          this.liveStructureLoaded = true;
        } catch (err) {
          console.warn('Could not load live structure:', err);
        } finally {
          this.liveStructureLoading = false;
          this._liveStructurePromise = null;
        }
      })();
      return this._liveStructurePromise;
    },
    async reloadLiveStructure() {
      return this.ensureLiveStructureLoaded(true);
    },
    async ensureCurriculumSetupLoaded(force = false) {
      if (this.curriculumSetupLoaded && !force) return this.curriculumSetup;
      if (this._curriculumSetupPromise && !force) return this._curriculumSetupPromise;

      this._curriculumSetupPromise = (async () => {
        try {
          const data = await apiGetStructureSetup();
          this.curriculumSetup = data || null;
          this.curriculumSetupLoaded = true;
          return this.curriculumSetup;
        } catch (err) {
          console.warn('Could not load curriculum setup:', err);
          return null;
        } finally {
          this._curriculumSetupPromise = null;
        }
      })();
      return this._curriculumSetupPromise;
    },
    async saveCurriculumSetup(payload) {
      await apiSaveStructureSetup(payload);
      await this.ensureCurriculumSetupLoaded(true);
      await this.reloadLiveStructure();
      this.draftSystem = null;
    },
    setDraftCurriculumSystem(id) {
      this.draftSystem = id;
    },
  }
});

// Day-1 onboarding: setup progress + the school_profile/campus/contacts bundle.
// Mirrors useStructureStore's ensure*Loaded(force) + _promise de-dupe pattern
// so the onboarding wizard, the App.vue gate, and the post-activation
// checklist card can all request the same data without triggering refetches.
export const useSchoolStore = defineStore('school', {
  state: () => ({
    setupState: null,
    setupStateLoaded: false,
    _setupStatePromise: null,

    profile: null,
    profileLoaded: false,
    _profilePromise: null,
  }),
  getters: {
    isLive: (state) => state.setupState?.status === 'live',
    currency: (state) => state.profile?.currency || 'JOD',
    displayName: (state) => state.profile?.display_name || 'SchoolDesk',
  },
  actions: {
    async ensureSetupStateLoaded(force = false) {
      if (this.setupStateLoaded && !force) return this.setupState;
      if (this._setupStatePromise && !force) return this._setupStatePromise;

      this._setupStatePromise = (async () => {
        try {
          const data = await apiGetSchoolSetupState();
          this.setupState = data;
          this.setupStateLoaded = true;
          return this.setupState;
        } catch (err) {
          console.warn('Could not load school setup state:', err);
          return null;
        } finally {
          this._setupStatePromise = null;
        }
      })();
      return this._setupStatePromise;
    },
    async reloadSetupState() {
      return this.ensureSetupStateLoaded(true);
    },
    async ensureProfileLoaded(force = false) {
      if (this.profileLoaded && !force) return this.profile;
      if (this._profilePromise && !force) return this._profilePromise;

      this._profilePromise = (async () => {
        try {
          const data = await apiGetSchoolProfile();
          this.profile = data;
          this.profileLoaded = true;
          return this.profile;
        } catch (err) {
          console.warn('Could not load school profile:', err);
          return null;
        } finally {
          this._profilePromise = null;
        }
      })();
      return this._profilePromise;
    },
    async updateProfile(payload) {
      const updated = await apiUpdateSchoolProfile(payload);
      this.profile = updated;
      this.profileLoaded = true;
      return updated;
    },
    async upsertCampus(payload) {
      await apiUpsertSchoolCampus(payload);
      return this.ensureProfileLoaded(true);
    },
    async createContact(payload) {
      await apiCreateSchoolContact(payload);
      return this.ensureProfileLoaded(true);
    },
    async updateContact(contactId, payload) {
      await apiUpdateSchoolContact(contactId, payload);
      return this.ensureProfileLoaded(true);
    },
    async deleteContact(contactId) {
      await apiDeleteSchoolContact(contactId);
      return this.ensureProfileLoaded(true);
    },
    async commitProfile() {
      const updated = await apiCommitSchoolProfile();
      this.profile = updated;
      await this.reloadSetupState();
      return updated;
    },
    async activate() {
      const updated = await apiActivateSchool();
      this.profile = updated;
      await this.reloadSetupState();
      return updated;
    },
  }
});
