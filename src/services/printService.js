import api from '../api/axios';

const printService = {
  upload: (formData) => api.post('/api/print', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getLogs: (params = {}) => api.get('/api/print/logs', { params }),
  getByToken: (token) => api.get(`/api/print/token/${token}`),
  deleteToken: (token) => api.delete(`/api/print/token/${token}`),
};

export default printService;
