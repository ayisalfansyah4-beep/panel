import api from '../api/axios';

const pendudukService = {
  getAll: (params = {}) => api.get('/api/penduduk', { params }),
  getByNik: (nik) => api.get(`/api/penduduk/${nik}`),
  search: (params = {}) => api.get('/api/penduduk/search', { params }),
  getStatistik: () => api.get('/api/penduduk/statistik'),
  create: (data) => api.post('/api/penduduk', data),
  update: (nik, data) => api.put(`/api/penduduk/${nik}`, data),
  delete: (nik) => api.delete(`/api/penduduk/${nik}`),
};

export default pendudukService;
