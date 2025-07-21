
import axios from 'axios';
import { useAuthStore } from '@/store/authStore'; // Your Zustand store

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken; // Now correctly getting accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request detected. Logging out user.');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;