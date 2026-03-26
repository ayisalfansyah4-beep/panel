import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
});

// Request interceptor — tambahkan JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle error global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
        toast.error('Sesi habis. Silakan login kembali.');
      } else if (status === 403) {
        toast.error('Akses ditolak.');
      } else if (status === 404) {
        toast.error(data?.message || 'Data tidak ditemukan.');
      } else if (status >= 500) {
        toast.error('Server error. Coba lagi nanti.');
      }
    } else if (error.request) {
      toast.error('Tidak dapat terhubung ke server. Periksa koneksi.');
    }
    return Promise.reject(error);
  }
);

export default api;
