import api from '../api/axios';

const tteService = {
  getAll:       (params = {}) => api.get('/api/tte', { params }),
  getById:      (id)          => api.get(`/api/tte/${id}`),
  upload:       (formData)    => api.post('/api/tte', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  approve:      (id, data)    => api.put(`/api/tte/${id}/approve`, data),
  tolak:        (id, data)    => api.put(`/api/tte/${id}/tolak`, data),
  getLogs:      (id)          => api.get(`/api/tte/${id}/logs`),
  getConfig:    ()            => api.get('/api/tte/config'),
  updateConfig: (data)        => api.put('/api/tte/config', data),
  remove:       (id)          => api.delete(`/api/tte/${id}`),
};

export default tteService;
