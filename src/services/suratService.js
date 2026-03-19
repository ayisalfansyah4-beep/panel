// suratService.js
import api from '../api/axios';

let _cache = null;
let _cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

const suratService = {
  getJenis: () => {
    if (_cache && Date.now() - _cachedAt < CACHE_TTL) {
      return Promise.resolve({ data: _cache });
    }
    return api.get('/api/surat/jenis').then(res => {
      _cache = res.data;
      _cachedAt = Date.now();
      return res;
    });
  },
  generate   : (data)        => api.post('/api/surat/generate', data),
  getRiwayat : (params = {}) => api.get('/api/surat/riwayat', { params }),
};

export default suratService;