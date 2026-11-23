// src/services/studentService.js
import api, { getAuthToken } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

async function authFetch(endpoint, options = {}) {
  try {
    const token = getAuthToken();
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: data.message || `API error: ${res.status}`,
        errors: data.errors || null,
      };
    }
    return data;
  } catch (err) {
    console.error(`[StudentService] Error on ${endpoint}:`, err);
    return { success: false, message: err.message };
  }
}

export const studentService = {
  /**
   * 1. Get student dashboard overview & analytics
   */
  getDashboard: () => authFetch('/student/dashboard'),

  /**
   * 2. Get list of student's enrollments
   */
  getMyEnrollments: (page = 1) => authFetch(`/student/my-enrollments?page=${page}`),

  /**
   * 3. Get list of student's payments
   */
  getMyPayments: (page = 1) => authFetch(`/student/my-payments?page=${page}`),

  /**
   * 4. Update student profile
   */
  updateProfile: (profileData) =>
    authFetch('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  /**
   * 5. Continue to next course/term (Fase 3D)
   */
  continueEnrollment: (enrollmentId, payload = {}) =>
    authFetch(`/student/enrollments/${enrollmentId}/continue`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /**
   * 6. Postpone enrollment (Fase 3D)
   */
  postponeEnrollment: (enrollmentId, reason) =>
    authFetch(`/student/enrollments/${enrollmentId}/postpone`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  /**
   * 7. Transfer course or schedule (Fase 3D)
   */
  transferEnrollment: (enrollmentId, transferData) =>
    authFetch(`/student/enrollments/${enrollmentId}/transfer`, {
      method: 'POST',
      body: JSON.stringify(transferData),
    }),
};

export default studentService;
