import { defineStore } from 'pinia';
import { 
  apiLogin, 
  apiRegister, 
  apiGetMe, 
  apiGetProfile, 
  apiUpdateProfile, 
  apiLoadEvents, 
  apiLoadNotifications,
  apiMarkNotificationRead
} from './api';
import keycloak from './keycloak';

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
