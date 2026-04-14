import api from './axios';

export const getTasks = (projectId) => api.get(`/projects/${projectId}/tasks`);
export const getTask = (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`);
export const createTask = (projectId, data) => api.post(`/projects/${projectId}/tasks`, data);
export const updateTask = (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data);
export const updateTaskStatus = (projectId, taskId, data) => api.patch(`/projects/${projectId}/tasks/${taskId}/status`, data);
export const deleteTask = (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`);
export const addComment = (projectId, taskId, data) => api.post(`/projects/${projectId}/tasks/${taskId}/comments`, data); 