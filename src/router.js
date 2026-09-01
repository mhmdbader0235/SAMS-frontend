import { createRouter, createWebHistory } from 'vue-router';
import AuthView from './components/AuthView.vue';
import HomeView from './components/HomeView.vue';
import CalendarView from './components/CalendarView.vue';
import UserProfileView from './components/UserProfileView.vue';
import ManageStructureView from './components/ManageStructureView.vue';
import ManageUsersView from './components/ManageUsersView.vue';
import EventPlanView from './components/EventPlanView.vue';
import ManageAdminView from './components/ManageAdminView.vue';
import ManagePermissionsView from './components/ManagePermissionsView.vue';
import SuperAdminPermissionMatrixView from './components/SuperAdminPermissionMatrixView.vue';
import UserClassView from './components/UserClassView.vue';
import EventDetailsView from './components/EventDetailsView.vue';
import keycloak from './keycloak';
import { useAuthStore } from './store';

// Two separate route groups, gated by the matching authStore getter (see
// store.js for the full rationale) rather than one combined admin-only set --
// a manager holding only user:create can reach /manage/users but must still
// be bounced from the Academic Administration Hub, and vice versa for a
// manager holding only level:create/class:create/class:update. Originally a
// single set scoped to just "teacher"; widened to require an admin role OR a
// matching granted permission for everyone else -- manager's real job is
// reviewing/pricing/publishing trips, not managing the school's academic
// structure or user accounts, and having sidebar links into a hub whose
// write actions the backend already refuses them is confusing, not
// convenient. This is presentation only: the real boundary is the backend
// (TenantService._has_intersection checks in tenant/service.py and the router
// guards in students/router.py), which independently rejects the same
// actions even if this list ever drifts. Keeping it here too means a
// disallowed viewer never sees the page at all, rather than seeing it and
// having every action inside it fail one at a time.
const ACADEMIC_HUB_ROUTE_NAMES = new Set([
  'structure', 'manage-structure', 'manage-placement', 'manage-enrollment', 'manage-ladder-wizard',
]);
const MANAGE_USERS_ROUTE_NAMES = new Set(['users', 'manage-users']);

// super_admin only -- strictly narrower than the two sets above, which both also let school_admin in. The Permission Control Center can grant or revoke super_admin itself and shows the full role-default matrix side by side with per-user overrides, so it is gated to super_admin alone, both here (presentation) and on the backend (TenantService.update_tenant_user_permissions already refuses a non-super_admin caller who tries to grant the super_admin role).
const SUPER_ADMIN_ONLY_ROUTE_NAMES = new Set(['super-admin-permissions']);

const routes = [
  {
    path: '/events/:id',
    name: 'event-details',
    component: EventDetailsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-class',
    name: 'my-class',
    component: UserClassView,
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'dashboard',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: CalendarView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: UserProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'users',
    component: ManageUsersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/structure',
    name: 'structure',
    component: ManageStructureView,
    meta: { requiresAuth: true }
  },
  {
    path: '/plan-event',
    name: 'plan-event-alias',
    component: EventPlanView,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage/structure',
    name: 'manage-structure',
    component: ManageStructureView,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage/placement',
    name: 'manage-placement',
    component: ManageStructureView,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage/enrollment',
    name: 'manage-enrollment',
    component: ManageStructureView,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage/ladder-wizard',
    name: 'manage-ladder-wizard',
    component: ManageStructureView,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage/users',
    name: 'manage-users',
    component: ManageUsersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage/plan-event',
    name: 'plan-event',
    component: EventPlanView,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage/permissions',
    name: 'manage-permissions',
    component: ManagePermissionsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/permissions',
    name: 'permissions-alias',
    component: ManagePermissionsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/permission-matrix',
    name: 'super-admin-permissions',
    component: SuperAdminPermissionMatrixView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: ManageAdminView,
    meta: { requiresAuth: true }
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('sd_token');
  const isKeycloakAuth = keycloak && keycloak.authenticated;
  const isAuthenticated = Boolean(token || isKeycloakAuth);

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth');
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/');
  } else if (isAuthenticated && (ACADEMIC_HUB_ROUTE_NAMES.has(to.name) || MANAGE_USERS_ROUTE_NAMES.has(to.name))) {
    // Best-effort only: authStore.user is populated asynchronously by
    // App.vue's onMounted -> fetchMe(), so on a hard reload landing directly
    // on one of these URLs, user may still be null at this exact instant --
    // this branch simply won't have anything to block yet. That gap is
    // covered by the matching watch(authStore.user, ...) redirect guard each
    // of these view components carries, which fires once fetchMe() resolves.
    // This check exists for the fast path (SPA navigation, user already
    // loaded), so a disallowed viewer never sees so much as a frame of the page.
    const authStore = useAuthStore();
    const isAllowed = ACADEMIC_HUB_ROUTE_NAMES.has(to.name)
      ? authStore.canAccessAcademicHub
      : authStore.canAccessManageUsers;
    if (authStore.user && !isAllowed) {
      next('/');
      return;
    }
    next();
  } else if (isAuthenticated && SUPER_ADMIN_ONLY_ROUTE_NAMES.has(to.name)) {
    const authStore = useAuthStore();
    if (authStore.user && !authStore.hasRole('super_admin')) {
      next('/');
      return;
    }
    next();
  } else {
    next();
  }
});

export default router;
