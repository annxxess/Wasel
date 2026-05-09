import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3500/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('wasel_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Orders ───────────────────────────────
export const ordersAPI = {
  create:     (data)   => api.post('/orders', data),
  getMyOrders: ()      => api.get('/orders/my'),
  getOne:     (id)     => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getAvailable: ()     => api.get('/orders/available'),     // for drivers
  accept:     (id)     => api.patch(`/orders/${id}/accept`),
};

// ── Admin ────────────────────────────────
export const adminAPI = {
  getStats:    ()              => api.get('/admin/stats'),
  getUsers:    (params)        => api.get('/admin/users', { params }),
  getDrivers:  (params)        => api.get('/admin/drivers', { params }),
  getOrders:   (params)        => api.get('/admin/orders', { params }),
  getStores:   (params)        => api.get('/admin/stores', { params }),
  toggleStatus: (id, type)    => api.patch(`/admin/toggle/${type}/${id}`),
  verifyDriver: (id)           => api.patch(`/admin/drivers/${id}/verify`),
  getRevenue:  (params)        => api.get('/admin/revenue', { params }),
};

// ── Stores ───────────────────────────────
export const storesAPI = {
  getAll:   (params)     => api.get('/stores', { params }),
  getOne:   (id)         => api.get(`/stores/${id}`),
  create:   (data)       => api.post('/stores', data),
  update:   (id, data)   => api.put(`/stores/${id}`, data),
  toggle:   (id)         => api.patch(`/stores/${id}/toggle`),
  getMyStore: ()         => api.get('/stores/mine'),
  getStats:   ()         => api.get('/stores/mine/stats'),
  getOrders:  (params)   => api.get('/stores/mine/orders', { params }),
  updateOrder: (id, status) => api.patch(`/stores/mine/orders/${id}`, { status }),
};

// ── Drivers ──────────────────────────────
export const driverAPI = {
  getProfile:    ()       => api.get('/drivers/profile'),
  updateLocation: (loc)  => api.patch('/drivers/location', loc),
  toggleOnline:  ()      => api.patch('/drivers/toggle-online'),
  getMyOrders:   ()      => api.get('/drivers/orders'),
  getEarnings:   ()      => api.get('/drivers/earnings'),
};

// ── Reviews ──────────────────────────────
export const reviewsAPI = {
  getPublic: ()     => api.get('/admin/public-reviews'),
  submit:    (data) => api.post('/admin/reviews', data),
};

export default api;