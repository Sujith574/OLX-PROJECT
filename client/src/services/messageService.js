import API from './api';

export const getOrCreateConversation = (data) => API.post('/messages/conversation', data);
export const getMyConversations = () => API.get('/messages/conversations');
export const getMessages = (conversationId, params) => API.get(`/messages/${conversationId}`, { params });
export const sendMessage = (conversationId, data) => API.post(`/messages/${conversationId}`, data);
export const getNotifications = () => API.get('/notifications');
export const markAllRead = () => API.put('/notifications/read-all');
export const markOneRead = (id) => API.put(`/notifications/${id}/read`);
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);
