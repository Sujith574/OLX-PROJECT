import API from './api';

export const getItems = (params) => API.get('/items', { params });
export const getFeaturedItems = () => API.get('/items/featured');
export const getItemById = (id) => API.get(`/items/${id}`);
export const getMyItems = () => API.get('/items/my');
export const createItem = (data) => API.post('/items', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateItem = (id, data) => API.put(`/items/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteItem = (id) => API.delete(`/items/${id}`);
