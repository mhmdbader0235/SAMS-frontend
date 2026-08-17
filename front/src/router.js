import { createRouter, createWebHistory } from 'vue-router';
import AuthView from './components/AuthView.vue';
import DashboardView from './components/DashboardView.vue';
import CalendarView from './components/CalendarView.vue';
import UserProfileView from './components/UserProfileView.vue';
import ManageStructureView from './components/ManageStructureView.vue';
import ManageUsersView from './components/ManageUsersView.vue';
import EventPlanView from './components/EventPlanView.vue';
import ManageAdminView from './components/ManageAdminView.vue';
import ManagePermissionsView from './components/ManagePermissionsView.vue';
import UserClassView from './components/UserClassView.vue';
import EventDetailsView from './components/EventDetailsView.vue';
import keycloak from './keycloak';


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
    component: DashboardView,
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
  } else {
    next();
  }
});

export default router;
