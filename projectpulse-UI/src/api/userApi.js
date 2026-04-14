import api from './axios';

export const getMe = () => api.get('/users/me');
export const updateMe = (data) => api.put('/users/me', data);
export const changePassword = (data) => api.put('/users/me/change-password', data);
export const getAllUsers = () => api.get('/admin/users');