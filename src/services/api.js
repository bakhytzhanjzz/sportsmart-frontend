import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor для добавления JWT токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor для обработки 401 ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// services/api.js
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (data) => {
    const payload = {
      email: data.email,
      username: data.username,
      password: data.password
    }
    return api.post('/api/auth/register', payload)
  },
}


export const stepsAPI = {
  uploadSteps: (data, idempotencyKey) => 
    api.post('/api/steps/upload', data, {
      headers: { 'Idempotency-Key': idempotencyKey }
    }),
  getDailySteps: (from, to) => 
    api.get('/api/steps/daily', { params: { from, to } }),
  getHistory: (days = 30) => 
    api.get('/api/steps/history', { params: { days } }),
  getFriendsLeaderboard: (date, top = 10) => 
    api.get('/api/steps/leaderboard/friends', { params: { date, top } }),
  getGroupLeaderboard: (groupId, date, top = 10) => 
    api.get(`/api/steps/leaderboard/groups/${groupId}`, { params: { date, top } }),
};

export const groupsAPI = {
  getGroups: () => api.get('/api/groups'),

  createGroup: ({ name, description = '', isPrivate = false }) =>
    api.post('/api/groups', null, { params: { name, description, isPrivate } }),

  inviteToGroup: (groupId, username) =>
    api.post(`/api/groups/${groupId}/invite/${username}`),

  respondToInvitation: (inviteId, accept) =>
    api.post(`/api/groups/invitations/${inviteId}`, null, { params: { accept } }),

  leaveGroup: (groupId) =>
    api.delete(`/api/groups/${groupId}/leave`),

  deleteGroup: (groupId) =>
    api.delete(`/api/groups/${groupId}`),

  getInvitations: () => api.get('/api/groups/invitations'), // возвращает List<GroupInvitationDto>
  respondToInvitation: (inviteId, accept) =>
    api.post(`/api/groups/invitations/${inviteId}`, null, { params: { accept } }),
};


export default api;