import api from '../api/axios';

const tteService = {
  getAntrian : (params = {}) => api.get('/api/tte/antrian', { params }),
  getRiwayat : (params = {}) => api.get('/api/tte/riwayat', { params }),
  getDetail  : (id)          => api.get(`/api/tte/${id}`),
  approve    : (id, data)    => api.post(`/api/tte/${id}/approve`, data),
  reject     : (id, data)    => api.post(`/api/tte/${id}/reject`, data),
};

export default tteService;
