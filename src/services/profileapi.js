import api from './api';

export const profileAPI = {
  // Получение информации о текущем пользователе
  getMe: () => api.get('/api/users/me'),

  // Обновление профиля
  updateProfile: (data) => api.patch('/api/users/me', data),
};
