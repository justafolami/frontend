import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

export const stepsAPI = {
  recordSteps: (steps) => api.post("/steps", { steps }),
  getSteps: () => api.get("/steps"),
};

export const rewardsAPI = {
  claimReward: () => api.post("/rewards/claim"),
  getRewards: () => api.get("/rewards"),
};

export default api;
