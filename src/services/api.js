// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL || 'http://127.0.0.1:8000';
const PUBLIC_CACHE_PREFIX = 'lbi_public_cache:';
const publicRequestCache = new Map();

const isBrowserReload = () => {
  const navigation = typeof performance !== 'undefined' && performance.getEntriesByType
    ? performance.getEntriesByType('navigation')[0]
    : null;
  return navigation?.type === 'reload';
};

if (isBrowserReload() && typeof sessionStorage !== 'undefined') {
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(PUBLIC_CACHE_PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
}

const readPublicCache = (key) => {
  try {
    const cached = sessionStorage.getItem(`${PUBLIC_CACHE_PREFIX}${key}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const writePublicCache = (key, value) => {
  try {
    sessionStorage.setItem(`${PUBLIC_CACHE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private browsing; the API remains usable.
  }
};

/**
 * Format image URL with full host URL if relative storage path is returned
 */
export const resolveImageUrl = (path, fallback = null) => {
  if (!path || typeof path !== 'string' || path.trim() === '') return fallback;
  const clean = path.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:image/')) return clean;

  // If path doesn't contain a slash or dot extension, it is likely a tag/name/identifier, not an image file
  if (!clean.includes('/') && !/\.(png|jpe?g|webp|svg|gif|ico)$/i.test(clean)) {
    return fallback;
  }

  if (clean.startsWith('/')) return `${STORAGE_BASE_URL}${clean}`;
  return `${STORAGE_BASE_URL}/${clean}`;
};

/**
 * Helper to get active JWT/Sanctum auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('lbi_auth_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('lbi_auth_token', token);
  } else {
    localStorage.removeItem('lbi_auth_token');
  }
};

/**
 * Generic API request wrapper with auth token support & clean error handling
 */
async function fetchApi(endpoint, options = {}) {
  try {
    const token = getAuthToken();
    const headers = {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `API error: ${res.status}`;
      return { success: false, status: res.status, message: errorMsg, errors: data.errors || null };
    }

    return data;
  } catch (err) {
    console.warn(`[API] Failed to fetch ${endpoint}:`, err.message);
    return { success: false, message: err.message };
  }
}

function fetchCachedPublic(endpoint, cacheKey) {
  const cached = readPublicCache(cacheKey);
  if (cached) return Promise.resolve(cached);
  if (publicRequestCache.has(cacheKey)) return publicRequestCache.get(cacheKey);

  const request = fetchApi(endpoint)
    .then((response) => {
      if (response?.success) writePublicCache(cacheKey, response);
      return response;
    })
    .finally(() => publicRequestCache.delete(cacheKey));

  publicRequestCache.set(cacheKey, request);
  return request;
}

export const getCachedLandingOverview = () => readPublicCache('landing-overview')?.data || null;

export const api = {
  // 1. Authentication
  login: (credentials) =>
    fetchApi('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    fetchApi('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }),

  getMe: () => fetchApi('/auth/me'),

  logout: () =>
    fetchApi('/auth/logout', {
      method: 'POST',
    }),

  // 2. Public Landing Page Data
  getLandingOverview: () => fetchCachedPublic('/public/landing/overview', 'landing-overview'),
  getSliders: () => fetchApi('/public/landing/sliders'),
  getBanners: (category = '') => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return fetchCachedPublic(`/public/landing/banners${query}`, `banners:${category || 'all'}`);
  },
  getPartners: () => fetchApi('/public/landing/partners'),

  // 3. Services / Programs Catalog
  getServices: (search = '', perPage = 75) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('per_page', perPage);
    return fetchApi(`/public/services?${params.toString()}`);
  },
  getServicesNavMenu: () => fetchCachedPublic('/public/services/nav-menu', 'services-nav-menu'),
  getServiceBySlug: (slug) => fetchApi(`/public/services/${slug}`),
  getCourseBySlug: (slug) => fetchApi(`/public/courses/${slug}`),
  getCourseCatalogs: () => fetchApi('/public/course-catalogs'),
  getCourseLevelsByCatalog: (catalogId) => fetchApi(`/public/courses/${catalogId}/levels`),
  submitLanguageTestEnrollment: (data) =>
    fetchApi('/public/enrollments/testing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // 4. Posts / Blog
  getPosts: (category = '', page = 1, perPage = 8) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (page > 1) params.append('page', page);
    params.append('per_page', perPage);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchCachedPublic(`/public/posts${query}`, `posts:${category || 'all'}:${page}:${perPage}`);
  },
  getPostBySlug: (slug) => fetchApi(`/public/posts/${slug}`),

  // 5. Course Schedules & Terms (Public & for Enrollment)
  getScheduleMasterOptions: () => fetchApi('/public/schedules/master-options'),
  getTerms: (program = '') => {
    const query = program ? `?program=${program}` : '';
    return fetchApi(`/public/terms${query}`);
  },
  getCourseFee: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.append(key, value);
    });
    return fetchApi(`/public/course-fees?${params.toString()}`);
  },
  getSchedules: (division = '', openOnly = false, termId = null) => {
    const params = new URLSearchParams();
    if (division) params.append('division', division);
    if (openOnly) params.append('open', '1');
    if (termId) params.append('term_id', termId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi(`/public/schedules${query}`);
  },
  getScheduleById: (id) => fetchApi(`/public/schedules/${id}`),
  getScheduleBySlug: (slug) => fetchApi(`/public/schedules/course/${slug}`),

  // 6. Course Registration / Enrollment per Program
  submitEnrollment: (data) =>
    fetchApi('/public/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  submitProgramEnrollment: (program, data) =>
    fetchApi(`/public/enrollments/program/${program}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  submitPpbEnrollment: (data) => {
    const isMultipart = typeof FormData !== 'undefined' && data instanceof FormData;
    return fetchApi('/public/enrollments/ppb', {
      method: 'POST',
      headers: isMultipart ? {} : { 'Content-Type': 'application/json' },
      body: isMultipart ? data : JSON.stringify(data),
    });
  },
  submitBipaEnrollment: (data) => {
    const isMultipart = typeof FormData !== 'undefined' && data instanceof FormData;
    return fetchApi('/public/enrollments/bipa', {
      method: 'POST',
      headers: isMultipart ? {} : { 'Content-Type': 'application/json' },
      body: isMultipart ? data : JSON.stringify(data),
    });
  },
  submitPppEnrollment: (data) =>
    fetchApi('/public/enrollments/ppp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getEnrollmentById: (id) => fetchApi(`/public/enrollments/${id}`),

  // 7. Payment Confirmation Submission & Verification Check
  submitPaymentConfirmation: async (formData) => {
    try {
      const token = getAuthToken();
      const headers = {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_BASE_URL}/public/payments/confirm`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
  simulateXenditPayment: async (payload) => {
    try {
      const token = getAuthToken();
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_BASE_URL}/public/payments/xendit/simulate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
  simulateBniVaPayment: async (payload) => {
    try {
      const token = getAuthToken();
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_BASE_URL}/public/payments/bni-va/simulate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
  checkPaymentStatus: (id) => fetchApi(`/public/payments/${id}`),

  // 8. Student Portal (Protected with Sanctum token)
  getStudentDashboard: () => fetchApi('/student/dashboard'),
  getMyEnrollments: (page = 1, perPage = 15) =>
    fetchApi(`/student/my-enrollments?page=${page}&per_page=${perPage}`),
  getMyPayments: (page = 1, perPage = 15) =>
    fetchApi(`/student/my-payments?page=${page}&per_page=${perPage}`),
  getAvailableEnrollmentSchedules: (enrollmentId) => fetchApi(`/student/enrollments/${enrollmentId}/available-schedules`),
  selectEnrollmentSchedule: (enrollmentId, scheduleId) =>
    fetchApi(`/student/enrollments/${enrollmentId}/select-schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule_id: scheduleId }),
    }),
  updateStudentProfile: (profileData) =>
    fetchApi('/student/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    }),
  continueEnrollment: (enrollmentId, payload = {}) =>
    fetchApi(`/student/enrollments/${enrollmentId}/continue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  postponeEnrollment: (enrollmentId, reason) =>
    fetchApi(`/student/enrollments/${enrollmentId}/postpone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    }),
  transferEnrollment: (enrollmentId, data) =>
    fetchApi(`/student/enrollments/${enrollmentId}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // 9. System Health
  checkHealth: () => fetchApi('/health'),

  // 10. Term / Periode Akademik (public endpoint)
  getActiveTerms: (program = '') => {
    const q = program && program !== 'all' ? `?program=${encodeURIComponent(program)}` : '';
    return fetchApi(`/public/terms${q}`);
  },
};

export default api;
