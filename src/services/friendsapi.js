import api from './api';

export const friendsAPI = {
  // Получение списка друзей
  getFriends: () => api.get('/api/friends'),

  // Отправка запроса на добавление в друзья
  sendRequest: (receiverUsername) =>
    api.post(`/api/friends/request/${receiverUsername}`),

  // Ответ на запрос дружбы
  respondRequest: (requestId, accept) =>
    api.post(`/api/friends/respond/${requestId}`, null, { params: { accept } }),

  // Получение списка pending запросов дружбы
  getRequests: () => api.get('/api/friends/requests'),

  // Leaderboard друзей
  getLeaderboard: (date, top = 10) =>
    api.get('/api/steps/leaderboard/friends', { params: { date, top } }),
};
