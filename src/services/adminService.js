import api from '../api/axios';

const adminService = {
  getDashboard: () => api.get('/api/admin/dashboard'),

  // API Keys
  getApiKeys:   ()           => api.get('/api/admin/api-keys'),
  createApiKey: (data)       => api.post('/api/admin/api-keys', data),
  updateApiKey: (id, data)   => api.put(`/api/admin/api-keys/${id}`, data),
  deleteApiKey: (id)         => api.delete(`/api/admin/api-keys/${id}`),

  // Nomor Surat
  getNomorSurat:   ()             => api.get('/api/admin/nomor-surat'),
  resetNomorSurat: (jenis, tahun) => api.delete(`/api/admin/nomor-surat/${jenis}/${tahun}`),

  // Log API
  getApiLogs: (params = {}) => api.get('/api/admin/api-logs', { params }),

  // User Management
  getUsers:      ()         => api.get('/api/admin/users'),
  createUser:    (data)     => api.post('/api/admin/users', data),
  updateUser:    (id, data) => api.put(`/api/admin/users/${id}`, data),
  resetPassword: (id, data) => api.put(`/api/admin/users/${id}/reset-password`, data),
  toggleUser:    (id)       => api.put(`/api/admin/users/${id}/toggle`),
  deleteUser:    (id)       => api.delete(`/api/admin/users/${id}`),
};

export default adminService;
