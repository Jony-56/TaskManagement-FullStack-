import api from './axios';

export const getChatHistory = (projectId, page = 1) =>
  api.get(`/projects/${projectId}/chat?page=${page}`);