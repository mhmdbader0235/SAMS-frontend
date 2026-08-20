/**
 * API client for the SchoolDesk backend.
 */

import axios from 'axios';
import keycloak from './keycloak';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9080';

const api = axios.create({ baseURL: BASE_URL });

let isRefreshingToken = null;

// ─── Request interceptor: attach Keycloak / local JWT ───────────────────────
api.interceptors.request.use(async (config) => {
  if (keycloak && keycloak.authenticated) {
    try {
      if (!isRefreshingToken) {
        isRefreshingToken = keycloak.updateToken(30).finally(() => {
          isRefreshingToken = null;
        });
      }
      await isRefreshingToken;
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    } catch (err) {
      console.warn('Failed to refresh Keycloak token', err);
    }
  } else {
    const token = localStorage.getItem('sd_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  const activeTenant = localStorage.getItem('sd_active_tenant');
  if (activeTenant) {
    config.headers['X-Tenant-ID'] = activeTenant;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ─── Response interceptor: unwrap data ───────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail || err.message || 'An error occurred';
    const wrapped = new Error(message);
    wrapped.status = err.response?.status;
    return Promise.reject(wrapped);
  }
);

// =============================================================================
// Auth
// =============================================================================
export async function apiLoadTenants() {
  const res = await api.get('/api/v1/auth/tenants');
  return res.data.tenants;
}

export async function apiGetInvitation(code) {
  const res = await api.get(`/api/v1/auth/invitations/${encodeURIComponent(code)}`);
  return res.data;
}

export async function apiRegister({ email, password, tenant_id, role, invite_code }) {
  const res = await api.post('/api/v1/auth/register', {
    email,
    password,
    tenant_id,
    role,
    invite_code,
  });
  return res.data.access_token;
}

export async function apiLogin({ email, password, tenant_id }) {
  const res = await api.post('/api/v1/auth/login', { email, password, tenant_id });
  return res.data.access_token;
}

export async function apiGetMe() {
  const res = await api.get('/api/v1/auth/me');
  return res.data;
}

export async function apiGetProfile() {
  const res = await api.get('/api/v1/auth/profile');
  return res.data;
}

export async function apiCreateInvitation({ tenant_id, role, target_email, max_uses = 1, valid_days = 7 }) {
  const res = await api.post('/api/v1/auth/invitations', {
    tenant_id,
    role,
    target_email,
    max_uses,
    valid_days,
  });
  return res.data;
}

export async function apiUpdateProfile(payload) {
  const res = await api.post('/api/v1/auth/profile', payload);
  return res.data;
}

export async function apiLoadUsersPermissions() {
  const res = await api.get('/api/v1/auth/users-permissions');
  return res.data;
}

export async function apiUpdateUserPermissions(userId, payload) {
  const res = await api.put(`/api/v1/auth/users/${userId}/permissions`, payload);
  return res.data;
}

export async function apiDeleteUser(userId) {
  const res = await api.delete(`/api/v1/auth/users/${userId}`);
  return res.data;
}

export async function apiGetRolesCatalog() {
  const res = await api.get('/api/v1/auth/roles-catalog');
  return res.data;
}

// =============================================================================
// Levels, Classes, Students
// =============================================================================

export async function apiLoadLevels() {
  const res = await api.get('/api/v1/students/levels');
  return res.data;
}

export async function apiCreateLevel(payload) {
  const res = await api.post('/api/v1/students/levels', payload);
  return res.data;
}

export async function apiUpdateLevel(levelId, payload) {
  const res = await api.put(`/api/v1/students/levels/${levelId}`, payload);
  return res.data;
}

export async function apiDeleteLevel(levelId) {
  const res = await api.delete(`/api/v1/students/levels/${levelId}`);
  return res.data;
}

export async function apiGetStructureSetup() {
  const res = await api.get('/api/v1/students/structure');
  return res.data;
}

export async function apiSaveStructureSetup(payload) {
  const res = await api.post('/api/v1/students/structure/setup', payload);
  return res.data;
}

export async function apiLoadTeachers() {
  const res = await api.get('/api/v1/students/teachers');
  return res.data;
}

export async function apiCreateTeacher(payload) {
  const res = await api.post('/api/v1/students/teachers', payload);
  return res.data;
}

export async function apiLoadParents() {
  const res = await api.get('/api/v1/students/parents');
  return res.data;
}

export async function apiLoadStudents() {
  const res = await api.get('/api/v1/students');
  return res.data;
}

export async function apiCreateStudent(payload) {
  const res = await api.post('/api/v1/students', payload);
  return res.data;
}

export async function apiLinkParentStudent(payload) {
  const res = await api.post('/api/v1/students/link-parent', {
    student_id: parseInt(payload.student_id),
    parent_id: parseInt(payload.parent_id),
  });
  return res.data;
}

export async function apiLoadLinkedStudents() {
  const res = await api.get('/api/v1/students/linked');
  return res.data;
}

export async function apiLoadClasses() {
  const res = await api.get('/api/v1/students/classes');
  return res.data;
}

export async function apiCreateClass(payload) {
  const res = await api.post('/api/v1/students/classes', payload);
  return res.data;
}

export async function apiUpdateClass(classId, payload) {
  const res = await api.put(`/api/v1/students/classes/${classId}`, payload);
  return res.data;
}

export async function apiDeleteClass(classId) {
  await api.delete(`/api/v1/students/classes/${classId}`);
}

export async function apiGetClassStudents(classId) {
  const res = await api.get(`/api/v1/students/classes/${classId}/students`);
  return res.data;
}

export async function apiAssignStudentToClass(classId, studentId) {
  const res = await api.put(`/api/v1/students/classes/${classId}/students/${studentId}`);
  return res.data;
}

export async function apiRemoveStudentFromClass(classId, studentId) {
  const res = await api.delete(`/api/v1/students/classes/${classId}/students/${studentId}`);
  return res.data;
}

export async function apiReassignStudentClass(studentId, classId) {
  const res = await api.put(`/api/v1/students/${studentId}/class`, { class_id: classId });
  return res.data;
}

export async function apiBulkAssignStudents(studentIds, classId) {
  const res = await api.post('/api/v1/students/bulk-enroll', { student_ids: studentIds, class_id: classId });
  return res.data;
}


export async function apiLoadCostBudgets() {
  const res = await api.get('/api/v1/events/cost-budgets');
  return res.data;
}

// =============================================================================
// Events & Budgets
// =============================================================================
export async function apiLoadEvents() {
  const res = await api.get('/api/v1/events');
  return res.data.events;
}

export async function apiGetEvent(eventId) {
  const res = await api.get(`/api/v1/events/${eventId}`);
  return res.data;
}

export async function apiCreateEvent(payload) {
  const res = await api.post('/api/v1/events', payload);
  return res.data;
}

export async function apiUpdateEvent(eventId, payload) {
  const res = await api.put(`/api/v1/events/${eventId}`, payload);
  return res.data;
}

export async function apiDeleteEvent(eventId) {
  await api.delete(`/api/v1/events/${eventId}`);
}

export async function apiCreateCostBudget(payload) {
  const res = await api.post('/api/v1/events/cost-budgets', payload);
  return res.data;
}

// =============================================================================
// Enrollments, Payments & Feedbacks
// =============================================================================
export async function apiCreateEnrollment(payload) {
  const res = await api.post('/api/v1/students/enrollments', payload);
  return res.data;
}

export async function apiLoadEnrollments() {
  const res = await api.get('/api/v1/students/enrollments');
  return res.data;
}

export async function apiCancelEnrollment(enrollmentId) {
  const res = await api.delete(`/api/v1/students/enrollments/${enrollmentId}`);
  return res.data;
}

export async function apiUpdateEnrollmentApproval(enrollmentId, payload) {
  const res = await api.post(`/api/v1/students/enrollments/${enrollmentId}/approve`, payload);
  return res.data;
}

export async function apiGetPayment(enrollmentId) {
  const res = await api.get(`/api/v1/events/enrollments/${enrollmentId}/payment`);
  return res.data;
}

export async function apiPayEnrollment(enrollmentId) {
  const res = await api.post(`/api/v1/events/enrollments/${enrollmentId}/pay`);
  return res.data;
}

export async function apiCreateFeedback(eventId, payload) {
  const res = await api.post(`/api/v1/events/${eventId}/feedbacks`, payload);
  return res.data;
}

export async function apiLoadFeedbacks(eventId) {
  const res = await api.get(`/api/v1/events/${eventId}/feedbacks`);
  return res.data;
}

// =============================================================================
// Notifications
// =============================================================================
export async function apiLoadNotifications() {
  const res = await api.get('/api/v1/notifications');
  return res.data.notifications;
}

export async function apiMarkNotificationRead(notifId) {
  const res = await api.post(`/api/v1/notifications/${notifId}/read`);
  return res.data;
}

// =============================================================================
// Event Workflow & Resources
// =============================================================================
export async function apiSaveEventAudience(eventId, classIds, classMappings = []) {
  const res = await api.post(`/api/v1/events/${eventId}/audience`, {
    class_ids: classIds,
    class_mappings: classMappings
  });
  return res.data;
}

export async function apiUpdateTicketPrices(eventId, mappings) {
  const res = await api.put(`/api/v1/events/${eventId}/ticket-prices`, mappings);
  return res.data;
}

export async function apiUpdateEventSubsidy(eventId, subsidy) {
  const res = await api.put(`/api/v1/events/${eventId}/subsidy`, { school_subsidy: subsidy });
  return res.data;
}

export async function apiGetAudiencePrediction(eventId, classIds) {
  const classIdsStr = classIds.join(',');
  const res = await api.get(`/api/v1/events/${eventId}/audience/prediction?class_ids=${classIdsStr}`);
  return res.data.predicted_attendance;
}

export async function apiGetResourceTypes(category) {
  const url = category ? `/api/v1/events/resource-types?category=${category}` : '/api/v1/events/resource-types';
  const res = await api.get(url);
  return res.data;
}

export async function apiCreateResourceType(payload) {
  const res = await api.post('/api/v1/events/resource-types', payload);
  return res.data;
}

export async function apiSaveEventResources(eventId, resources) {
  const res = await api.post(`/api/v1/events/${eventId}/resources`, resources);
  return res.data;
}

export async function apiGetEventResources(eventId) {
  const res = await api.get(`/api/v1/events/${eventId}/resources`);
  return res.data;
}

export async function apiSubmitEvent(eventId) {
  const res = await api.post(`/api/v1/events/${eventId}/submit`);
  return res.data;
}

export async function apiManagerDecision(eventId, decision, reason) {
  const res = await api.post(`/api/v1/events/${eventId}/manager-decision`, { decision, reason });
  return res.data;
}

export async function apiEventTeacherDecision(eventId, decision, reason) {
  const res = await api.post(`/api/v1/events/${eventId}/event-teacher-decision`, { decision, reason });
  return res.data;
}

export async function apiUpdateResourceLine(resourceId, payload) {
  const res = await api.patch(`/api/v1/events/resources/${resourceId}`, payload);
  return res.data;
}

export async function apiUpdateResourceCost(resourceId, payload) {
  const res = await api.put(`/api/v1/events/resources/${resourceId}/cost`, payload);
  return res.data;
}

export async function apiFinanceSubmit(eventId) {
  const res = await api.post(`/api/v1/events/${eventId}/finance-submit`);
  return res.data;
}

export async function apiFinalDecision(eventId, decision, reason) {
  const res = await api.post(`/api/v1/events/${eventId}/final-decision`, { decision, reason });
  return res.data;
}

export async function apiCloneEvent(eventId) {
  const res = await api.post(`/api/v1/events/${eventId}/clone`);
  return res.data;
}


export async function apiLoadManagerQueue() {
  const res = await api.get('/api/v1/events/manager-queue');
  return res.data.events;
}

export async function apiLoadFinanceQueue() {
  const res = await api.get('/api/v1/events/finance-queue');
  return res.data.events;
}

export async function apiLoadPublishedEvents() {
  const res = await api.get('/api/v1/events/published');
  return res.data;
}

export async function apiCreateManager(payload) {
  const res = await api.post('/api/v1/students/managers', payload);
  return res.data;
}

export async function apiCreateFinance(payload) {
  const res = await api.post('/api/v1/students/finance', payload);
  return res.data;
}

export async function apiPublishEvent(eventId) {
  const res = await api.post(`/api/v1/events/${eventId}/publish`);
  return res.data;
}

// =============================================================================
// School Setup (Day-1 Onboarding)
// =============================================================================
export async function apiGetSchoolSetupState() {
  const res = await api.get('/api/v1/school/setup-state');
  return res.data;
}

export async function apiGetSchoolProfile() {
  const res = await api.get('/api/v1/school/profile');
  return res.data;
}

export async function apiUpdateSchoolProfile(payload) {
  const res = await api.put('/api/v1/school/profile', payload);
  return res.data;
}

export async function apiUpsertSchoolCampus(payload) {
  const res = await api.post('/api/v1/school/campuses', payload);
  return res.data;
}

export async function apiLoadSchoolCampuses() {
  const res = await api.get('/api/v1/school/campuses');
  return res.data;
}

export async function apiCreateSchoolContact(payload) {
  const res = await api.post('/api/v1/school/contacts', payload);
  return res.data;
}

export async function apiLoadSchoolContacts() {
  const res = await api.get('/api/v1/school/contacts');
  return res.data;
}

export async function apiUpdateSchoolContact(contactId, payload) {
  const res = await api.put(`/api/v1/school/contacts/${contactId}`, payload);
  return res.data;
}

export async function apiDeleteSchoolContact(contactId) {
  const res = await api.delete(`/api/v1/school/contacts/${contactId}`);
  return res.data;
}

export async function apiCommitSchoolProfile() {
  const res = await api.post('/api/v1/school/setup/commit-profile');
  return res.data;
}

export async function apiActivateSchool() {
  const res = await api.post('/api/v1/school/setup/activate');
  return res.data;
}

export default api;

