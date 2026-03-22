import api from '../api/axios';

export const kegiatanService = {
  getAll:  (params = {}) => api.get('/api/kegiatan', { params }),
  getById: (id)           => api.get(`/api/kegiatan/${id}`),
  create:  (data)         => api.post('/api/kegiatan', data),
  update:  (id, data)     => api.put(`/api/kegiatan/${id}`, data),
  delete:  (id)           => api.delete(`/api/kegiatan/${id}`),
};

export const pengumumanService = {
  getAll:  (params = {}) => api.get('/api/pengumuman', { params }),
  create:  (data)        => api.post('/api/pengumuman', data),
  update:  (id, data)    => api.put(`/api/pengumuman/${id}`, data),
  delete:  (id)          => api.delete(`/api/pengumuman/${id}`),
};

export const apbdesService = {
  getAll:   (params = {}) => api.get('/api/apbdes', { params }),
  getTahun: ()            => api.get('/api/apbdes/tahun'),
  create:   (data)        => api.post('/api/apbdes', data),
  update:   (id, data)    => api.put(`/api/apbdes/${id}`, data),
  delete:   (id)          => api.delete(`/api/apbdes/${id}`),
};

export const profilService = {
  get:              ()       => api.get('/api/profil'),
  update:           (data)   => api.put('/api/profil', data),
  getPerangkat:     ()       => api.get('/api/profil/perangkat'),
  createPerangkat:  (data)   => api.post('/api/profil/perangkat', data),
  updatePerangkat:  (id, d)  => api.put(`/api/profil/perangkat/${id}`, d),
  deletePerangkat:  (id)     => api.delete(`/api/profil/perangkat/${id}`),
};
