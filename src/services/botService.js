import botApi from '../api/botAxios';

const botService = {
  // ── Status & Dashboard ─────────────────────────────────
  getStatus: ()        => botApi.get('/status'),
  getStats: ()         => botApi.get('/stats'),

  // ── Bot Control ────────────────────────────────────────
  restartBot: ()       => botApi.post('/restart'),
  disconnectBot: ()    => botApi.post('/disconnect'),

  // ── Messages ───────────────────────────────────────────
  getMessages: (p)     => botApi.get('/messages', { params: p }),
  deleteMessage: (id)  => botApi.delete(`/messages/${id}`),
  clearMessages: ()    => botApi.delete('/messages'),

  // ── Contacts ───────────────────────────────────────────
  getContacts: ()      => botApi.get('/contacts'),
  updateContact: (id, d) => botApi.put(`/contacts/${id}`, d),
  deleteContact: (id)  => botApi.delete(`/contacts/${id}`),

  // ── Menu ───────────────────────────────────────────────
  getMenu: ()          => botApi.get('/menu'),
  createMenu: (d)      => botApi.post('/menu', d),
  updateMenu: (id, d)  => botApi.put(`/menu/${id}`, d),
  toggleMenu: (id)     => botApi.patch(`/menu/${id}/toggle`),
  deleteMenu: (id)     => botApi.delete(`/menu/${id}`),

  // ── Broadcast ──────────────────────────────────────────
  getBroadcasts: ()    => botApi.get('/broadcasts'),
  sendBroadcast: (d)   => botApi.post('/broadcasts', d),
  deleteBroadcast: (id)=> botApi.delete(`/broadcasts/${id}`),


  // ── Admin Bot (role management) ────────────────────────────
  getAdmins     : ()       => botApi.get('/admin'),
  createAdmin   : (d)      => botApi.post('/admin', d),
  updateAdmin   : (id, d)  => botApi.put(`/admin/${id}`, d),
  toggleAdmin   : (id)     => botApi.patch(`/admin/${id}/toggle`),
  deleteAdmin   : (id)     => botApi.delete(`/admin/${id}`),
  checkAkses    : (p)      => botApi.get('/admin/check', { params: p }),
  // ── Settings ───────────────────────────────────────────
  getSettings: ()      => botApi.get('/settings'),
  updateSettings: (d)  => botApi.put('/settings', d),
};

export default botService;
