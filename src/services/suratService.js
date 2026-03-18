import api from '../api/axios';

const suratService = {
  getJenis: () => api.get('/api/surat/jenis'),
  generate: (data) => api.post('/api/surat/generate', data),
  getRiwayat: (params = {}) => api.get('/api/surat/riwayat', { params }),
};

export default suratService;
