import api from '../api/axios';

const authService = {
  login: async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password });
    return res.data;
  },
  me: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
