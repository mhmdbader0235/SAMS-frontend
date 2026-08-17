/**
 * API client unit tests (Vitest).
 *
 * Mocks axios at the module level so no HTTP requests are made.
 * Verifies that each API function sends the correct method, URL, and payload.
 */

import { describe, it, expect, vi } from 'vitest';

// ─── Mock axios ───────────────────────────────────────────────────────────────
vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: { create: vi.fn(() => mockInstance), ...mockInstance },
  };
});

// Import AFTER mock is set up
import axios from 'axios';
import {
  apiLoadTenants,
  apiLogin,
  apiRegister,
  apiLoadEvents,
  apiCreateEvent,
  apiDeleteEvent,
  apiCreateEnrollment,
  apiLoadEnrollments,
  apiUpdateEnrollmentApproval,
  apiGetPayment,
  apiPayEnrollment,
} from '../api.js';

const mockApi = axios.create();

describe('apiLoadTenants', () => {
  it('sends GET /api/v1/auth/tenants', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { tenants: ['tenant_a'] } });
    const result = await apiLoadTenants();
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/auth/tenants');
    expect(result).toEqual(['tenant_a']);
  });
});

describe('apiLogin', () => {
  it('sends POST /api/v1/auth/login with credentials', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { access_token: 'tok' } });
    const token = await apiLogin({ email: 'a@b.com', password: 'pass', tenant_id: 'tenant_a' });
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/auth/login', {
      email: 'a@b.com', password: 'pass', tenant_id: 'tenant_a',
    });
    expect(token).toBe('tok');
  });
});

describe('apiRegister', () => {
  it('sends POST /api/v1/auth/register with all fields', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { access_token: 'reg-tok' } });
    await apiRegister({ email: 'x@y.com', password: 'p', tenant_id: 'tenant_b', role: 'teacher', invite_code: 'CODE' });
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/auth/register', expect.objectContaining({
      role: 'teacher', invite_code: 'CODE',
    }));
  });
});

describe('apiLoadEvents', () => {
  it('sends GET /api/v1/events', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { events: [{ id: 1, title: 'Science Day' }] } });
    const events = await apiLoadEvents();
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/events');
    expect(events).toEqual([{ id: 1, title: 'Science Day' }]);
  });
});

describe('apiCreateEvent', () => {
  it('sends POST /api/v1/events with payload', async () => {
    const payload = { title: 'Sports Day', description: 'Fun day', date: '2026-07-16T12:00:00Z', class_mappings: [] };
    mockApi.post.mockResolvedValueOnce({ data: payload });
    await apiCreateEvent(payload);
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/events', payload);
  });
});

describe('apiDeleteEvent', () => {
  it('sends DELETE /api/v1/events/:id', async () => {
    mockApi.delete.mockResolvedValueOnce({});
    await apiDeleteEvent(101);
    expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/events/101');
  });
});

describe('apiCreateEnrollment', () => {
  it('sends POST /api/v1/students/enrollments with student_id and map_id', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { id: 12, state: 'requested_by_student' } });
    const payload = { student_id: 5, event_class_map_id: 10 };
    const res = await apiCreateEnrollment(payload);
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/students/enrollments', payload);
    expect(res).toEqual({ id: 12, state: 'requested_by_student' });
  });
});

describe('apiLoadEnrollments', () => {
  it('sends GET /api/v1/students/enrollments', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [{ id: 12 }] });
    const res = await apiLoadEnrollments();
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/students/enrollments');
    expect(res).toEqual([{ id: 12 }]);
  });
});

describe('apiUpdateEnrollmentApproval', () => {
  it('sends POST /api/v1/students/enrollments/:id/approve with state', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { id: 12, state: 'approved_by_teacher' } });
    const res = await apiUpdateEnrollmentApproval(12, { state: 'approved_by_teacher' });
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/students/enrollments/12/approve', { state: 'approved_by_teacher' });
    expect(res.state).toBe('approved_by_teacher');
  });
});

describe('apiGetPayment', () => {
  it('sends GET /api/v1/events/enrollments/:id/payment', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { status: 'pending', amount: 10.0 } });
    const res = await apiGetPayment(12);
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/events/enrollments/12/payment');
    expect(res.amount).toBe(10.0);
  });
});

describe('apiPayEnrollment', () => {
  it('sends POST /api/v1/events/enrollments/:id/pay', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { status: 'paid' } });
    const res = await apiPayEnrollment(12);
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/events/enrollments/12/pay');
    expect(res.status).toBe('paid');
  });
});
