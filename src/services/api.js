import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://sportsmart-c9kp.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// === Request interceptor: добавляем accessToken ===
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === Переменные для refresh-логики ===
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

// === Response interceptor: перехватываем 401 ===
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            throw new Error("Нет refresh токена");
          }

          const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = res.data;
          localStorage.setItem("accessToken", accessToken);

          isRefreshing = false;
          onRefreshed(accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (err) {
          isRefreshing = false;
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(err);
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// === API endpoints ===
export const authAPI = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  register: (data) =>
    api.post("/api/auth/register", {
      email: data.email,
      username: data.username,
      password: data.password,
    }),
  refresh: (refreshToken) =>
    api.post("/api/auth/refresh", { refreshToken }),
};

export const stepsAPI = {
  uploadSteps: (data, idempotencyKey) =>
    api.post("/api/steps/upload", data, {
      headers: { "Idempotency-Key": idempotencyKey },
    }),
  getDailySteps: (from, to) =>
    api.get("/api/steps/daily", { params: { from, to } }),
  getHistory: (days = 30) =>
    api.get("/api/steps/history", { params: { days } }),
  getFriendsLeaderboard: (date, top = 10) =>
    api.get("/api/steps/leaderboard/friends", { params: { date, top } }),
  getGroupLeaderboard: (groupId, date, top = 10) =>
    api.get(`/api/steps/leaderboard/groups/${groupId}`, {
      params: { date, top },
    }),
};

export const groupsAPI = {
  getGroups: () => api.get("/api/groups"),

  createGroup: ({ name, description = "", isPrivate = false }) =>
    api.post("/api/groups", null, { params: { name, description, isPrivate } }),

  inviteToGroup: (groupId, username) =>
    api.post(`/api/groups/${groupId}/invite/${username}`),

  respondToInvitation: (inviteId, accept) =>
    api.post(`/api/groups/invitations/${inviteId}`, null, {
      params: { accept },
    }),

  leaveGroup: (groupId) => api.delete(`/api/groups/${groupId}/leave`),

  deleteGroup: (groupId) => api.delete(`/api/groups/${groupId}`),

  getInvitations: () => api.get("/api/groups/invitations"),
};

export default api;
