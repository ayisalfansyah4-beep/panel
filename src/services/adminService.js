import api from '../api/axios';

const adminService = {
  getDashboard: () => api.get('/api/admin/dashboard'),

  // API Keys
  getApiKeys: () => api.get('/api/admin/api-keys'),
  createApiKey: (data) => api.post('/api/admin/api-keys', data),
  updateApiKey: (id, data) => api.put(`/api/admin/api-keys/${id}`, data),
  deleteApiKey: (id) => api.delete(`/api/admin/api-keys/${id}`),

  // Nomor Surat
  getNomorSurat: () => api.get('/api/admin/nomor-surat'),
  resetNomorSurat: (jenis, tahun) => api.delete(`/api/admin/nomor-surat/${jenis}/${tahun}`),

  // Log API
  getApiLogs: (params = {}) => api.get('/api/admin/api-logs', { params }),
};

export default adminService;
