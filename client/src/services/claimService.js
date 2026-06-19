import API from './api';

export const submitClaim = (data) => API.post('/claims', data);
export const getReceivedClaims = () => API.get('/claims/received');
export const getMyClaims = () => API.get('/claims/my');
export const updateClaimStatus = (id, data) => API.put(`/claims/${id}`, data);
