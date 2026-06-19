import API from './api';

export const getAnalytics = () => API.get('/admin/analytics');
export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const toggleBanUser = (id) => API.put(`/admin/users/${id}/ban`);
export const getAdminItems = (params) => API.get('/admin/items', { params });
export const getAdminClaims = (params) => API.get('/admin/claims', { params });
export const getReports = () => API.get('/reports');
export const updateReport = (id, data) => API.put(`/reports/${id}`, data);
export const submitReport = (data) => API.post('/reports', data);
