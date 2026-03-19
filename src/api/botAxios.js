import axios from 'axios';
import { toast } from 'react-toastify';

const botApi = axios.create({
  baseURL: import.meta.env.VITE_BOT_API_URL || '/api/bot',
  timeout: 30000,
});

botApi.interceptors.request.use((config) => {
  const key = localStorage.getItem('bot_api_key') || '';
  if (key) config.headers['X-Api-Key'] = key;
  return config;
});

botApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      const { status, data } = err.response;
      if (status === 401) {
        toast.error('API Key bot tidak valid. Perbarui di Pengaturan Bot.');
      } else if (status === 403) {
        toast.error('Akses ditolak oleh server bot.');
      } else if (status >= 500) {
        toast.error('Server bot error. Coba lagi nanti.');
      } else {
        toast.error(data?.message || `Error ${status}`);
      }
    } else if (err.request) {
      toast.error('Tidak dapat terhubung ke server bot. Periksa koneksi.');
    }
    return Promise.reject(err);
  }
);

export default botApi;
